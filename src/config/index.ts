import { environments, Environment} from './environments';
import Constants from 'expo-constants';

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

// Log the API URL in development for debugging
if (__DEV__) {
  console.log(`[Config] Environment: ${currentEnv}`);
  console.log(`[Config] API_URL: ${API_URL}`);
}