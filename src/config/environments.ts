export type Environment = "development" | "staging" | "production";

interface EnvironmentConfig {
  API_URL: string;
  API_TIMEOUT: number;
  USE_HTTPS: boolean;
}

export const environments: Record<Environment, EnvironmentConfig> = {
  development: {
    API_URL: "http://localhost:8000",
    API_TIMEOUT: 30000,
    USE_HTTPS: false,
  },
  staging: {
    API_URL: "https://staging-api.yourapp.com/api",
    API_TIMEOUT: 15000,
    USE_HTTPS: true,
  },
  production: {
    API_URL: "https://api.yourapp.com/api",
    API_TIMEOUT: 10000,
    USE_HTTPS: true,
  },
};
