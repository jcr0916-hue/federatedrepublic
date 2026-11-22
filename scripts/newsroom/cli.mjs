import { execFileSync } from "node:child_process";
import { lstatSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { appendDecision, checkAppendOnly, LEDGER_DIR, ledgerPath, prepareLedgerChange, validateEntry } from "./ledger.mjs";
import { check, checkRegisteredDesks, isGitSha, planSlot, prepareNoteChange, ROSTER_PATH, validateRoster } from "./roster.mjs";

const root = realpathSync(fileURLToPath(new URL("../../", import.meta.url)));

function git(...args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" });
}

function readRepoFile(path, { optional = false } = {}) {
  const file = join(root, path);
  const stat = lstatSync(file, { throwIfNoEntry: false });
  if (optional && !stat) return undefined;
  check(stat?.isFile() && realpathSync(file) === file && (stat.mode & 0o111) === 0,
    `Expected a regular, nonexecutable repository file at ${path}`);
  return readFileSync(file, "utf8");
}

function validateCheckout(roster, base) {
  for (const { workspacePath } of roster.agents) {
    readRepoFile(`${workspacePath}/desk.md`);
    readRepoFile(`${workspacePath}/notes.md`);
  }

  const dir = join(root, LEDGER_DIR);
  check(lstatSync(dir).isDirectory() && realpathSync(dir) === dir, "Expected the repository ledger directory");
  const entries = new Map();
  for (const name of readdirSync(dir)) {
    if (name === "README.md") continue;
    const path = `${LEDGER_DIR}/${name}`;
    const entry = JSON.parse(readRepoFile(path));
    validateEntry(roster, entry, name);
    entries.set(path, entry);
  }
  for (const { id, decisions } of entries.values()) {
    for (const { relatedReceiptId } of decisions) {
      if (relatedReceiptId !== undefined) {
        check(entries.has(ledgerPath(relatedReceiptId)), `Receipt ${id} references an unknown related receipt`);
      }
    }
  }

  if (base !== undefined) {
    check(isGitSha(base), "Base must be a full Git commit SHA");
    const paths = git("ls-tree", "-r", "--name-only", "-z", base, "--", ROSTER_PATH, LEDGER_DIR).split("\0");
    if (paths.includes(ROSTER_PATH)) {
      const previousRoster = validateRoster(JSON.parse(git("show", `${base}:${ROSTER_PATH}`)));
      checkRegisteredDesks(previousRoster, roster);
    }
    for (const path of paths.filter((path) => path.endsWith(".json") && path.startsWith(`${LEDGER_DIR}/`))) {
      const oldEntry = JSON.parse(git("show", `${base}:${path}`));
      validateEntry(roster, oldEntry, basename(path));
      checkAppendOnly(oldEntry, entries.get(path));
    }
  }
  console.log(`Validated ${roster.agents.length} agent workspaces and ${entries.size} ledger entries.`);
}

function print(value) {
  console.log(JSON.stringify(value, null, 2));
}

function main([command, ...args]) {
  const roster = validateRoster(JSON.parse(readRepoFile(ROSTER_PATH)));
  if (command === "validate" && args.length <= 1) {
    return validateCheckout(roster, args[0]);
  }
  if (command === "plan" && args.length === 1) {
    return print(planSlot(roster, args[0]));
  }
  if (command === "record" && (args.length === 1 || args.length === 2)) {
    const receipt = JSON.parse(readFileSync(args[0], "utf8"));
    const source = readRepoFile(ledgerPath(receipt?.id), { optional: true });
    const existing = source === undefined ? undefined : JSON.parse(source);
    const decision = args[1] === undefined ? undefined : JSON.parse(readFileSync(args[1], "utf8"));
    return print(prepareLedgerChange(roster, receipt, existing, decision));
  }
  if (command === "decide" && args.length === 2) {
    const entry = JSON.parse(readRepoFile(ledgerPath(args[0])));
    check(entry?.id === args[0], "Ledger filename must match the R2 submission id");
    const decision = JSON.parse(readFileSync(args[1], "utf8"));
    return print(appendDecision(roster, entry, decision));
  }
  if (command === "note" && args.length === 3) {
    const change = JSON.parse(readFileSync(args[2], "utf8"));
    return print(prepareNoteChange(roster, args[0], args[1], change));
  }
  throw new Error([
    "Usage: cli.mjs validate [base-sha] | plan <utc-timestamp>",
    "       cli.mjs record <receipt.json> [decision.json] | decide <receipt-id> <decision.json>",
    "       cli.mjs note <agent-id> <expected-head-sha> <change.json>",
  ].join("\n"));
}

try {
  main(process.argv.slice(2));
} catch (error) {
  // JSON.parse errors may include snippets of a private source report.
  console.error(error instanceof SyntaxError ? "Invalid JSON supplied to newsroom command." : error.message);
  process.exitCode = 1;
}
