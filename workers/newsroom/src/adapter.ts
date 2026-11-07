import legacy, { principal, mcp, type LegacyBindings } from "./legacy.js";
import type { LegacyAdapter } from "./oauth.ts";
import type { OAuthBindings } from "./policy.ts";

export interface NewsroomEnv extends OAuthBindings, LegacyBindings {}

/** Reuse original authorization, routing and storage handlers without recreating them. */
export const legacyAdapter: LegacyAdapter<NewsroomEnv> = {
  principal,
  fetch: (request, env) => legacy.fetch(request, env),
  mcp: (request, env, _ctx, who) => mcp(request, who, env),
};
