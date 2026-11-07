/** LOCAL TEST FIXTURE ONLY. This HTTP surface must never be deployed. */
export { StrictRefreshGrant } from "./strict-refresh-grant.ts";

interface FixtureEnv {
  REFRESH_GRANTS: DurableObjectNamespace<import("./strict-refresh-grant.ts").StrictRefreshGrant>;
}

export default {
  async fetch(request: Request, env: FixtureEnv): Promise<Response> {
    const params = await request.json() as {
      grant?: string; operation?: string; tokenHash?: string;
      presentedHash?: string; successorHash?: string;
      expiresAt?: number; now?: number;
    };
    const name = params.grant ?? "test-grant";
    const stub = env.REFRESH_GRANTS.get(env.REFRESH_GRANTS.idFromName(name));
    switch (params.operation) {
      case "init":
        return Response.json({ initialized: await stub.initialize(
          params.tokenHash!, params.expiresAt!, params.now!,
        ) });
      case "rotate":
        return Response.json(await stub.rotate(params.presentedHash!, params.successorHash!, params.now!));
      case "revoke":
        return Response.json({ revoked: await stub.revoke() });
      default:
        return Response.json({ error: "unsupported" }, { status: 400 });
    }
  },
};
