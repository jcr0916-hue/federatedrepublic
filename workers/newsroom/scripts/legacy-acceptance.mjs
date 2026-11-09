/** Repeatable HTTP acceptance runner, never a Worker entrypoint. The caller
 * supplies disposable credentials in memory. Returns only non-secret results.
 * Refuses production and the preserved OAuth acceptance hostnames. */
export async function runLegacyAcceptance(origin, credentials, transport = fetch) {
  const url = new URL(origin);
  if (url.origin !== origin || url.protocol !== "https:" ||
      !(url.hostname === "newsroom.example" ||
        /^newsroom-legacy-isolation-[a-z0-9-]+\.[a-z0-9-]+\.workers\.dev$/.test(url.hostname)))
    throw new Error("acceptance_target_not_isolated");
  const desks = ["corindal", "korda", "varek", "federal"];
  if (![...desks, "editorial"].every(desk => typeof credentials[desk] === "string" && credentials[desk].length >= 24) ||
      new Set(Object.values(credentials)).size !== 5) throw new Error("invalid_disposable_credentials");
  let checks = 0;
  const check = (condition, name) => { if (!condition) throw new Error("acceptance_failed:" + name); checks++; };
  const request = (path, desk, method = "GET", data) => transport(origin + path, {
    method, redirect: "manual", signal: AbortSignal.timeout(15_000),
    headers: { "Content-Type": "application/json", ...(desk ? { Authorization: "Bearer " + credentials[desk] } : {}) },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  const rpc = async (desk, name, args = {}, denied = false) => {
    const response = await request("/mcp", desk, "POST", {
      jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args },
    });
    check(response.status === 200, "mcp_http_status");
    const result = (await response.json()).result;
    check(result?.isError === denied, denied ? "mcp_denial" : "mcp_success");
    return denied ? null : JSON.parse(result.content[0].text);
  };
  check((await request("/mcp", null, "POST", {})).status === 401, "anonymous_denied");
  check((await request("/v1/list", null)).status === 401, "anonymous_rest_denied");
  const records = [];
  for (const desk of desks) {
    const before = await rpc(desk, "newsroom_list", { desk: "all" });
    check(before.items.length === 0, "fresh_synthetic_bucket");
    const created = await rpc(desk, "newsroom_submit", {
      title: "NONCANONICAL infrastructure acceptance — " + desk, kind: "report",
      body: "Synthetic infrastructure test. Never publish or advance fictional time.",
      summary: "Disposable acceptance fixture", desk: "editorial", editor: true,
      status: "ACCEPTED", nonCanonical: false, id: "forged", key: "status/forged.json",
    });
    check(created.desk === desk && created.status === "PROPOSED", "submission_identity_pinned");
    check(created.key.startsWith("submissions/" + desk + "/"), "submission_key_pinned");
    records.push(created);
  }
  for (const desk of desks) {
    const own = records.find(record => record.desk === desk);
    const page = await rpc(desk, "newsroom_list", { desk: "all", editor: true, prefix: "submissions/" });
    check(page.items.length === 1 && page.items[0].desk === desk, "list_desk_isolation");
    const ownRead = await rpc(desk, "newsroom_read", { key: own.key });
    check(ownRead.nonCanonical === true && ownRead.status === "PROPOSED", "unpublished_invariant");
    for (const foreign of records.filter(record => record.desk !== desk)) {
      await rpc(desk, "newsroom_read", { key: foreign.key, desk: foreign.desk, editor: true }, true);
      check((await request("/v1/read?key=" + encodeURIComponent(foreign.key), desk)).status === 400, "rest_cross_desk_denied");
    }
    for (const key of ["status/" + own.id + ".json", own.key.replace("/" + desk + "/", "/" + desk + "/../federal/"),
      own.key.replace(desk, desk + "-extra")]) await rpc(desk, "newsroom_read", { key }, true);
    await rpc(desk, "newsroom_review", { key: own.key, status: "ACCEPTED", note: "forged editor", editor: true }, true);
    check((await request("/v1/review", desk, "POST", { key: own.key, status: "ACCEPTED", note: "forged" })).status === 400,
      "rest_agent_review_denied");
    await rpc(desk, "newsroom_publish", { key: own.key }, true);
  }
  const editorial = await rpc("editorial", "newsroom_list", { desk: "all", limit: 100 });
  check(editorial.items.length === 4 && new Set(editorial.items.map(item => item.desk)).size === 4, "editor_cross_desk_read");
  const selected = records.find(record => record.desk === "korda");
  await rpc("editorial", "newsroom_review", { key: selected.key, status: "ACCEPTED",
    note: "Synthetic acceptance only. GitHub publication requires separate approval." });
  const reviewed = await rpc("editorial", "newsroom_read", { key: selected.key });
  check(reviewed.status === "ACCEPTED" && reviewed.nonCanonical === true, "acceptance_is_not_publication");
  check(typeof reviewed.editorialNote === "string", "editor_review_overlay");
  const agentView = await rpc("korda", "newsroom_read", { key: selected.key });
  check(agentView.status === "PROPOSED" && !Object.hasOwn(agentView, "editorialNote"), "preserved_agent_view");
  await rpc("editorial", "newsroom_publish", { key: selected.key }, true);
  check((await request("/v1/publish", "editorial", "POST", { key: selected.key })).status === 404, "publication_route_absent");
  return { passed: true, checks, desks, syntheticSubmissions: records.length,
    agentReviewDenied: true, crossDeskReadDenied: true, editorialReadAndReview: true, publicationDenied: true };
}
