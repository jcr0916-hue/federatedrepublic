/**
 * LOCAL PROTOTYPE ONLY — synthetic token lifecycle, not an OAuth server.
 * Strictly isolated from the release entrypoint and legacy credentials.
 * All token arguments are SHA-256 digests; raw tokens never enter storage.
 * A real issuer must authenticate the editor and client BEFORE calling issue.
 */
import { DurableObject } from "cloudflare:workers";

const KEY = "synthetic:grant:v1";
const CODE_KEY = "synthetic:authorization-code:v1";
const CONSENT_KEY = "synthetic:pending-consent:v1";
const PKCE = /^[A-Za-z0-9_-]{43}$/;
const FIXED_REDIRECT = "https://chatgpt.invalid/oauth/callback";

interface AuthorizationCodeState {
  codeHash: string;
  challenge: string;
  clientId: string;
  audience: string;
  scope: string[];
  redirectUri: string;
  expiresAt: number;
  consumed: boolean;
}

interface PendingConsent {
  browserHash: string;
  stateHash: string;
  challenge: string;
  clientId: string;
  audience: string;
  redirectUri: string;
  scopes: string[];
  expiresAt: number;
  consumed: boolean;
}

const HEX = /^[0-9a-f]{64}$/;
const READ = "newsroom:read";
const REVIEW = "newsroom:review";

interface RecordState {
  clientId: string;
  editorId: string;
  audience: string;
  scopes: string[];
  refreshHash: string;
  refreshExpiresAt: number;
  accessHash: string;
  accessExpiresAt: number;
  generation: number;
  revoked: boolean;
}
type Result = { ok: true; generation: number } |
  { ok: false; error: "invalid_request" | "invalid_grant" | "expired" | "replay" | "revoked" };

const valid = (value: string) => HEX.test(value);
const clock = (now: number) => Number.isSafeInteger(now) && now >= 0;

export class SyntheticOAuthGrant extends DurableObject {
  async issue(input: {
    clientId: string; editorId: string; audience: string; scopes: string[];
    refreshHash: string; accessHash: string; now: number;
    refreshTTL: number; accessTTL: number;
  }): Promise<Result> {
    if (!valid(input.refreshHash) || !valid(input.accessHash) ||
        input.refreshHash === input.accessHash || !clock(input.now) ||
        !input.clientId || !input.editorId || !input.audience ||
        input.accessTTL < 1 || input.accessTTL > 900 ||
        input.refreshTTL < 1 || input.refreshTTL > 28800 ||
        !Array.isArray(input.scopes) || !input.scopes.includes(READ) ||
        input.scopes.some(s => s !== READ && s !== REVIEW) ||
        new Set(input.scopes).size !== input.scopes.length) {
      return { ok: false, error: "invalid_request" };
    }
    return this.ctx.storage.transactionSync(() => {
      if (this.ctx.storage.kv.get(KEY) !== undefined) return { ok: false, error: "invalid_grant" };
      const record: RecordState = {
        clientId: input.clientId, editorId: input.editorId, audience: input.audience,
        scopes: input.scopes, refreshHash: input.refreshHash,
        accessHash: input.accessHash, generation: 0, revoked: false,
        refreshExpiresAt: input.now + input.refreshTTL,
        accessExpiresAt: input.now + input.accessTTL,
      };
      this.ctx.storage.kv.put(KEY, record);
      return { ok: true, generation: 0 };
    });
  }

  /** Start a single test-only browser transaction. Cookies and OAuth state are hashed.
   * Do not expose this DO method to a client-chosen grant or unauthenticated endpoint. */
  async startConsent(input: {
    browserHash: string; stateHash: string; challenge: string;
    clientId: string; audience: string; redirectUri: string;
    scopes: string[]; now: number; ttl: number;
  }): Promise<boolean> {
    if (!valid(input.browserHash) || !valid(input.stateHash) ||
        input.browserHash === input.stateHash || !PKCE.test(input.challenge) ||
        !input.clientId || !input.audience || input.redirectUri !== FIXED_REDIRECT ||
        input.scopes.length !== 1 || input.scopes[0] !== READ || !clock(input.now) ||
        !Number.isSafeInteger(input.ttl) || input.ttl < 1 || input.ttl > 300) return false;
    return this.ctx.storage.transactionSync(() => {
      if (this.ctx.storage.kv.get(CONSENT_KEY) !== undefined ||
          this.ctx.storage.kv.get(CODE_KEY) !== undefined ||
          this.ctx.storage.kv.get(KEY) !== undefined) return false;
      const record: PendingConsent = {
        browserHash: input.browserHash, stateHash: input.stateHash,
        challenge: input.challenge, clientId: input.clientId,
        audience: input.audience, redirectUri: input.redirectUri,
        scopes: [...input.scopes], expiresAt: input.now + input.ttl, consumed: false,
      };
      this.ctx.storage.kv.put(CONSENT_KEY, record);
      return true;
    });
  }

  /** Called ONLY after a trusted identity provider has verified the editor.
   * Records one-time consent consumption and creates the code atomically. */
  async finishConsent(input: {
    browserHash: string; stateHash: string; verifiedEditorId: string;
    expectedEditorId: string; decision: "approve" | "deny";
    codeHash: string; now: number;
  }): Promise<boolean> {
    if (!valid(input.browserHash) || !valid(input.stateHash) ||
        !valid(input.codeHash) || !clock(input.now) ||
        !input.expectedEditorId || input.verifiedEditorId !== input.expectedEditorId ||
        !["approve", "deny"].includes(input.decision)) return false;
    return this.ctx.storage.transactionSync(() => {
      const pending = this.ctx.storage.kv.get<PendingConsent>(CONSENT_KEY);
      if (!pending || pending.consumed || pending.expiresAt <= input.now ||
          pending.browserHash !== input.browserHash ||
          pending.stateHash !== input.stateHash ||
          this.ctx.storage.kv.get(CODE_KEY) !== undefined ||
          this.ctx.storage.kv.get(KEY) !== undefined) return false;
      pending.consumed = true;
      this.ctx.storage.kv.put(CONSENT_KEY, pending);
      if (input.decision === "deny") return false;
      const record: AuthorizationCodeState = {
        codeHash: input.codeHash, challenge: pending.challenge,
        clientId: pending.clientId, audience: pending.audience,
        scope: [...pending.scopes], redirectUri: pending.redirectUri,
        expiresAt: input.now + 300, consumed: false,
      };
      this.ctx.storage.kv.put(CODE_KEY, record);
      return true;
    });
  }

  /** A synthetic consent/identity gate calls this method after approval.
   * Not a user-facing authorize endpoint. No raw code is persisted. */
  async beginCode(input: {
    codeHash: string; challenge: string; clientId: string; audience: string;
    redirectUri: string; scopes: string[]; now: number; ttl: number;
  }): Promise<boolean> {
    if (!valid(input.codeHash) || !PKCE.test(input.challenge) ||
        !input.clientId || !input.audience || input.redirectUri !== FIXED_REDIRECT ||
        !Array.isArray(input.scopes) || input.scopes.length !== 1 ||
        input.scopes[0] !== READ || !clock(input.now) ||
        !Number.isSafeInteger(input.ttl) || input.ttl < 1 || input.ttl > 300) return false;
    return this.ctx.storage.transactionSync(() => {
      if (this.ctx.storage.kv.get(CODE_KEY) !== undefined ||
          this.ctx.storage.kv.get(KEY) !== undefined) return false;
      const authorization: AuthorizationCodeState = {
        codeHash: input.codeHash, challenge: input.challenge, clientId: input.clientId,
        audience: input.audience, redirectUri: input.redirectUri,
        scope: [...input.scopes], expiresAt: input.now + input.ttl, consumed: false,
      };
      this.ctx.storage.kv.put(CODE_KEY, authorization);
      return true;
    });
  }

  /** Both code consumption and grant creation commit in one SQLite DO transaction.
   * The caller must verify S256/verifier syntax and hash the issued tokens. */
  async exchangeCode(input: {
    codeHash: string; computedChallenge: string; clientId: string;
    audience: string; redirectUri: string; editorId: string;
    refreshHash: string; accessHash: string; now: number;
    refreshTTL: number; accessTTL: number;
  }): Promise<Result> {
    if (!valid(input.codeHash) || !PKCE.test(input.computedChallenge) ||
        !valid(input.refreshHash) || !valid(input.accessHash) ||
        input.refreshHash === input.accessHash || !clock(input.now) ||
        !input.editorId || input.accessTTL < 1 || input.accessTTL > 900 ||
        input.refreshTTL < 1 || input.refreshTTL > 28800) {
      return { ok: false, error: "invalid_request" };
    }
    return this.ctx.storage.transactionSync(() => {
      const auth = this.ctx.storage.kv.get<AuthorizationCodeState>(CODE_KEY);
      if (!auth || auth.consumed || this.ctx.storage.kv.get(KEY) !== undefined ||
          auth.codeHash !== input.codeHash || auth.challenge !== input.computedChallenge ||
          auth.clientId !== input.clientId || auth.audience !== input.audience ||
          auth.redirectUri !== input.redirectUri || auth.expiresAt <= input.now) {
        return { ok: false, error: "invalid_grant" };
      }
      const record: RecordState = {
        clientId: auth.clientId, editorId: input.editorId,
        audience: auth.audience, scopes: [...auth.scope],
        refreshHash: input.refreshHash, accessHash: input.accessHash,
        refreshExpiresAt: input.now + input.refreshTTL,
        accessExpiresAt: input.now + input.accessTTL,
        generation: 0, revoked: false,
      };
      auth.consumed = true;
      this.ctx.storage.kv.put(CODE_KEY, auth);
      this.ctx.storage.kv.put(KEY, record);
      return { ok: true, generation: 0 };
    });
  }

  async refresh(input: {
    clientId: string; presentedHash: string; successorHash: string;
    accessHash: string; now: number; accessTTL: number;
  }): Promise<Result> {
    if (!valid(input.presentedHash) || !valid(input.successorHash) ||
        !valid(input.accessHash) || input.presentedHash === input.successorHash ||
        input.successorHash === input.accessHash || !clock(input.now) ||
        input.accessTTL < 1 || input.accessTTL > 900) {
      return { ok: false, error: "invalid_request" };
    }
    return this.ctx.storage.transactionSync(() => {
      const record = this.ctx.storage.kv.get<RecordState>(KEY);
      if (!record || record.clientId !== input.clientId) return { ok: false, error: "invalid_grant" };
      if (record.revoked) return { ok: false, error: "revoked" };
      if (record.refreshExpiresAt <= input.now) return { ok: false, error: "expired" };
      if (record.refreshHash !== input.presentedHash) return { ok: false, error: "replay" };
      record.refreshHash = input.successorHash;
      record.accessHash = input.accessHash;
      record.accessExpiresAt = input.now + input.accessTTL;
      record.generation += 1;
      this.ctx.storage.kv.put(KEY, record);
      return { ok: true, generation: record.generation };
    });
  }

  async authorize(input: {
    clientId: string; accessHash: string; audience: string;
    requiredScope: string; now: number;
  }): Promise<boolean> {
    if (!valid(input.accessHash) || !clock(input.now)) return false;
    const record = this.ctx.storage.kv.get<RecordState>(KEY);
    return !!record && !record.revoked && record.clientId === input.clientId &&
      record.accessHash === input.accessHash && record.accessExpiresAt > input.now &&
      record.audience === input.audience && record.scopes.includes(input.requiredScope);
  }

  async revoke(): Promise<boolean> {
    return this.ctx.storage.transactionSync(() => {
      const record = this.ctx.storage.kv.get<RecordState>(KEY);
      if (!record) return false;
      record.revoked = true;
      this.ctx.storage.kv.put(KEY, record);
      return true;
    });
  }
}
