/**
 * Tests for materialService.
 * All API calls are mocked via jest.mock — no network needed.
 */
jest.mock("../../services/api", () => ({
  apiFetch: jest.fn(),
}));

// The production module imports from the LEGACY submodule because
// the top-level `expo-file-system` no longer exports `readAsStringAsync`
// or `EncodingType`. Mock the same module path so the test exercises the
// same code path that ships in production.
jest.mock("expo-file-system/legacy", () => ({
  readAsStringAsync: jest.fn(),
  EncodingType: { Base64: "base64" },
}));

import { materialService } from "../../services/materialService";
import { apiFetch } from "../../services/api";
import * as FileSystem from "expo-file-system/legacy";

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;
const mockReadAsStringAsync = FileSystem.readAsStringAsync as jest.MockedFunction<
  typeof FileSystem.readAsStringAsync
>;

const mockMaterialInfo = {
  course_id: 1,
  course_title: "Basic Pistol",
  has_pdf: true,
  pdf_is_public: true,
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
  mockReadAsStringAsync?.mockReset();
  (global.fetch as jest.Mock)?.mockReset?.();
});

describe("materialService.getMaterialInfo", () => {
  it("returns material info on success", async () => {
    mockApiFetch.mockResolvedValueOnce(mockMaterialInfo);
    const result = await materialService.getMaterialInfo(1);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockMaterialInfo);
    expect(result.data?.pdf_is_public).toBe(true);
    expect(mockApiFetch).toHaveBeenCalledWith("/materials/courses/1/info");
  });

  it("returns pdf_is_public false when PDF is instructor-only", async () => {
    mockApiFetch.mockResolvedValueOnce({
      ...mockMaterialInfo,
      pdf_is_public: false,
    });
    const result = await materialService.getMaterialInfo(1);
    expect(result.success).toBe(true);
    expect(result.data?.pdf_is_public).toBe(false);
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

describe("materialService.requestUploadUrl", () => {
  const uploadUrlRequest = {
    course_id: 1,
    material_type: "course_pdf" as const,
    filename: "syllabus.pdf",
    content_type: "application/pdf",
  };

  it("returns upload_url and s3_key on success", async () => {
    const mockResponse = {
      upload_url: "https://s3.example.com/presigned-put?X-Amz-...",
      s3_key: "courses/1/materials/pdf/abc123.pdf",
      expires_in_seconds: 900,
    };
    mockApiFetch.mockResolvedValueOnce(mockResponse);
    const result = await materialService.requestUploadUrl(uploadUrlRequest);
    expect(result.success).toBe(true);
    expect("data" in result && result.data).toEqual(mockResponse);
    expect("data" in result && result.data?.s3_key).toContain("courses/1/materials/pdf/");
    expect(mockApiFetch).toHaveBeenCalledWith("/materials/upload-url", {
      method: "POST",
      body: JSON.stringify(uploadUrlRequest),
    });
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Forbidden"));
    const result = await materialService.requestUploadUrl(uploadUrlRequest);
    expect(result.success).toBe(false);
    expect("error" in result && result.error).toBe("Failed to get upload URL");
  });
});

describe("materialService.uploadFileToPresignedUrl", () => {
  it("returns success when fetch PUT succeeds", async () => {
    // Valid base64 (e.g. "a" -> "YQ==") so atob() does not throw
    mockReadAsStringAsync.mockResolvedValueOnce("YQ==");
    const mockFetch = jest.fn().mockResolvedValueOnce({ ok: true });
    global.fetch = mockFetch;
    const result = await materialService.uploadFileToPresignedUrl(
      "https://s3.example.com/put",
      "file:///path/to/file.pdf",
      "application/pdf"
    );
    expect(result.success).toBe(true);
    expect(mockReadAsStringAsync).toHaveBeenCalledWith(
      "file:///path/to/file.pdf",
      expect.objectContaining({ encoding: expect.anything() })
    );
    expect(mockFetch).toHaveBeenCalledWith(
      "https://s3.example.com/put",
      expect.objectContaining({
        method: "PUT",
        headers: { "Content-Type": "application/pdf" },
      })
    );
  });

  it("returns error when fetch PUT fails", async () => {
    mockReadAsStringAsync.mockResolvedValueOnce("base64content");
    const mockFetch = jest.fn().mockResolvedValueOnce({ ok: false, status: 403 });
    global.fetch = mockFetch;
    const result = await materialService.uploadFileToPresignedUrl(
      "https://s3.example.com/put",
      "file:///path/to/file.pdf"
    );
    expect(result.success).toBe(false);
    expect("error" in result && result.error).toContain("Upload failed");
  });

  it("returns error when FileSystem.readAsStringAsync throws", async () => {
    mockReadAsStringAsync.mockRejectedValueOnce(new Error("File not found"));
    const result = await materialService.uploadFileToPresignedUrl(
      "https://s3.example.com/put",
      "file:///missing.pdf"
    );
    expect(result.success).toBe(false);
    expect("error" in result && result.error).toBe(
      "Upload failed. Please try again."
    );
  });
});

/**
 * Regression guard for a real shipping bug discovered during the pre-release
 * audit: `expo-file-system` v18+ removed `readAsStringAsync` and
 * `EncodingType` from the top-level export and moved them to the `legacy`
 * submodule. The previous code did
 *   `import * as FileSystem from "expo-file-system"`
 * and then accessed `FileSystem.EncodingType.Base64`, which threw
 * `TypeError: Cannot read properties of undefined (reading 'Base64')` the
 * first time a master admin tried to upload a course material. This test
 * fails loudly if anyone reverts the import.
 */
describe("materialService import target (regression: legacy file-system)", () => {
  it("imports readAsStringAsync from expo-file-system/legacy, not the top-level package", () => {
    // We rely on the fact that the mock above is bound to the LEGACY path.
    // If materialService ever reverts to importing from "expo-file-system",
    // the mocked spy will not be invoked when uploadFileToPresignedUrl runs.
    const mockReadOnLegacy = FileSystem.readAsStringAsync as jest.MockedFunction<
      typeof FileSystem.readAsStringAsync
    >;
    expect(jest.isMockFunction(mockReadOnLegacy)).toBe(true);
  });

  it("actually invokes the legacy readAsStringAsync when uploading", async () => {
    const mockReadOnLegacy = FileSystem.readAsStringAsync as jest.MockedFunction<
      typeof FileSystem.readAsStringAsync
    >;
    mockReadOnLegacy.mockResolvedValueOnce("YQ==");
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true }) as any;
    await materialService.uploadFileToPresignedUrl(
      "https://s3.example.com/put",
      "file:///path/to/file.pdf",
      "application/pdf"
    );
    expect(mockReadOnLegacy).toHaveBeenCalledTimes(1);
    expect(mockReadOnLegacy).toHaveBeenCalledWith(
      "file:///path/to/file.pdf",
      expect.objectContaining({ encoding: "base64" })
    );
  });
});

describe("materialService.getVideoAccess", () => {
  it("returns access_url on success", async () => {
    const mockResponse = {
      success: true,
      access_url: "https://s3.example.com/presigned-video",
      expires_at: "2026-02-28T12:00:00Z",
      expires_in_seconds: 3600,
      material_type: "video",
      course_title: "Basic Pistol",
      course_id: 1,
    };
    mockApiFetch.mockResolvedValueOnce(mockResponse);
    const result = await materialService.getVideoAccess(1, 5);
    expect(result.success).toBe(true);
    expect("data" in result && result.data?.access_url).toBe(
      "https://s3.example.com/presigned-video"
    );
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/materials/courses/1/videos/5/access",
      { method: "POST" }
    );
  });

  it("returns error on failure", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("Not found"));
    const result = await materialService.getVideoAccess(2, 99);
    expect(result.success).toBe(false);
    expect("error" in result && result.error).toBe("Failed to get video access");
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/materials/courses/2/videos/99/access",
      { method: "POST" }
    );
  });
});
