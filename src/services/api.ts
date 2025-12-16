import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Platform } from "react-native";
import { authService } from "./authService";

let API_URL: string

if (__DEV__) {
    if (Platform.OS === "android") {
        API_URL = "http://10.0.2.2:8000";
    } else {
        API_URL = "http://localhost:8000";
    }
} else {
    API_URL = "https://your-production-api.com";
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

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await AsyncStorage.getItem("auth_token")

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            Accept: "application/json",
            Authorization: token ? `Bearer ${token}` : "",
            ...(options.headers || {}),
        }
    });

    if (response.status === 401 && path !== "/auth/login") {
        await authService.clearAuthData();
        router.replace("/login");
        throw new Error("Unauthorized");
    } 
    if (response.status === 401){
      throw new Error("Invalid credentials");
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
      const msg =
        data?.detail ||
        data?.message ||
        `Request failed with status ${response.status}`;

      throw new Error(msg);
    }

    return data;
}