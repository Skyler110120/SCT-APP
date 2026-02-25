import { Platform } from "react-native";
import Constants from "expo-constants";

export type Environment = "development" | "staging" | "production";

interface EnvironmentConfig {
  API_URL: string;
  API_TIMEOUT: number;
  USE_HTTPS: boolean;
}

// Manual override for physical Android device - set via EXPO_PUBLIC_ANDROID_DEVICE_IP in app.config.js
// or .env. Find your IP with: ipconfig (Windows) / ifconfig (Mac/Linux). Leave empty to auto-detect.
const ANDROID_PHYSICAL_DEVICE_IP = (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_ANDROID_DEVICE_IP) || "";

// Development URL varies by platform
// - Web/iOS: localhost works fine
// - Android Emulator: uses 10.0.2.2 (special alias to host machine)
// - Android Physical Device: needs your computer's local network IP
const getDevelopmentApiUrl = (): string => {
  if (Platform.OS === "android") {
    // If manual IP is set, use it (for physical devices)
    if (ANDROID_PHYSICAL_DEVICE_IP) {
      return `http://${ANDROID_PHYSICAL_DEVICE_IP}:8000`;
    }
    
    // Try to auto-detect from Expo Constants
    // This works when device is connected via USB or on same network
    const hostUri = Constants.expoConfig?.hostUri;
    const detectedHost = hostUri?.split(":")[0];
    
    if (detectedHost && detectedHost !== "localhost" && detectedHost !== "127.0.0.1") {
      return `http://${detectedHost}:8000`;
    }
    
    // Fallback: Assume emulator (10.0.2.2) if auto-detection fails
    // If you're on a physical device and this doesn't work, set ANDROID_PHYSICAL_DEVICE_IP above
    return "http://10.0.2.2:8000";
  }
  return "http://localhost:8000";
};

// Staging API - deploy a separate App Runner instance for production and set EXPO_PUBLIC_PRODUCTION_API_URL
const STAGING_API_URL = "https://mdqbj8ddyc.us-east-2.awsapprunner.com";
const PRODUCTION_API_URL = (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_PRODUCTION_API_URL)
  ? process.env.EXPO_PUBLIC_PRODUCTION_API_URL
  : STAGING_API_URL; // Use separate production URL when deployed - set in app.config.js extra or .env

export const environments: Record<Environment, EnvironmentConfig> = {
  development: {
    API_URL: getDevelopmentApiUrl(),
    API_TIMEOUT: 30000,
    USE_HTTPS: false,
  },
  staging: {
    API_URL: STAGING_API_URL,
    API_TIMEOUT: 15000,
    USE_HTTPS: true,
  },
  production: {
    API_URL: PRODUCTION_API_URL,
    API_TIMEOUT: 10000,
    USE_HTTPS: true,
  },
};
