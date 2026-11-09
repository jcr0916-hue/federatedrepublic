/** Separate, unbound S3 read-only MCP resource candidate. NOT deployed.
 * No native R2Bucket binding. The credential must be R2 bucket-scoped
 * "Object Read only" through the S3 API, provisioned outside source.
 */
import { createResourceCandidate, type Env } from "./resource-candidate.ts";
import { readonlyS3Storage } from "./readonly-s3-storage.ts";
import { observe } from "./privacy-telemetry.ts";

export default createResourceCandidate((env: Env) => {
  if (!env.R2_READ_ENDPOINT || !env.R2_READ_BUCKET ||
      !env.R2_READ_ACCESS_KEY_ID || !env.R2_READ_SECRET_ACCESS_KEY)
    throw new Error("s3_readonly_not_configured");
  const storage = readonlyS3Storage({
    endpoint: env.R2_READ_ENDPOINT,
    bucket: env.R2_READ_BUCKET,
    accessKeyId: env.R2_READ_ACCESS_KEY_ID,
    secretAccessKey: env.R2_READ_SECRET_ACCESS_KEY,
  });
  // Only the fixed failure category is emitted, never the S3 key, object,
  // exception message, signed request, credential, or continuation token.
  return Object.freeze({
    get: (async (...args: Parameters<typeof storage.get>) => {
      try { return await storage.get(...args); }
      catch (error) { observe(env, "storage_failed", "resource"); throw error; }
    }) as typeof storage.get,
    list: (async (...args: Parameters<typeof storage.list>) => {
      try { return await storage.list(...args); }
      catch (error) { observe(env, "storage_failed", "resource"); throw error; }
    }) as typeof storage.list,
  });
});
