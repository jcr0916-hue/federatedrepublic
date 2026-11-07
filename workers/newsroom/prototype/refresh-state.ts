/**
 * Experimental refresh lineage policy — no OAuth provider integration.
 * Hash raw refresh credentials before reaching this module. Never log tokens.
 */
export type RefreshState = {
  readonly generation: number;
  readonly currentHash: string;
  readonly expiresAt: number;
  readonly revoked: boolean;
};

export type RefreshResult =
  | { readonly ok: true; readonly state: RefreshState }
  | { readonly ok: false; readonly reason: "missing" | "revoked" | "expired" | "replay" | "invalid" };

const SHA256_HEX = /^[0-9a-f]{64}$/;

export function initialRefreshState(hash: string, expiresAt: number, now: number): RefreshState {
  if (!SHA256_HEX.test(hash) || !Number.isSafeInteger(expiresAt) || expiresAt <= now ||
      !Number.isSafeInteger(now) || now < 0) {
    throw new Error("invalid_initial_refresh_state");
  }
  return { generation: 0, currentHash: hash, expiresAt, revoked: false };
}

/** Must execute INSIDE one serialized, durable storage transaction. */
export function rotateRefreshState(
  current: RefreshState | null,
  presentedHash: string,
  successorHash: string,
  now: number,
): RefreshResult {
  if (!SHA256_HEX.test(presentedHash) || !SHA256_HEX.test(successorHash) ||
      presentedHash === successorHash || !Number.isSafeInteger(now) || now < 0) {
    return { ok: false, reason: "invalid" };
  }
  if (!current) return { ok: false, reason: "missing" };
  if (current.revoked) return { ok: false, reason: "revoked" };
  if (current.expiresAt <= now) return { ok: false, reason: "expired" };
  if (current.currentHash !== presentedHash) return { ok: false, reason: "replay" };
  return {
    ok: true,
    state: { ...current, generation: current.generation + 1, currentHash: successorHash },
  };
}

export function revokeRefreshState(current: RefreshState | null): RefreshState | null {
  return current ? { ...current, revoked: true } : null;
}
