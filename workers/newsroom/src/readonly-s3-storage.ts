/** Experimental R2 S3 API read-only adapter. No Worker R2Bucket binding.
 * A bucket-scoped "Object Read only" S3 credential is required: the code
 * cannot restrict an incorrectly provisioned credential by itself.
 * NOT SELECTED BY PRODUCTION ENTRYPOINT; never deploy without hosted tests.
 */
import type { NewsroomReadStorage } from "./readonly-storage.ts";
import { boundedText } from "./policy.ts";

export interface ReadonlyS3Config {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}
export type S3Transport = (request: Request) => Promise<Response>;

const encoder = new TextEncoder();
const MAX_OBJECT_BYTES = 65_536;
const MAX_LIST_BYTES = 200_000;
const encode = (s: string) => encodeURIComponent(s).replace(/[!'()*]/g, c =>
  "%" + c.charCodeAt(0).toString(16).toUpperCase());
const keyPath = (key: string) => key.split("/").map(encode).join("/");
const digest = async (input: string) => {
  const bits = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return Array.from(new Uint8Array(bits), x => x.toString(16).padStart(2, "0")).join("");
};
async function hmac(key: Uint8Array | string, message: string): Promise<Uint8Array> {
  const bytes = typeof key === "string" ? encoder.encode(key) : key;
  const imported = await crypto.subtle.importKey("raw", Uint8Array.from(bytes).buffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", imported, encoder.encode(message)));
}
const hex = (bytes: Uint8Array) => Array.from(bytes, x => x.toString(16).padStart(2, "0")).join("");
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const element = (xml: string, tag: string) => {
  const match = new RegExp("<(?:[A-Za-z0-9_-]+:)?" + escapeRe(tag) +
    "(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[A-Za-z0-9_-]+:)?" + escapeRe(tag) + ">", "i").exec(xml);
  return match?.[1] ?? null;
};
function unescapeXml(raw: string): string {
  return raw.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|amp|lt|gt|quot|apos);/g, (_, token: string) => {
    if (token === "amp") return "&";
    if (token === "lt") return "<";
    if (token === "gt") return ">";
    if (token === "quot") return '"';
    if (token === "apos") return "'";
    if (token.startsWith("#")) {
      const n = token[1].toLowerCase() === "x" ? parseInt(token.slice(2), 16) : parseInt(token.slice(1), 10);
      if (n <= 0 || n > 0x10ffff || (n >= 0xd800 && n <= 0xdfff)) throw new Error("invalid_xml_character");
      return String.fromCodePoint(n);
    }
    throw new Error("invalid_xml_entity");
  });
}
const tag = (xml: string, name: string) => {
  const text = element(xml, name);
  return text === null ? null : unescapeXml(text);
};
const queryString = (values: Record<string, string>) =>
  Object.entries(values).map(([k, v]) => [encode(k), encode(v)] as const)
    .sort(([a, av], [b, bv]) => a.localeCompare(b) || av.localeCompare(bv))
    .map(([k, v]) => k + "=" + v).join("&");

export function readonlyS3Storage(config: ReadonlyS3Config, transport: S3Transport = fetch): NewsroomReadStorage {
  const url = new URL(config.endpoint);
  // Restrict the authority to the R2 S3 HTTPS endpoint for the intended account.
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || url.pathname !== "/" ||
      !/^[a-f0-9]{32}(?:\.(?:eu|us|fedramp))?\.r2\.cloudflarestorage\.com$/.test(url.hostname) ||
      !/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(config.bucket) ||
      !/^[A-Za-z0-9]{16,128}$/.test(config.accessKeyId) ||
      typeof config.secretAccessKey !== "string" || config.secretAccessKey.length < 32 || config.secretAccessKey.length > 256)
    throw new Error("invalid_readonly_s3_configuration");

  async function getSigned(path: string, parameters: Record<string, string> = {}) {
    const query = queryString(parameters);
    const target = url.origin + "/" + encode(config.bucket) + (path ? "/" + keyPath(path) : "") +
      (query ? "?" + query : "");
    const time = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
    const date = time.slice(0, 8);
    const scope = date + "/auto/s3/aws4_request";
    const payloadHash = await digest("");
    const canonical = ["GET", new URL(target).pathname, query, "host:" + url.host + "\n" +
      "x-amz-content-sha256:" + payloadHash + "\n" + "x-amz-date:" + time + "\n",
      "host;x-amz-content-sha256;x-amz-date", payloadHash].join("\n");
    const message = ["AWS4-HMAC-SHA256", time, scope, await digest(canonical)].join("\n");
    const kDate = await hmac("AWS4" + config.secretAccessKey, date);
    const kRegion = await hmac(kDate, "auto");
    const kService = await hmac(kRegion, "s3");
    const kSigning = await hmac(kService, "aws4_request");
    const signature = hex(await hmac(kSigning, message));
    const request = new Request(target, {
      method: "GET", redirect: "manual", signal: AbortSignal.timeout(6000),
      headers: { "x-amz-date": time, "x-amz-content-sha256": payloadHash,
        Authorization: "AWS4-HMAC-SHA256 Credential=" + config.accessKeyId + "/" + scope +
          ", SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=" + signature },
    });
    const response = await transport(request);
    if (response.status >= 300 && response.status < 400) throw new Error("r2_redirect_denied");
    return response;
  }
  async function get(key: string) {
    if (!/^(?:submissions\/[a-z-]+\/\d{4}-\d{2}-\d{2}\/[a-f0-9-]+\.json|status\/[a-f0-9-]+\.json)$/.test(key) ||
        key.length > 300) throw new Error("r2_invalid_key");
    const response = await getSigned(key);
    if (response.status === 404) return null;
    if (response.status !== 200) throw new Error("r2_read_unavailable");
    const length = Number(response.headers.get("Content-Length") || "0");
    if (!Number.isFinite(length) || length > MAX_OBJECT_BYTES) throw new Error("r2_object_too_large");
    const body = await response.arrayBuffer();
    if (body.byteLength > MAX_OBJECT_BYTES) throw new Error("r2_object_too_large");
    const raw = new TextDecoder("utf-8", { fatal: true }).decode(body);
    return Object.freeze({ json: async () => JSON.parse(raw) }) as unknown as Awaited<ReturnType<R2Bucket["get"]>>;
  }
  async function list(options: R2ListOptions = {}) {
    const prefix = options.prefix ?? "submissions/";
    if (!/^submissions\/(?:[a-z-]+\/)?$/.test(prefix)) throw new Error("r2_invalid_prefix");
    const limit = options.limit ?? 30;
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw new Error("r2_invalid_limit");
    if (options.cursor && (options.cursor.length > 2048 || /[\x00-\x1f]/.test(options.cursor)))
      throw new Error("r2_invalid_cursor");
    const response = await getSigned("", {
      "list-type": "2", prefix, "max-keys": String(limit),
      ...(options.cursor ? { "continuation-token": options.cursor } : {}),
    });
    if (response.status !== 200) {
      // R2 reports a malformed S3 continuation token as InvalidArgument.
      // Do not confuse missing/invalid cursors with credential or service errors.
      if (options.cursor && response.status === 400) {
        const body = await boundedText(response.body, 4096).catch(() => "");
        if ( !body.includes("<!DOCTYPE") && !body.includes("<!ENTITY") &&
            (tag(body, "Code") === "InvalidArgument" || tag(body, "Code") === "InvalidToken"))
          throw new Error("r2_invalid_cursor");
      }
      throw new Error("r2_list_unavailable");
    }
    const body = await response.arrayBuffer();
    if (body.byteLength > MAX_LIST_BYTES) throw new Error("r2_list_too_large");
    const xml = new TextDecoder("utf-8", { fatal: true }).decode(body);
    if (!xml.includes("<ListBucketResult") || xml.includes("<!DOCTYPE") || xml.includes("<!ENTITY"))
      throw new Error("r2_invalid_list");
    const chunks = [...xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)];
    if (chunks.length > limit) throw new Error("r2_list_over_limit");
    const objects = chunks.map(match => {
      const key = tag(match[1], "Key");
      if (!key || !key.startsWith(prefix) || !/^submissions\/[a-z-]+\/\d{4}-\d{2}-\d{2}\/[a-f0-9-]+\.json$/.test(key))
        throw new Error("r2_invalid_object_key");
      return { key };
    });
    const truncated = tag(xml, "IsTruncated") === "true";
    const cursor = tag(xml, "NextContinuationToken") ?? undefined;
    if (truncated && !cursor) throw new Error("r2_missing_cursor");
    return { objects, truncated, cursor, delimitedPrefixes: [] } as unknown as R2Objects;
  }
  return Object.freeze({ get: get as NewsroomReadStorage["get"], list: list as NewsroomReadStorage["list"] });
}
