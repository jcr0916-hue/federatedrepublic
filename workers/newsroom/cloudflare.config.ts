import { defineConfig } from "cf/config";

// Intentionally no Worker entrypoint or remote bindings. Source import and explicit
// release approval are prerequisites. The synthetic fixture runs only in Miniflare.
export default defineConfig({});
