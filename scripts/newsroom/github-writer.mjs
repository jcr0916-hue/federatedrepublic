import { createHash } from "node:crypto";
import { check, isGitSha, isInteger } from "./roster.mjs";

const owner = "jcr0916-hue";
const name = "federatedrepublic";
const repository = `${owner}/${name}`;
const repositoryId = 1221166219;
const protectedBranch = "main";
const notesBranch = "agent-notes/federal";
const notesPath = "docs/torenthia/agents/federal/workspace/notes.md";
const api = "https://api.github.com";

const readTree = `
  query ReadTree($owner: String!, $name: String!, $expression: String!) {
    repository(owner: $owner, name: $name) {
      object(expression: $expression) {
        ... on Tree { entries { name mode type oid } }
      }
    }
  }
`;

const commitOnBranch = `
  mutation SaveNotes($input: CreateCommitOnBranchInput!) {
    createCommitOnBranch(input: $input) { commit { oid } }
  }
`;

function assertReviewRules(rules) {
  check(Array.isArray(rules), "GitHub branch rules are unavailable");
  const review = rules.some(({ type, parameters }) => type === "pull_request"
    && isInteger(parameters?.required_approving_review_count, 1) && parameters.dismiss_stale_reviews_on_push === true);
  const checks = rules.some(({ type, parameters }) => type === "required_status_checks"
    && parameters?.required_status_checks?.some(({ context }) => context === "Newsroom workspace check"));
  check(review && checks && rules.some(({ type }) => type === "non_fast_forward")
    && rules.some(({ type }) => type === "deletion"),
  "Main must enforce PR review on the current diff, newsroom CI, and ref protection");
}

export function createGitHubWriter({ installationToken, fetchImpl = fetch }) {
  check(typeof installationToken === "string" && installationToken.length > 0, "A GitHub installation token is required");

  async function request(endpoint, operation, body) {
    try {
      const response = await fetchImpl(`${api}${endpoint}`, {
        method: body === undefined ? "GET" : "POST",
        headers: {
          accept: "application/vnd.github+json",
          authorization: `Bearer ${installationToken}`,
          "cache-control": "no-cache",
          "content-type": "application/json",
          "x-github-api-version": "2022-11-28",
        },
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(10_000),
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      if (response.ok) return await response.json();
    } catch {
      // Responses and transport errors can contain private URLs, headers or note contents.
    }
    throw new Error(`GitHub ${operation} failed`);
  }

  const rest = (path, operation) => request(`/repos/${repository}/${path}`, operation);

  async function graph(query, variables, operation) {
    const { data, errors } = await request("/graphql", operation, { query, variables });
    check(data && !errors?.length, `GitHub ${operation} failed`);
    return data;
  }

  async function readProtectedHead() {
    const [branch, rules] = await Promise.all([
      rest(`branches/${protectedBranch}`, "protected ref read"),
      rest(`rules/branches/${protectedBranch}?per_page=100`, "branch rules read"),
    ]);
    check(branch.name === protectedBranch && branch.protected === true && isGitSha(branch.commit?.sha),
      "Protected main branch is unavailable");
    assertReviewRules(rules);
    return branch.commit.sha;
  }

  async function readFile(commit, path, maxBytes) {
    check(isGitSha(commit) && /^(?:[\w-]+\/)+[\w.-]+$/.test(path), "An immutable Git file path is required");
    const split = path.lastIndexOf("/");
    const expression = `${commit}:${path.slice(0, split)}`;
    const result = await graph(readTree, { owner, name, expression }, "file tree read");
    const entries = result.repository?.object?.entries;
    const entry = entries?.find(({ name }) => name === path.slice(split + 1));
    check(entry?.type === "blob" && entry.mode === 0o100644 && isGitSha(entry.oid),
      "Expected an existing regular, nonexecutable Git file");
    const blob = await rest(`git/blobs/${entry.oid}`, "file blob read");
    check(blob.sha === entry.oid && blob.encoding === "base64" && isInteger(blob.size, 0, maxBytes)
      && typeof blob.content === "string" && blob.content.length <= Math.ceil(maxBytes / 3) * 5 + 2,
    "Git blob is invalid or too large");
    const bytes = Buffer.from(blob.content, "base64");
    const oid = createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
    check(bytes.length === blob.size && oid === entry.oid, "Git blob does not match the pinned tree");
    return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  }

  async function readDraftHead(number, baseHead) {
    check(isInteger(number, 1) && isGitSha(baseHead), "Valid Federal draft and base pins are required");
    const pr = await rest(`pulls/${number}`, "Federal draft read");
    check(pr.number === number && pr.state === "open" && pr.draft === true && pr.merged === false
      && pr.auto_merge === null && pr.base?.repo?.id === repositoryId && pr.head?.repo?.id === repositoryId
      && pr.base.ref === protectedBranch && pr.base.sha === baseHead
      && pr.head.ref === notesBranch && isGitSha(pr.head.sha),
    "The pinned Federal draft must be open, in this repository and based on protected main");
    return pr.head.sha;
  }

  async function checkNotesDiff(base, head) {
    check(isGitSha(base) && isGitSha(head) && base !== head, "Pinned Federal draft commits are required");
    const diff = await rest(`compare/${base}...${head}?per_page=1`, "pinned diff read");
    check(diff.status === "ahead" && diff.merge_base_commit?.sha === base
      && diff.files?.length === 1 && diff.files[0].filename === notesPath && diff.files[0].status === "modified",
    "Federal draft diff must modify only the existing Federal notes");
  }

  async function isNoteCommit(head, parent, message) {
    check(isGitSha(head) && isGitSha(parent), "Pinned Federal commit and parent are required");
    const commit = await rest(`git/commits/${head}`, "note commit read");
    return commit.sha === head && commit.parents?.length === 1 && commit.parents[0].sha === parent
      && commit.message?.trimEnd() === `${message.headline}\n\n${message.body}`;
  }

  async function commitNote(change, message) {
    check(change.branch === notesBranch && change.path === notesPath && isGitSha(change.expectedHead),
      "GitHub writer only updates the pinned Federal notes");
    const input = {
      branch: { repositoryNameWithOwner: repository, branchName: notesBranch },
      expectedHeadOid: change.expectedHead,
      message,
      fileChanges: { additions: [{ path: notesPath, contents: Buffer.from(change.content, "utf8").toString("base64") }] },
    };
    const result = await graph(commitOnBranch, { input }, "note commit");
    const head = result.createCommitOnBranch?.commit?.oid;
    check(isGitSha(head) && head !== change.expectedHead, "GitHub did not return the new note commit");
    return head;
  }

  return Object.freeze({ readProtectedHead, readFile, readDraftHead, checkNotesDiff, isNoteCommit, commitNote });
}
