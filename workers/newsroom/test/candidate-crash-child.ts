/** Local crash-test child. Synthetic credentials travel only over parent IPC. */
import { pairedRuntime } from "./candidate-harness.ts";
const runtime = await pairedRuntime({ persistencePath: process.argv[2] });
const tokens = await runtime.tokens();
if ((await runtime.rpc(tokens.access_token, "ping")).status !== 200) throw new Error("checkpoint failed");
process.send?.(tokens);
// Intentionally remain alive until the parent sends SIGKILL; no disposal runs.
setInterval(() => {}, 1000);
