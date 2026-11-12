// Preserve the issuer's existing namespace exports while its HTTP handler serves discovery.
export { IssuerGrant } from "./issuer-grant.ts";
export { IssuerGuard } from "./issuer-guard.ts";
export { issuerDiscovery as default } from "./editor-discovery.ts";
