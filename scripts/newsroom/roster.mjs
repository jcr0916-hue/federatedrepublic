export const ROSTER_PATH = "docs/torenthia/agents/roster.json";
const agentsRoot = "docs/torenthia/agents";
const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const budgetFields = ["maxCalls", "maxInputTokens", "maxOutputTokens", "maxSeconds", "maxCostCents"];

export function check(condition, message) {
  if (!condition) throw new Error(message);
}

export function checkFields(value, required, optional, label) {
  check(value && typeof value === "object" && !Array.isArray(value), `${label} must be an object`);
  check(required.every((key) => Object.hasOwn(value, key)), `${label} has missing fields`);
  check(Object.keys(value).every((key) => required.includes(key) || optional.includes(key)),
    `${label} has unsupported fields`);
}

function isId(value) {
  return typeof value === "string" && value.length <= 30 && /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value);
}

export function isText(value, max) {
  return typeof value === "string" && value.isWellFormed() && !value.includes("\0")
    && value.length <= max && value.trim().length > 0;
}

function isInteger(value, min, max = Number.MAX_SAFE_INTEGER) {
  return Number.isSafeInteger(value) && value >= min && value <= max;
}

export function isGitSha(value) {
  return typeof value === "string" && /^[a-f0-9]{40}$/.test(value);
}

export function utcDate(value) {
  check(typeof value === "string" && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(value),
    "Expected an ISO date and time in UTC");
  const normalized = value.includes(".") ? value : value.replace("Z", ".000Z");
  const date = new Date(normalized);
  check(Number.isFinite(date.getTime()) && date.toISOString() === normalized, "Invalid UTC date and time");
  return date;
}

export function validateRoster(roster) {
  checkFields(roster, ["schemaVersion", "automationEnabled", "dispatchLimits", "agents"], [], "Roster");
  check(roster.schemaVersion === 1, "Unsupported roster schema");
  check(typeof roster.automationEnabled === "boolean", "automationEnabled must be a boolean");
  checkFields(roster.dispatchLimits, ["maxAgentsPerSlot", "maxCostCentsPerSlot"], [], "Dispatch limits");
  check(isInteger(roster.dispatchLimits.maxAgentsPerSlot, 1)
    && isInteger(roster.dispatchLimits.maxCostCentsPerSlot, 1), "Invalid dispatch limits");
  check(Array.isArray(roster.agents) && roster.agents.length > 0, "Roster needs at least one agent");

  const ids = new Set();
  const desks = new Set();
  for (const agent of roster.agents) {
    checkFields(agent, [
      "id", "jurisdiction", "inboxDesk", "workspacePath", "allowedWrites", "enabled", "cadence", "model", "budget",
    ], [], "Agent");
    check(isId(agent.id), "Invalid agent id");
    const label = `Agent ${agent.id}`;
    check(!ids.has(agent.id), `${label} is listed twice`);
    ids.add(agent.id);
    check(isText(agent.jurisdiction, 100), `${label} needs a jurisdiction or desk name`);
    check(agent.inboxDesk === null || (isId(agent.inboxDesk) && /^[a-z]+(?:-[a-z]+)*$/.test(agent.inboxDesk)),
      `${label} has an invalid inbox desk`);
    if (agent.inboxDesk !== null) {
      check(!desks.has(agent.inboxDesk), `${label} shares another agent's inbox identity`);
      desks.add(agent.inboxDesk);
    }
    check(typeof agent.enabled === "boolean", `${label} enabled must be a boolean`);
    check(!agent.enabled || agent.inboxDesk !== null, `${label} needs a registered inbox desk before enabling`);
    check(agent.workspacePath === `${agentsRoot}/${agent.id}/workspace`, `${label} has an invalid workspace path`);
    check(Array.isArray(agent.allowedWrites) && agent.allowedWrites.length === 1
      && agent.allowedWrites[0] === `${agent.workspacePath}/notes.md`, `${label} may write only its own notes.md`);
    checkFields(agent.cadence, ["dayUtc", "hourUtc"], [], `${label} cadence`);
    check(weekdays.includes(agent.cadence.dayUtc) && isInteger(agent.cadence.hourUtc, 0, 23),
      `${label} needs a UTC weekday and hour`);
    checkFields(agent.model, ["providerRef", "aliasRefs"], [], `${label} model`);
    const { providerRef, aliasRefs } = agent.model;
    check(isId(providerRef) && Array.isArray(aliasRefs) && aliasRefs.length > 0
      && aliasRefs.every((ref) => typeof ref === "string" && /^[A-Z][A-Z0-9_]{0,63}$/.test(ref))
      && new Set(aliasRefs).size === aliasRefs.length, `${label} needs a provider and named model aliases`);
    checkFields(agent.budget, budgetFields, [], `${label} budget`);
    check(budgetFields.every((field) => isInteger(agent.budget[field], 1))
      && agent.budget.maxCostCents <= roster.dispatchLimits.maxCostCentsPerSlot,
      `${label} needs positive limits within the dispatch budget`);
  }
  return roster;
}

export function checkRegisteredDesks(before, after) {
  const currentById = new Map(after.agents.map((agent) => [agent.id, agent]));
  for (const agent of before.agents) {
    if (agent.inboxDesk === null) continue;
    const current = currentById.get(agent.id);
    check(current?.inboxDesk === agent.inboxDesk, `Keep the registered inbox identity for ${agent.id}`);
  }
}

export function planSlot(roster, at) {
  const date = utcDate(at);
  const slot = `${date.toISOString().slice(0, 13)}:00:00Z`;
  const plan = { slot, automationEnabled: roster.automationEnabled, runs: [], deferred: [], maxCostCents: 0 };
  if (roster.automationEnabled !== true) return plan;

  const due = roster.agents.filter(({ enabled, inboxDesk, cadence }) => enabled === true && inboxDesk !== null
    && cadence.dayUtc === weekdays[date.getUTCDay()] && cadence.hourUtc === date.getUTCHours());
  for (const agent of due) {
    const cost = plan.maxCostCents + agent.budget.maxCostCents;
    if (plan.runs.length >= roster.dispatchLimits.maxAgentsPerSlot
      || !isInteger(cost, 1, roster.dispatchLimits.maxCostCentsPerSlot)) {
      plan.deferred.push(agent.id);
      continue;
    }
    plan.runs.push({ agentId: agent.id, runId: `${agent.id}/${slot}`, budget: agent.budget });
    plan.maxCostCents = cost;
  }
  return plan;
}

function enabledAgent(roster, authenticatedAgentId) {
  check(roster.automationEnabled === true, "Managed newsroom automation is off");
  const agent = roster.agents.find(({ id }) => id === authenticatedAgentId);
  check(agent?.enabled === true, "Agent is disabled or unregistered");
  return agent;
}

export function authorizeSubmission(roster, authenticatedAgentId) {
  const { inboxDesk } = enabledAgent(roster, authenticatedAgentId);
  check(inboxDesk !== null, "Agent has no registered R2 inbox desk");
  return inboxDesk;
}

export function prepareNoteChange(roster, authenticatedAgentId, expectedHead, request) {
  const agent = enabledAgent(roster, authenticatedAgentId);
  check(isGitSha(expectedHead), "A verified Git branch head is required");
  checkFields(request, ["path", "content"], [], "Note change");
  check(agent.allowedWrites.includes(request.path), "Note change is outside this agent's write scope");
  check(isText(request.content, 16_384) && Buffer.byteLength(request.content, "utf8") <= 16_384,
    "Note must be UTF-8 text within 16 KiB");
  return { branch: `agent-notes/${agent.id}`, expectedHead, path: request.path, content: request.content };
}
