/** Unbound candidate state machine. Only the issuer's internal binding may call it.
 * No synthetic issue/seed/identity shortcuts, public fetch handler, or live bindings.
 */
import { DurableObject } from "cloudflare:workers";

const KEY = "issuer:v1";
const HASH = /^[a-f0-9]{64}$/;
const CHALLENGE = /^[A-Za-z0-9_-]{43}$/;
const nowIsValid = (now: number) => Number.isSafeInteger(now) && now >= 0;

export interface GrantBinding {
  clientId: string;
  editorId: string;
  audience: string;
}
export interface AuthorizationBinding extends GrantBinding {
  redirectUri: string;
  clientState: string;
  challenge: string;
}
interface Pending {
  phase: "upstream" | "claimed" | "consent";
  binding: AuthorizationBinding;
  browserHash: string;
  upstreamHash: string;
  verifier?: string;
  csrfHash?: string;
  expiresAt: number;
}
interface Code {
  phase: "code";
  binding: AuthorizationBinding;
  codeHash: string;
  expiresAt: number;
}
interface Grant extends GrantBinding {
  phase: "active";
  accessHash: string;
  refreshHash: string;
  accessExpiresAt: number;
  refreshExpiresAt: number;
  revoked: boolean;
}
type State = Pending | Code | Grant | { phase: "closed" };
const bound = (stored: GrantBinding, expected: GrantBinding) =>
  stored.clientId === expected.clientId && stored.editorId === expected.editorId &&
  stored.audience === expected.audience;

export class IssuerGrant extends DurableObject {
  /** Persist the transition and its expiration alarm inside one SQLite transaction. */
  async #write(state: State): Promise<void> {
    this.ctx.storage.kv.put(KEY, state);
    const deadline = state.phase === "closed" || (state.phase === "active" && state.revoked)
      ? Date.now() + 1000 : state.phase === "active"
        ? Math.max(state.accessExpiresAt, state.refreshExpiresAt) * 1000 : state.expiresAt * 1000;
    await this.ctx.storage.setAlarm(deadline);
  }

  async alarm(): Promise<void> {
    // Rare storage-only cleanup excludes concurrent transitions while deleteAll
    // removes the complete store. No external I/O runs inside this gate.
    await this.ctx.blockConcurrencyWhile(async () => {
      const state = this.ctx.storage.kv.get<State>(KEY);
      const deadline = !state || state.phase === "closed" || (state.phase === "active" && state.revoked)
        ? 0 : state.phase === "active"
          ? Math.max(state.accessExpiresAt, state.refreshExpiresAt) * 1000 : state.expiresAt * 1000;
      if (deadline > Date.now()) await this.ctx.storage.setAlarm(deadline);
      else await this.ctx.storage.deleteAll();
    });
  }

  async start(input: {
    binding: AuthorizationBinding; browserHash: string; upstreamHash: string;
    verifier: string; now: number;
  }): Promise<boolean> {
    if (!nowIsValid(input.now) || !HASH.test(input.browserHash) ||
        !HASH.test(input.upstreamHash) || !HASH.test(input.verifier) ||
        !CHALLENGE.test(input.binding.challenge) || !input.binding.clientState ||
        input.binding.clientState.length > 1024) return false;
    return this.ctx.storage.transaction(async () => {
      if (this.ctx.storage.kv.get(KEY) !== undefined) return false;
      await this.#write({
        phase: "upstream", binding: input.binding, browserHash: input.browserHash,
        upstreamHash: input.upstreamHash, verifier: input.verifier, expiresAt: input.now + 300,
      });
      return true;
    });
  }

  /** Commit the single-use callback claim before any external I/O. Failure
   * after this point requires a fresh authorization, including on timeout. */
  async claimUpstream(input: {
    browserHash: string; upstreamHash: string; expected: GrantBinding; now: number;
  }): Promise<{ verifier: string; binding: AuthorizationBinding } | null> {
    if (!nowIsValid(input.now)) return null;
    return this.ctx.storage.transaction(async () => {
      const state = this.ctx.storage.kv.get<State>(KEY);
      if (state?.phase !== "upstream" || state.expiresAt <= input.now ||
          state.browserHash !== input.browserHash || state.upstreamHash !== input.upstreamHash ||
          !bound(state.binding, input.expected) || !state.verifier) return null;
      const verifier = state.verifier;
      state.phase = "claimed";
      delete state.verifier;
      await this.#write(state);
      return { verifier, binding: state.binding };
    });
  }

  /** Only a numeric allowlisted identity verified with GitHub may reach consent.
   * Rotate the browser secret at this authentication boundary. */
  async authenticate(input: {
    browserHash: string; verifiedEditorId: string; successorBrowserHash: string;
    csrfHash: string; now: number;
  }): Promise<AuthorizationBinding | null> {
    if (!nowIsValid(input.now) || !HASH.test(input.successorBrowserHash) ||
        !HASH.test(input.csrfHash) || input.successorBrowserHash === input.browserHash) return null;
    return this.ctx.storage.transaction(async () => {
      const state = this.ctx.storage.kv.get<State>(KEY);
      if (state?.phase !== "claimed" || state.expiresAt <= input.now ||
          state.browserHash !== input.browserHash ||
          state.binding.editorId !== input.verifiedEditorId) return null;
      state.phase = "consent";
      state.browserHash = input.successorBrowserHash;
      state.csrfHash = input.csrfHash;
      await this.#write(state);
      return state.binding;
    });
  }

  async finishConsent(input: {
    browserHash: string; csrfHash: string; approve: boolean; codeHash: string;
    expected: GrantBinding; now: number;
  }): Promise<AuthorizationBinding | null> {
    if (!nowIsValid(input.now) || !HASH.test(input.codeHash)) return null;
    return this.ctx.storage.transaction(async () => {
      const state = this.ctx.storage.kv.get<State>(KEY);
      if (state?.phase !== "consent" || state.expiresAt <= input.now ||
          state.browserHash !== input.browserHash || state.csrfHash !== input.csrfHash ||
          !bound(state.binding, input.expected)) return null;
      await this.#write(input.approve ? {
        phase: "code", binding: state.binding, codeHash: input.codeHash,
        expiresAt: input.now + 300,
      } : { phase: "closed" });
      return state.binding;
    });
  }

  /** Redemption and initial token issuance are one SQLite transaction. */
  async exchangeCode(input: {
    expected: GrantBinding; codeHash: string; challenge: string; redirectUri: string;
    refreshHash: string; accessHash: string; now: number;
  }): Promise<boolean> {
    if (!nowIsValid(input.now) || !CHALLENGE.test(input.challenge) ||
        !HASH.test(input.codeHash) || !HASH.test(input.refreshHash) ||
        !HASH.test(input.accessHash) || input.refreshHash === input.accessHash) return false;
    return this.ctx.storage.transaction(async () => {
      const state = this.ctx.storage.kv.get<State>(KEY);
      if (state?.phase !== "code" || state.expiresAt <= input.now ||
          state.codeHash !== input.codeHash || state.binding.challenge !== input.challenge ||
          state.binding.redirectUri !== input.redirectUri || !bound(state.binding, input.expected)) return false;
      await this.#write({
        clientId: input.expected.clientId, editorId: input.expected.editorId,
        audience: input.expected.audience, phase: "active", accessHash: input.accessHash,
        refreshHash: input.refreshHash, accessExpiresAt: input.now + 900,
        refreshExpiresAt: input.now + 28800, revoked: false,
      });
      return true;
    });
  }

  async refresh(input: {
    expected: GrantBinding; presentedHash: string; refreshHash: string;
    accessHash: string; now: number;
  }): Promise<boolean> {
    if (!nowIsValid(input.now) || !HASH.test(input.presentedHash) ||
        !HASH.test(input.refreshHash) || !HASH.test(input.accessHash) ||
        input.presentedHash === input.refreshHash || input.refreshHash === input.accessHash) return false;
    return this.ctx.storage.transaction(async () => {
      const state = this.ctx.storage.kv.get<State>(KEY);
      if (state?.phase !== "active" || state.revoked || state.refreshExpiresAt <= input.now ||
          state.refreshHash !== input.presentedHash || !bound(state, input.expected)) return false;
      state.refreshHash = input.refreshHash;
      state.accessHash = input.accessHash;
      state.accessExpiresAt = input.now + 900;
      await this.#write(state);
      return true;
    });
  }

  authorize(input: { expected: GrantBinding; accessHash: string; now: number }): boolean {
    return this.inspect(input) !== null;
  }

  inspect(input: { expected: GrantBinding; accessHash: string; now: number }): { expiresAt: number } | null {
    if (!nowIsValid(input.now) || !HASH.test(input.accessHash)) return null;
    const state = this.ctx.storage.kv.get<State>(KEY);
    return state?.phase === "active" && !state.revoked && state.accessExpiresAt > input.now &&
      state.accessHash === input.accessHash && bound(state, input.expected) ? { expiresAt: state.accessExpiresAt } : null;
  }

  /** A routing ID alone cannot revoke: require a current credential digest. */
  async revoke(input: { expected: GrantBinding; credentialHash: string; kind: "access" | "refresh" }): Promise<void> {
    await this.ctx.storage.transaction(async () => {
      const state = this.ctx.storage.kv.get<State>(KEY);
      if (state?.phase !== "active" || !bound(state, input.expected) ||
          state[input.kind === "access" ? "accessHash" : "refreshHash"] !== input.credentialHash) return;
      state.revoked = true;
      await this.#write(state);
    });
  }
}
