import { router } from "expo-router";
import { API_URL, API_TIMEOUT } from "../config";
import { emitGlobalError } from "../utils/globalErrorBus";
import { authStorage } from "./authStorage";
import { logger } from "../utils/logger";
import { CLIENT_ERRORS_PATH, reportClientError } from "./errorReporter";

const ISSUE_REPORT_PATH = "/issue-reports";

// Helper function to clear auth data (moved here to avoid circular dependency)
async function clearAuthData(): Promise<void> {
  try {
    await authStorage.clearAuthData();
  } catch (error) {
    logger.error("Clear auth data error:", error);
  }
}

let unauthorizedHandler: (() => void) | null = null;

/** Registered by AuthProvider so an expired session also clears in-memory auth state. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export class ApiError extends Error {
  status: number;
  detail?: string;
  /** Parsed response body, for endpoints that return structured error details. */
  body?: unknown;

  constructor(status: number, message: string, detail?: string, body?: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
    this.body = body;
  }
}

function extractErrorDetail(data: any): string | undefined {
  const detail = data?.detail ?? data?.message;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (typeof item === "string" ? item : item?.msg))
      .filter((msg): msg is string => typeof msg === "string" && !!msg.trim());
    if (messages.length) return messages.join("\n");
  }
  return undefined;
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
    '/session-forms', '/test-session-forms',
    '/availability', '/materials', '/drills',
    '/technical-fundamentals', '/course-drills',
    '/payments', '/webhooks',
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

type ApiFetchOptions = RequestInit & {
  suppressGlobalError?: boolean;
  friendlyErrorTitle?: string;
  /** Internal: set on the single retry after a session refresh. */
  _isRetryAfterRefresh?: boolean;
};

function buildGlobalErrorEvent(args: {
  message: string;
  status?: number;
  path: string;
  method: string;
  title?: string;
}) {
  const { message, status, path, method, title } = args;
  const normalizedStatus = status ?? 0;

  if (normalizedStatus === 0) {
    return {
      title: title || "Connection problem",
      message:
        "We could not reach the server. Check your connection and try again.",
      kind: "network" as const,
      severity: "error" as const,
      canRetry: true,
      status: normalizedStatus,
      path,
      method,
      dedupeKey: `${method}:${path}:network`,
    };
  }

  if (normalizedStatus === 408) {
    return {
      title: title || "Request timed out",
      message: "The server took too long to respond. Please try again.",
      kind: "timeout" as const,
      severity: "warning" as const,
      canRetry: true,
      status: normalizedStatus,
      path,
      method,
      dedupeKey: `${method}:${path}:timeout`,
    };
  }

  if (normalizedStatus >= 500) {
    return {
      title: title || "Server error",
      message: "Something went wrong on our side. Please try again shortly.",
      kind: "server" as const,
      severity: "error" as const,
      canRetry: true,
      status: normalizedStatus,
      path,
      method,
      dedupeKey: `${method}:${path}:server`,
    };
  }

  if (normalizedStatus >= 400) {
    return {
      title: title || "Request failed",
      message,
      kind: (normalizedStatus === 401 ? "auth" : "validation") as "auth" | "validation",
      severity: "warning" as const,
      canRetry: normalizedStatus !== 401 && normalizedStatus !== 403,
      status: normalizedStatus,
      path,
      method,
      dedupeKey: `${method}:${path}:${normalizedStatus}`,
    };
  }

  return {
    title: title || "Unexpected error",
    message,
    kind: "unknown" as const,
    severity: "error" as const,
    canRetry: true,
    status: normalizedStatus,
    path,
    method,
    dedupeKey: `${method}:${path}:unknown`,
  };
}

const AUTH_PATHS_WITHOUT_REFRESH = new Set([
  "/auth/login",
  "/auth/login/",
  "/auth/token/refresh",
  "/auth/token/refresh/",
]);

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Trade the stored refresh token for a new access token. Concurrent 401s share
 * one refresh call. Resolves false when there is no usable refresh token.
 */
export function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const refreshToken = await authStorage.getRefreshToken();
        if (!refreshToken) return false;
        const response = await fetchWithTimeout(
          `${API_URL}/auth/token/refresh`,
          {
            method: "POST",
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
          },
          API_TIMEOUT
        );
        if (!response.ok) return false;
        const data = await response.json();
        if (!data?.access_token) return false;
        await authStorage.setAuthToken(data.access_token);
        if (data.refresh_token) await authStorage.setRefreshToken(data.refresh_token);
        await authStorage.setTokenData(JSON.stringify(data));
        return true;
      } catch (error) {
        logger.error("[apiFetch] Session refresh failed:", error);
        return false;
      }
    })().finally(() => {
      // Cleared on the outer promise so it also resets when the function
      // returns before its first await.
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

/** Report an API failure to /client-errors and, unless suppressed, show it to the user. */
function surfaceApiError(
  event: ReturnType<typeof buildGlobalErrorEvent>,
  path: string,
  suppressGlobalError: boolean
): void {
  const isReportingCall = path.includes(ISSUE_REPORT_PATH) || path.includes(CLIENT_ERRORS_PATH);
  if (isReportingCall) return;
  reportClientError({
    kind: event.kind,
    severity: event.severity,
    message: event.status && event.status >= 500 ? `HTTP ${event.status} ${event.method} ${event.path}` : event.message,
    apiMethod: event.method,
    apiPath: event.path,
    httpStatus: event.status || undefined,
  });
  if (!suppressGlobalError) emitGlobalError(event);
}

export async function apiFetch<T = any>(path: string, options: ApiFetchOptions = {}): Promise<T> {
    // Normalize the path to ensure trailing slashes for root endpoints
    const normalizedPath = normalizeApiPath(path, options.method);
    const token = await authStorage.getAuthToken();
    const fullUrl = `${API_URL}${normalizedPath}`;
    
    logger.debug(
      `[apiFetch] ${options.method || "GET"} ${fullUrl} (timeout: ${API_TIMEOUT}ms)`
    );

    const isFormData = options.body instanceof FormData;

    const {
      suppressGlobalError = false,
      friendlyErrorTitle,
      _isRetryAfterRefresh = false,
      ...requestOptions
    } = options;

    const headers = {
        Accept: "application/json",
        ...(requestOptions.body && !isFormData && { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(requestOptions.headers || {}),
    };

    const startTime = Date.now();
    
    try {
      const response = await fetchWithTimeout(fullUrl, {
          ...requestOptions,
          headers
      }, API_TIMEOUT);
      
      const duration = Date.now() - startTime;
      logger.debug(`[apiFetch] ${response.status} in ${duration}ms`);
    
      if (response.status === 401){
        if (!AUTH_PATHS_WITHOUT_REFRESH.has(normalizedPath)) {
          // The 30-minute access token expired: renew it and retry once, so the
          // user stays signed in instead of being sent back to the login screen.
          if (!_isRetryAfterRefresh && (await refreshSession())) {
            return apiFetch<T>(path, { ...options, _isRetryAfterRefresh: true });
          }
          await clearAuthData();
          if (unauthorizedHandler) {
            unauthorizedHandler();
          } else {
            router.replace("/login");
          }
        }
        const message =
          normalizedPath === "/auth/login" || normalizedPath === "/auth/login/"
            ? "Invalid credentials"
            : "Unauthorized";
        throw new ApiError(401, message);
      }

      let data: any = null;
      try {
        data = await response.json();
      } catch (_) {
        // 204 No Content
      }

      const serverDetail = extractErrorDetail(data);

      if (response.status === 403) {
        throw new ApiError(403, serverDetail || "Forbidden access", serverDetail);
      }

      if (response.status === 409) {
        const conflictMessage =
          serverDetail ||
          (typeof data?.detail?.message === "string" ? data.detail.message : undefined);
        throw new ApiError(409, conflictMessage || "Request Conflict", conflictMessage, data);
      }

      if (!response.ok) {
        logger.error(`[apiFetch] ${response.status}`, data);
        
        const msg =
          serverDetail ||
          `Request failed with status ${response.status}`;

        // Client errors (4xx) are expected outcomes the calling screen reports itself.
        if (response.status >= 500) {
          surfaceApiError(
            buildGlobalErrorEvent({
              message: msg,
              status: response.status,
              path: normalizedPath,
              method: requestOptions.method || "GET",
              title: friendlyErrorTitle,
            }),
            normalizedPath,
            suppressGlobalError
          );
        }
        throw new ApiError(response.status, msg, serverDetail, data);
      }

      return data;
    } catch (error: any) {
      logger.error("[apiFetch] Error:", error);
      
      // Handle network errors
      if (error?.message?.includes('timeout')) {
        surfaceApiError(
          buildGlobalErrorEvent({
            message: "Request timeout",
            status: 408,
            path: normalizedPath,
            method: requestOptions.method || "GET",
            title: friendlyErrorTitle,
          }),
          normalizedPath,
          suppressGlobalError
        );
        throw new ApiError(408, "The request timed out. Please try again.");
      }
      
      if (error?.message?.includes('Network request failed') || error?.message?.includes('Failed to fetch')) {
        surfaceApiError(
          buildGlobalErrorEvent({
            message: "Network request failed",
            status: 0,
            path: normalizedPath,
            method: requestOptions.method || "GET",
            title: friendlyErrorTitle,
          }),
          normalizedPath,
          suppressGlobalError
        );
        throw new ApiError(0, "Cannot reach the server. Check your connection and try again.");
      }
      
      // Re-throw ApiError as-is
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Wrap other errors
      surfaceApiError(
        buildGlobalErrorEvent({
          message: error?.message || "Unknown network error",
          status: 0,
          path: normalizedPath,
          method: requestOptions.method || "GET",
          title: friendlyErrorTitle,
        }),
        normalizedPath,
        suppressGlobalError
      );
      throw new ApiError(0, error?.message || 'Unknown network error');
    }
}