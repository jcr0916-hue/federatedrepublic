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
  start(input: {
    binding: AuthorizationBinding; browserHash: string; upstreamHash: string;
    verifier: string; now: number;
  }): boolean {
    if (!nowIsValid(input.now) || !HASH.test(input.browserHash) ||
        !HASH.test(input.upstreamHash) || !HASH.test(input.verifier) ||
        !CHALLENGE.test(input.binding.challenge) || !input.binding.clientState ||
        input.binding.clientState.length > 1024) return false;
    return this.ctx.storage.transactionSync(() => {
      if (this.ctx.storage.kv.get(KEY) !== undefined) return false;
      this.ctx.storage.kv.put<Pending>(KEY, {
        phase: "upstream", binding: input.binding, browserHash: input.browserHash,
        upstreamHash: input.upstreamHash, verifier: input.verifier, expiresAt: input.now + 300,
      });
      return true;
    });
  }

  /** Commit the single-use callback claim before any external I/O. Failure
   * after this point requires a fresh authorization, including on timeout. */
  claimUpstream(input: {
    browserHash: string; upstreamHash: string; expected: GrantBinding; now: number;
  }): { verifier: string; binding: AuthorizationBinding } | null {
    if (!nowIsValid(input.now)) return null;
    return this.ctx.storage.transactionSync(() => {
      const state = this.ctx.storage.kv.get<State>(KEY);
      if (state?.phase !== "upstream" || state.expiresAt <= input.now ||
          state.browserHash !== input.browserHash || state.upstreamHash !== input.upstreamHash ||
          !bound(state.binding, input.expected) || !state.verifier) return null;
      const verifier = state.verifier;
      state.phase = "claimed";
      delete state.verifier;
      this.ctx.storage.kv.put(KEY, state);
      return { verifier, binding: state.binding };
    });
  }

  /** Only a numeric allowlisted identity verified with GitHub may reach consent.
   * Rotate the browser secret at this authentication boundary. */
  authenticate(input: {
    browserHash: string; verifiedEditorId: string; successorBrowserHash: string;
    csrfHash: string; now: number;
  }): AuthorizationBinding | null {
    if (!nowIsValid(input.now) || !HASH.test(input.successorBrowserHash) ||
        !HASH.test(input.csrfHash) || input.successorBrowserHash === input.browserHash) return null;
    return this.ctx.storage.transactionSync(() => {
      const state = this.ctx.storage.kv.get<State>(KEY);
      if (state?.phase !== "claimed" || state.expiresAt <= input.now ||
          state.browserHash !== input.browserHash ||
          state.binding.editorId !== input.verifiedEditorId) return null;
      state.phase = "consent";
      state.browserHash = input.successorBrowserHash;
      state.csrfHash = input.csrfHash;
      this.ctx.storage.kv.put(KEY, state);
      return state.binding;
    });
  }

  finishConsent(input: {
    browserHash: string; csrfHash: string; approve: boolean; codeHash: string;
    expected: GrantBinding; now: number;
  }): AuthorizationBinding | null {
    if (!nowIsValid(input.now) || !HASH.test(input.codeHash)) return null;
    return this.ctx.storage.transactionSync(() => {
      const state = this.ctx.storage.kv.get<State>(KEY);
      if (state?.phase !== "consent" || state.expiresAt <= input.now ||
          state.browserHash !== input.browserHash || state.csrfHash !== input.csrfHash ||
          !bound(state.binding, input.expected)) return null;
      this.ctx.storage.kv.put<State>(KEY, input.approve ? {
        phase: "code", binding: state.binding, codeHash: input.codeHash,
        expiresAt: input.now + 300,
      } : { phase: "closed" });
      return state.binding;
    });
  }

  /** Redemption and initial token issuance are one synchronous transaction. */
  exchangeCode(input: {
    expected: GrantBinding; codeHash: string; challenge: string; redirectUri: string;
    refreshHash: string; accessHash: string; now: number;
  }): boolean {
    if (!nowIsValid(input.now) || !CHALLENGE.test(input.challenge) ||
        !HASH.test(input.codeHash) || !HASH.test(input.refreshHash) ||
        !HASH.test(input.accessHash) || input.refreshHash === input.accessHash) return false;
    return this.ctx.storage.transactionSync(() => {
      const state = this.ctx.storage.kv.get<State>(KEY);
      if (state?.phase !== "code" || state.expiresAt <= input.now ||
          state.codeHash !== input.codeHash || state.binding.challenge !== input.challenge ||
          state.binding.redirectUri !== input.redirectUri || !bound(state.binding, input.expected)) return false;
      this.ctx.storage.kv.put<Grant>(KEY, {
        clientId: input.expected.clientId, editorId: input.expected.editorId,
        audience: input.expected.audience, phase: "active", accessHash: input.accessHash,
        refreshHash: input.refreshHash, accessExpiresAt: input.now + 900,
        refreshExpiresAt: input.now + 28800, revoked: false,
      });
      return true;
    });
  }

  refresh(input: {
    expected: GrantBinding; presentedHash: string; refreshHash: string;
    accessHash: string; now: number;
  }): boolean {
    if (!nowIsValid(input.now) || !HASH.test(input.presentedHash) ||
        !HASH.test(input.refreshHash) || !HASH.test(input.accessHash) ||
        input.presentedHash === input.refreshHash || input.refreshHash === input.accessHash) return false;
    return this.ctx.storage.transactionSync(() => {
      const state = this.ctx.storage.kv.get<State>(KEY);
      if (state?.phase !== "active" || state.revoked || state.refreshExpiresAt <= input.now ||
          state.refreshHash !== input.presentedHash || !bound(state, input.expected)) return false;
      state.refreshHash = input.refreshHash;
      state.accessHash = input.accessHash;
      state.accessExpiresAt = input.now + 900;
      this.ctx.storage.kv.put(KEY, state);
      return true;
    });
  }

  authorize(input: { expected: GrantBinding; accessHash: string; now: number }): boolean {
    if (!nowIsValid(input.now) || !HASH.test(input.accessHash)) return false;
    const state = this.ctx.storage.kv.get<State>(KEY);
    return state?.phase === "active" && !state.revoked && state.accessExpiresAt > input.now &&
      state.accessHash === input.accessHash && bound(state, input.expected);
  }

  /** A routing ID alone cannot revoke: require a current credential digest. */
  revoke(input: { expected: GrantBinding; credentialHash: string; kind: "access" | "refresh" }): void {
    this.ctx.storage.transactionSync(() => {
      const state = this.ctx.storage.kv.get<State>(KEY);
      if (state?.phase !== "active" || !bound(state, input.expected) ||
          state[input.kind === "access" ? "accessHash" : "refreshHash"] !== input.credentialHash) return;
      state.revoked = true;
      this.ctx.storage.kv.put(KEY, state);
    });
  }
}
