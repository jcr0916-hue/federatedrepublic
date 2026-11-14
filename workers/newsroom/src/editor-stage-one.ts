declare const EDITOR_STAGE_ONE_BUILD: boolean;

// The separate build stays closed if its time window is missing or invalid.
export const editorStageOne = typeof EDITOR_STAGE_ONE_BUILD !== "undefined" && EDITOR_STAGE_ONE_BUILD;
export const isolatedEditor = {
  issuer: "https://newsroom-editor-isolated-issuer-20261111.jcr0916.workers.dev",
  audience: "https://newsroom-editor-isolated-gateway-20261111.jcr0916.workers.dev/mcp",
  clientId: "editor-chatgpt-isolated-20261111",
  upstream: "https://newsroom-editor-isolated-synthetic-20261111.jcr0916.workers.dev/mcp",
};

export interface StageOneEnv {
  EDITOR_STAGE_ONE_EXPIRES_AT?: string;
}

export function stageOneDeadline(env: StageOneEnv, now = Date.now()): number | undefined {
  const value = env.EDITOR_STAGE_ONE_EXPIRES_AT;
  if (typeof value !== "string" || !/^\d{13}$/.test(value)) return undefined;
  const deadline = Number(value);
  const seconds = Math.floor(deadline / 1000);
  return deadline - now <= 300_000 && seconds > Math.floor(now / 1000) ? seconds : undefined;
}

export function stageOneContext(context: string, deadline?: number): string {
  return deadline === undefined ? context : context + "\nstage-one:" + deadline;
}

export function stageOneClosed(): Response {
  return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
}

const clientAuthMethods = ["basic", "post", "missing", "unsupported", "multiple", "unclassified"] as const;
const clientAuthReasons = [
  "accepted", "missing_credentials", "missing_client_id", "missing_secret", "client_id_mismatch",
  "invalid_secret_format", "secret_mismatch", "invalid_authorization_header", "basic_rejected",
  "multiple_methods", "duplicate_parameters",
] as const;
export type ClientAuthMethod = typeof clientAuthMethods[number];
type ClientAuthReason = typeof clientAuthReasons[number];
export type ClientAuthFailure = Exclude<ClientAuthReason, "accepted">;
type Step = "token" | "mcp" | "tools_list" | "newsroom_list" | "newsroom_read";

export function stageOneEvent(step: Step, status: number): void {
  if (editorStageOne) console.log(JSON.stringify({ schema: "newsroom.editor.stage-one.v1", step, status }));
}

export function stageOneClientAuth(status: 200 | 400 | 401, method: ClientAuthMethod, reason: ClientAuthReason): void {
  if (!editorStageOne || ![200, 400, 401].includes(status) ||
      !clientAuthMethods.includes(method) || !clientAuthReasons.includes(reason)) return;
  console.log(JSON.stringify({ schema: "newsroom.editor.stage-one.v1", step: "token_client_auth", status, method, reason }));
}
