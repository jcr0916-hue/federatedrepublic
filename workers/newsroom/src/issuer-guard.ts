import { DurableObject } from "cloudflare:workers";

export type GuardBucket = "authorize" | "token" | "introspect" | "revoke";
const LIMITS: Record<GuardBucket, number> = { authorize: 60, token: 240, introspect: 1200, revoke: 120 };
interface Window { startedAt: number; count: number }

/** Coarse, authoritative per-registered-client budget. It bounds new grants and
 * expensive grant RPC, including bad credential attempts. It is not a bot/WAF substitute.
 * Only the issuer may select a registered client or invoke these internal methods.
 */
export class IssuerGuard extends DurableObject {
  async admit(bucket: GuardBucket, now: number): Promise<{ allowed: boolean; retryAfter: number }> {
    if (!Object.hasOwn(LIMITS, bucket) || !Number.isSafeInteger(now) || now < 0)
      return { allowed: false, retryAfter: 60 };
    return this.ctx.storage.transaction(async () => {
      const stored = this.ctx.storage.kv.get<Window>(bucket);
      const window = !stored || now >= stored.startedAt + 60_000
        ? { startedAt: now, count: 0 } : stored;
      // Do not let a backwards clock reset or extend the admitted budget.
      if (now < window.startedAt) return { allowed: false, retryAfter: 60 };
      const retryAfter = Math.max(1, Math.ceil((window.startedAt + 60_000 - now) / 1000));
      if (window.count >= LIMITS[bucket]) return { allowed: false, retryAfter };
      window.count++;
      this.ctx.storage.kv.put(bucket, window);
      // State and alarm use the same SQLite storage transaction.
      await this.ctx.storage.setAlarm(now + 60_000);
      return { allowed: true, retryAfter: 0 };
    });
  }

  async alarm(): Promise<void> {
    await this.ctx.blockConcurrencyWhile(async () => {
      const now = Date.now();
      let next = 0;
      for (const bucket of Object.keys(LIMITS) as GuardBucket[]) {
        const value = this.ctx.storage.kv.get<Window>(bucket);
        if (value && value.startedAt + 60_000 > now) next = Math.max(next, value.startedAt + 60_000);
      }
      if (next) await this.ctx.storage.setAlarm(next);
      else await this.ctx.storage.deleteAll();
    });
  }
}
