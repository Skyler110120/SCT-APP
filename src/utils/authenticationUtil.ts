import AsyncStorage from "@react-native-async-storage/async-storage";

export async function requireAuthToken(): Promise<string> {
  const token = await AsyncStorage.getItem("auth_token");

  if (!token) {
    throw new Error("AUTH_REQUIRED");
  }

  return token;
}