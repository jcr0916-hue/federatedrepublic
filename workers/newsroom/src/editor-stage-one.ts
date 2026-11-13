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

export type ClientAuthMethod = "basic" | "post" | "missing" | "unsupported" | "multiple";
type Step = "token_client_auth" | "token" | "mcp" | "tools_list" | "newsroom_list" | "newsroom_read";

export function stageOneEvent(step: Step, status: number, method?: ClientAuthMethod): void {
  if (editorStageOne) console.log(JSON.stringify({ schema: "newsroom.editor.stage-one.v1", step, status, method }));
}
