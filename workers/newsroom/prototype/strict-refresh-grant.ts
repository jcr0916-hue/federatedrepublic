/**
 * Experimental, unbound Durable Object for strict refresh rotation.
 *
 * NOT imported by src/index.ts, NOT deployed, and NOT connected to the
 * @cloudflare/workers-oauth-provider. No public fetch endpoint is provided.
 *
 * Intended use: one SQLite-backed DO instance per authenticated editor grant,
 * obtained via idFromName(grantId). Only a verified upstream authorization
 * handler should call these RPC methods. No raw refresh token is stored here.
 */
import { DurableObject } from "cloudflare:workers";
import {
  initialRefreshState, revokeRefreshState, rotateRefreshState,
  type RefreshState, type RefreshResult,
} from "./refresh-state.ts";

const RECORD_KEY = "strict-refresh:grant:v1";

export class StrictRefreshGrant extends DurableObject {
  /**
   * Called after verifying issuer, registered client, editor identity, scope,
   * audience, PKCE and consent in the future authorization adapter.
   * Cannot replace an existing grant, including a revoked grant.
   */
  async initialize(tokenHash: string, expiresAt: number, now: number): Promise<boolean> {
    return this.ctx.storage.transactionSync(() => {
      if (this.ctx.storage.kv.get(RECORD_KEY) !== undefined) return false;
      this.ctx.storage.kv.put(RECORD_KEY, initialRefreshState(tokenHash, expiresAt, now));
      return true;
    });
  }

  /**
   * Exactly one concurrent request can consume the current hash.
   * An attempted reuse yields "replay"; no previous-token grace is allowed.
   */
  async rotate(presentedHash: string, successorHash: string, now: number): Promise<RefreshResult> {
    return this.ctx.storage.transactionSync(() => {
      const existing = this.ctx.storage.kv.get<RefreshState>(RECORD_KEY) ?? null;
      const next = rotateRefreshState(existing, presentedHash, successorHash, now);
      if (next.ok) this.ctx.storage.kv.put(RECORD_KEY, next.state);
      return next;
    });
  }

  async revoke(): Promise<boolean> {
    return this.ctx.storage.transactionSync(() => {
      const existing = this.ctx.storage.kv.get<RefreshState>(RECORD_KEY) ?? null;
      const revoked = revokeRefreshState(existing);
      if (!revoked) return false;
      this.ctx.storage.kv.put(RECORD_KEY, revoked);
      return true;
    });
  }
}
