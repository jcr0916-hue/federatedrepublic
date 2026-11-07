/**
 * LOCAL PROTOTYPE ONLY — synthetic token lifecycle, not an OAuth server.
 * Strictly isolated from the release entrypoint and legacy credentials.
 * All token arguments are SHA-256 digests; raw tokens never enter storage.
 * A real issuer must authenticate the editor and client BEFORE calling issue.
 */
import { DurableObject } from "cloudflare:workers";

const KEY = "synthetic:grant:v1";
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
