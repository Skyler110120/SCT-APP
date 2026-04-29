import { apiFetch } from "./api";
import type { ApiResponse } from "../types/auth.types";
import type {
  IssueReportCreateRequest,
  IssueReportCreateResponse,
} from "../types/issueReport.types";

async function apiRequest<T>(
  path: string,
  options: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const data = await apiFetch<T>(path, options);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Request failed",
    };
  }
}

export const issueReportService = {
  async createIssueReport(
    payload: IssueReportCreateRequest
  ): Promise<ApiResponse<IssueReportCreateResponse>> {
    return apiRequest<IssueReportCreateResponse>("/issue-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
};
