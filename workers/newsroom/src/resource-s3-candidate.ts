/** Separate, unbound S3 read-only MCP resource candidate. NOT deployed.
 * No native R2Bucket binding. The credential must be R2 bucket-scoped
 * "Object Read only" through the S3 API, provisioned outside source.
 */
import { createResourceCandidate, type Env } from "./resource-candidate.ts";
import { readonlyS3Storage } from "./readonly-s3-storage.ts";

export default createResourceCandidate((env: Env) => {
  if (!env.R2_READ_ENDPOINT || !env.R2_READ_BUCKET ||
      !env.R2_READ_ACCESS_KEY_ID || !env.R2_READ_SECRET_ACCESS_KEY)
    throw new Error("s3_readonly_not_configured");
  return readonlyS3Storage({
    endpoint: env.R2_READ_ENDPOINT,
    bucket: env.R2_READ_BUCKET,
    accessKeyId: env.R2_READ_ACCESS_KEY_ID,
    secretAccessKey: env.R2_READ_SECRET_ACCESS_KEY,
  });
});
