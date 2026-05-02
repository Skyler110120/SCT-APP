import { authStorage } from "@/src/services/authStorage";

export async function requireAuthToken(): Promise<string> {
  const token = await authStorage.getAuthToken();

  if (!token) {
    throw new Error("AUTH_REQUIRED");
  }

  return token;
}