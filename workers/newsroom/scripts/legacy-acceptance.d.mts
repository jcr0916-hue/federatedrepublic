export interface AcceptanceResult {
  passed: boolean;
  checks: number;
  desks: string[];
  syntheticSubmissions: number;
  agentReviewDenied: boolean;
  crossDeskReadDenied: boolean;
  editorialReadAndReview: boolean;
  publicationDenied: boolean;
}
export function runLegacyAcceptance(origin: string, credentials: Record<string, string>,
  transport?: (url: string, init: RequestInit) => Promise<{ status: number; json(): Promise<unknown> }>): Promise<AcceptanceResult>;
