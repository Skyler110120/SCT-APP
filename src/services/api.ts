import { router } from "expo-router";
import { API_URL, API_TIMEOUT } from "../config";
import { emitGlobalError } from "../utils/globalErrorBus";
import { authStorage } from "./authStorage";
import { logger } from "../utils/logger";

const ISSUE_REPORT_PATH = "/issue-reports";

// Helper function to clear auth data (moved here to avoid circular dependency)
async function clearAuthData(): Promise<void> {
  try {
    await authStorage.clearAuthData();
  } catch (error) {
    logger.error("Clear auth data error:", error);
  }
}

export class ApiError extends Error {
  status: number;
  detail?: string;

  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

// Helper function to normalize API paths
// Root-level endpoints (like /companies, /users, /courses) need trailing slashes
// when redirect_slashes=False in FastAPI
function normalizeApiPath(path: string, method?: string): string {
  // Extract query string and fragment if they exist
  let basePath = path;
  let queryString = '';
  let fragment = '';
  
  // Check for fragment first (comes after #)
  const fragmentIndex = path.indexOf('#');
  if (fragmentIndex !== -1) {
    fragment = path.substring(fragmentIndex);
    basePath = path.substring(0, fragmentIndex);
  }
  
  // Check for query string (comes after ?)
  const queryIndex = basePath.indexOf('?');
  if (queryIndex !== -1) {
    queryString = basePath.substring(queryIndex);
    basePath = basePath.substring(0, queryIndex);
  }
  
  // If base path already ends with slash, reconstruct and return
  if (basePath.endsWith('/')) {
    return basePath + queryString + fragment;
  }
  
  // Root-level endpoints that need trailing slashes
  const rootEndpoints = [
    '/companies', '/users', '/courses', '/events',
    '/instructors', '/auth', '/profiles', '/onboarding',
    '/sessions', '/session-forms', '/test-session-forms',
    '/availability', '/materials', '/drills',
    '/technical-fundamentals', '/course-drills',
    '/payments', '/webhooks', '/issue-reports',
  ];
  
  // Check if this is a root-level endpoint without trailing slash
  // POST, PUT, PATCH requests to root endpoints definitely need trailing slashes
  const needsTrailingSlash = method && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase());
  
  for (const endpoint of rootEndpoints) {
    if (basePath === endpoint) {
      const normalized = `${basePath}/${queryString}${fragment}`;
      logger.debug(`[normalizeApiPath] ${path} -> ${normalized}`);
      return normalized;
    }
    // Also check if path starts with endpoint followed by a path segment
    if (basePath.startsWith(endpoint + '/') && basePath.length > endpoint.length + 1) {
      return path;
    }
  }
  
  // For GET requests with query params on root endpoints, add trailing slash
  if (queryString && !needsTrailingSlash) {
    for (const endpoint of rootEndpoints) {
      if (basePath === endpoint) {
        return `${basePath}/${queryString}${fragment}`;
      }
    }
  }
  
  return path;
}

// Helper function to add timeout to fetch
function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout)
    ),
  ]);
}

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
    // Normalize the path to ensure trailing slashes for root endpoints
    const normalizedPath = normalizeApiPath(path, options.method);
    const token = await authStorage.getAuthToken();
    const fullUrl = `${API_URL}${normalizedPath}`;
    
    logger.debug(
      `[apiFetch] ${options.method || "GET"} ${fullUrl} (timeout: ${API_TIMEOUT}ms)`
    );

    const isFormData = options.body instanceof FormData;

    const headers = {
        Accept: "application/json",
        ...(options.body && !isFormData && { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    const startTime = Date.now();
    
    try {
      const response = await fetchWithTimeout(fullUrl, {
          ...options,
          headers
      }, API_TIMEOUT);
      
      const duration = Date.now() - startTime;
      logger.debug(`[apiFetch] ${response.status} in ${duration}ms`);
    
      if (response.status === 401){
        if(normalizedPath !== "/auth/login" && normalizedPath !== "/auth/login/"){
          await clearAuthData();
          router.replace("/login");
        }
        throw new Error("Unauthorized");
      }

      if (response.status === 403) {
          throw new Error("Forbidden access")
      }

      if (response.status === 409) {
        throw new ApiError(409, "Request Conflict")
      }

      let data: any = null;
      try {
        data = await response.json();
      } catch (_) {
        // 204 No Content
      }

      if (!response.ok) {
        logger.error(`[apiFetch] ${response.status}`, data);
        
        const msg =
          data?.detail ||
          data?.message ||
          `Request failed with status ${response.status}`;

        if (!path.includes(ISSUE_REPORT_PATH)) {
          emitGlobalError({
            message: msg,
            status: response.status,
            path: normalizedPath,
            method: options.method || "GET",
          });
        }
        throw new ApiError(response.status, msg, data?.detail);
      }

      return data;
    } catch (error: any) {
      logger.error("[apiFetch] Error:", error);
      
      // Handle network errors
      if (error?.message?.includes('timeout')) {
        if (!path.includes(ISSUE_REPORT_PATH)) {
          emitGlobalError({
            message: `Request timeout - unable to reach server at ${API_URL}`,
            path: normalizedPath,
            method: options.method || "GET",
          });
        }
        throw new ApiError(408, `Request timeout - unable to reach server at ${API_URL}`);
      }
      
      if (error?.message?.includes('Network request failed') || error?.message?.includes('Failed to fetch')) {
        if (!path.includes(ISSUE_REPORT_PATH)) {
          emitGlobalError({
            message: `Network error - cannot reach server at ${API_URL}. Check your connection and ensure the API is running.`,
            path: normalizedPath,
            method: options.method || "GET",
          });
        }
        throw new ApiError(0, `Network error - cannot reach server at ${API_URL}. Check your connection and ensure the API is running.`);
      }
      
      // Re-throw ApiError as-is
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Wrap other errors
      if (!path.includes(ISSUE_REPORT_PATH)) {
        emitGlobalError({
          message: error?.message || "Unknown network error",
          path: normalizedPath,
          method: options.method || "GET",
        });
      }
      throw new ApiError(0, error?.message || 'Unknown network error');
    }
}