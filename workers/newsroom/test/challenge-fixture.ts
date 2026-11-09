/** Synthetic Siteverify transport for local tests only. Never deploy. */
export const CHALLENGE_BINDINGS = { ISSUER_TURNSTILE_SITE_KEY: "synthetic-sitekey",
  ISSUER_SESSION_KEY: "e".repeat(64), ISSUER_TURNSTILE_SECRET: "synthetic-turnstile-secret-not-real" };
export const ADMISSION_KEY = "d".repeat(64);
type Page = { status: number; headers: { get(name: string): string | null }; text(): Promise<string> };
type Init = { method?: string; redirect?: "manual"; headers?: Record<string, string>; body?: string };
export async function solveChallenge<R extends Page>(fetcher: (url: string, init?: Init) => Promise<R>, url: string): Promise<R> {
  const page = await fetcher(url, { redirect: "manual" });
  if (page.status !== 200) return page;
  const html = await page.text();
  const authorization = /name="authorization" value="([^"]+)"/.exec(html)?.[1]?.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
  const cdata = /data-cdata="([a-f0-9]{64})"/.exec(html)?.[1];
  if (!authorization || !cdata) throw new Error("Missing synthetic challenge");
  return fetcher(new URL("/authorize", url).href, { method: "POST", redirect: "manual", headers: {
    "Content-Type": "application/x-www-form-urlencoded", Origin: new URL(url).origin,
    Cookie: page.headers.get("Set-Cookie")!.split(";")[0],
  }, body: new URLSearchParams({ authorization, "cf-turnstile-response": cdata }).toString() });
}
export async function mockSiteverify(request: {text(): Promise<string>}, hostname: string, used: Set<string>) {
  const params = new URLSearchParams(await request.text()), proof = params.get("response")!;
  const success = /^[a-f0-9]{64}$/.test(proof) && !used.has(proof) && params.get("secret") === CHALLENGE_BINDINGS.ISSUER_TURNSTILE_SECRET;
  used.add(proof);
  return Response.json({ success, action: "newsroom_login", hostname, cdata: proof });
}
