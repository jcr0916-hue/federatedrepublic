/** Cheap rejection of fabricated access credentials before any service/DO call.
 * This MAC is admission only: EVERY admitted request still needs authoritative
 * introspection. Independent, high-entropy key shared only by issuer/resource.
 */
import { mintBoundCredential, type CredentialKind } from "../prototype/issuer-boundary.ts";
const encoder = new TextEncoder();
const HEX = /^[a-f0-9]{64}$/;
const bytes = (hex: string) => Uint8Array.from(hex.match(/../g)!, pair => parseInt(pair, 16));
async function key(raw: string, usage: KeyUsage) {
  if (typeof raw !== "string" || !HEX.test(raw)) throw new Error("admission_not_configured");
  return crypto.subtle.importKey("raw", bytes(raw), { name: "HMAC", hash: "SHA-256" }, false, [usage]);
}
const message = (core: string, context: string) => encoder.encode("newsroom-access-admission:v1\n" + context + "\n" + core);
export const accessContext = (issuer: string, client: string, audience: string) => [issuer, client, audience].join("\n");
export async function mintAdmittedCredential(grantId: string, kind: CredentialKind, secret: string, context: string,
  expiresAt = Math.floor(Date.now() / 1000) + (kind === "access" ? 900 : 300)): Promise<string> {
  if (!Number.isSafeInteger(expiresAt) || expiresAt < 0) throw new Error("invalid_admission_expiry");
  const core = mintBoundCredential(grantId, kind) + "." + expiresAt;
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", await key(secret, "sign"), message(core, context)));
  return core + "." + Array.from(signature, n => n.toString(16).padStart(2, "0")).join("");
}
export async function verifyCredentialAdmission(raw: string, tag: string, secret: string, context: string): Promise<boolean> {
  const parts = raw.split(".");
  if (parts.length !== 5 || parts[0] !== tag || ![parts[1], parts[2], parts[4]].every(p => HEX.test(p)) ||
      !/^[0-9]{1,12}$/.test(parts[3]) || Number(parts[3]) <= Date.now() / 1000) return false;
  return crypto.subtle.verify("HMAC", await key(secret, "verify"), bytes(parts[4]), message(parts.slice(0, 4).join("."), context));
}

export const mintAdmittedAccess = (grantId: string, secret: string, context: string) =>
  mintAdmittedCredential(grantId, "access", secret, context);
export const verifyAccessAdmission = (raw: string, secret: string, context: string) =>
  verifyCredentialAdmission(raw, "nr1a", secret, context);
