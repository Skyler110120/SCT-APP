import type { ApiResponse } from "./auth.types";

export interface IssueReportCreateRequest {
  summary: string;
  description?: string;
  reporter_email?: string;
  error_message?: string;
  page_url?: string;
  api_path?: string;
  http_status?: number;
  user_agent?: string;
}

export interface IssueReportCreateResponse {
  ok: boolean;
  issue_report_id: number;
  message: string;
}

export type IssueReportApiResponse = ApiResponse<IssueReportCreateResponse>;
