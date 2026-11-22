import { legacyAdapter } from "./adapter.ts";
import { createNewsroomOAuth } from "./oauth.ts";

// Release configuration and all remote provisioning remain separate approval gates.
export default createNewsroomOAuth(legacyAdapter);
