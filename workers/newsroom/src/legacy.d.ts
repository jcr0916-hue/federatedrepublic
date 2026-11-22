import type { LegacyPrincipal } from "./policy.ts";

/** Binding names from the supplied baseline; secret values are never part of source. */
export interface LegacyBindings {
  NEWSROOM: R2Bucket;
  KEY_EDITOR: string;
  KEY_CORINDAL: string;
  KEY_KORDA: string;
  KEY_VAREK: string;
  KEY_FEDERAL: string;
}

export function principal(request: Request, env: LegacyBindings): LegacyPrincipal | null;
export function mcp(request: Request, principal: LegacyPrincipal, env: LegacyBindings): Promise<Response>;
declare const worker: { fetch(request: Request, env: LegacyBindings): Promise<Response> };
export default worker;
