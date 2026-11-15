import { isUuid } from "./ledger.mjs";
import { check } from "./roster.mjs";

const receiptKey = /^submissions\/federal\/\d{4}-\d\d-\d\d\/([0-9a-f-]{36})\.json$/;
const maxReceiptBytes = 320 * 1024;

// getObject is a trusted, read-only bridge for the newsroom bucket. It returns a fetch Response.
export function createFederalInbox(getObject) {
  return Object.freeze({
    async readReceipt(key) {
      const match = typeof key === "string" ? receiptKey.exec(key) : null;
      check(isUuid(match?.[1]), "An exact Federal submissions key is required");
      try {
        const response = await getObject(key, { signal: AbortSignal.timeout(10_000) });
        check(response.status === 200 && response.body, "Original Federal receipt is unavailable");
        const reader = response.body.getReader();
        const chunks = [];
        let length = 0;
        try {
          check(Number(response.headers.get("content-length")) <= maxReceiptBytes, "Federal receipt is too large");
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            length += value.byteLength;
            check(length <= maxReceiptBytes, "Federal receipt is too large");
            chunks.push(value);
          }
        } finally {
          await reader.cancel();
        }
        const bytes = Buffer.concat(chunks, length);
        return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
      } catch {
        throw new Error("Could not read the original Federal receipt");
      }
    },
  });
}
