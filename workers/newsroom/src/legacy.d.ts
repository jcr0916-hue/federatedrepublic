import type { LegacyPrincipal } from "./policy.ts";
import type { NewsroomReadStorage } from "./readonly-storage.ts";

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
/** Restricted storage supports the read handlers. Legacy callers that need
 * submission/review continue to supply their complete R2 binding. */
export function mcp(request: Request, principal: LegacyPrincipal, env: { NEWSROOM: NewsroomReadStorage | R2Bucket }): Promise<Response>;
declare const worker: { fetch(request: Request, env: LegacyBindings): Promise<Response> };
export default worker;
