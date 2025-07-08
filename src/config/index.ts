import { environments, Environment} from './environments';
import Constants from 'expo-constants';

const getEnvrionment = (): Environment => {
    const envFromExpo = Constants?.expoConfig?.extra?.ENV;
    if (envFromExpo) {
        return envFromExpo as Environment;
    }

    if (__DEV__) {
        return 'development';
    }

    return 'production';
};

const currentEnv = getEnvrionment();
const config = environments[currentEnv];

export const API_URL = config.API_URL;
export const API_TIMEOUT = config.API_TIMEOUT;
export const USE_HTTPS = config.USE_HTTPS;