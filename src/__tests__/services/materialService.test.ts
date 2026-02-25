/**
 * Tests for materialService.
 * All API calls are mocked via jest.mock — no network needed.
 */
import { materialService } from "../../services/materialService";

jest.mock("../../services/api", () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from "../../services/api";
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

const mockMaterialInfo = {
  course_id: 1,
  course_title: "Basic Pistol",
  has_pdf: true,
  has_script: true,
  can_access_script: true,
};

const mockAccessResponse = {
  success: true,
  access_url: "https://example.com/material.pdf?token=abc",
  expires_at: "2026-02-25T12:00:00Z",
  expires_in_seconds: 3600,
  material_type: "pdf",
  course_title: "Basic Pistol",
  course_id: 1,
};

beforeEach(() => {
  mockApiFetch.mockReset();
});

describe("materialService.getMaterialInfo", () => {
  it("returns material info on success", async () => {
    mockApiFetch.mockResolvedValueOnce(mockMaterialInfo);
    const result = await materialService.getMaterialInfo(1);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockMaterialInfo);
    expect(mockApiFetch).toHaveBeenCalledWith("/materials/courses/1/info");
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Course not found"));
    const result = await materialService.getMaterialInfo(999);
    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "Network error occurred while fetching material info"
    );
    expect(mockApiFetch).toHaveBeenCalledWith("/materials/courses/999/info");
  });
});

describe("materialService.getCoursePdfAccess", () => {
  it("returns PDF access URL on success", async () => {
    mockApiFetch.mockResolvedValueOnce(mockAccessResponse);
    const result = await materialService.getCoursePdfAccess(1);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockAccessResponse);
    expect(result.data?.access_url).toContain("example.com");
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/materials/courses/1/pdf/access",
      { method: "POST", body: JSON.stringify({}) }
    );
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Access denied"));
    const result = await materialService.getCoursePdfAccess(1);
    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "Network error occurred while getting PDF access"
    );
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/materials/courses/1/pdf/access",
      { method: "POST", body: JSON.stringify({}) }
    );
  });
});

describe("materialService.getInstructorScriptAccess", () => {
  it("returns script access URL on success", async () => {
    const scriptAccess = { ...mockAccessResponse, material_type: "script" };
    mockApiFetch.mockResolvedValueOnce(scriptAccess);
    const result = await materialService.getInstructorScriptAccess(2);
    expect(result.success).toBe(true);
    expect(result.data?.material_type).toBe("script");
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/materials/courses/2/script/access",
      { method: "POST", body: JSON.stringify({}) }
    );
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Not authorized"));
    const result = await materialService.getInstructorScriptAccess(2);
    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "Network error occurred while getting instructor script access"
    );
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/materials/courses/2/script/access",
      { method: "POST", body: JSON.stringify({}) }
    );
  });
});
