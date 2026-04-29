import { issueReportService } from "../../services/issueReportService";

jest.mock("../../services/api", () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from "../../services/api";
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

beforeEach(() => {
  mockApiFetch.mockReset();
});

describe("issueReportService.createIssueReport", () => {
  it("submits issue-report payload", async () => {
    mockApiFetch.mockResolvedValueOnce({
      ok: true,
      issue_report_id: 42,
      message: "Issue report submitted",
    });

    const result = await issueReportService.createIssueReport({
      summary: "Calendar failed to load",
      description: "Tapped calendar tab and received network error.",
      api_path: "/sessions/calendar",
      http_status: 500,
    });

    expect(result.success).toBe(true);
    expect(result.data?.issue_report_id).toBe(42);
    expect(mockApiFetch).toHaveBeenCalledWith("/issue-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: "Calendar failed to load",
        description: "Tapped calendar tab and received network error.",
        api_path: "/sessions/calendar",
        http_status: 500,
      }),
    });
  });

  it("returns a service error when API call fails", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("request failed"));

    const result = await issueReportService.createIssueReport({
      summary: "Session save failed",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("request failed");
  });
});
