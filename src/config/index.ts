import { environments, Environment} from './environments';
import Constants from 'expo-constants';
import { logger } from '../utils/logger';

// Toggle this to test against the hosted API in development
const USE_HOSTED_API_IN_DEV = false;

const getEnvironment = (): Environment => {
    const envFromExpo = Constants?.expoConfig?.extra?.ENV;
    if (envFromExpo) {
        return envFromExpo as Environment;
    }

    if (__DEV__) {
        return USE_HOSTED_API_IN_DEV ? 'production' : 'development';
    }

    return 'production';
};

const currentEnv = getEnvironment();
const config = environments[currentEnv];

export const API_URL = config.API_URL;
export const API_TIMEOUT = config.API_TIMEOUT;
export const USE_HTTPS = config.USE_HTTPS;

if (!__DEV__ && !API_URL.startsWith("https://")) {
  throw new Error("Production builds must use an https API URL.");
}

// Log the API URL in development for debugging
if (__DEV__) {
  logger.debug(`[Config] Environment: ${currentEnv}`);
  logger.debug(`[Config] API_URL: ${API_URL}`);
}