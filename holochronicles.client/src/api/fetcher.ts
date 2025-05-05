import { getCachedData, setCachedData } from './cache';

// Generic function to fetch data from an API with retry logic and caching
// This function will first check if there's data already cached under the same name. If it is, it will return the cached data.
// If not, it will attempt to fetch the data from the API.

export const fetchDataWithRetryAndCache = async<T>(
    url: string,
    cacheKey: string,
    attempts = 5,
    delay = 1000
): Promise<T | null > => {
    for (let i = 0; i < attempts; i++) {
        try {
            const cachedData = getCachedData<T>(cacheKey);
            if (cachedData) {
                return cachedData;
            } else {
                const isBackendReady = await checkBackendReady();
                if (isBackendReady) {
                    const response = await fetch(`${url}`);
                    if (response.ok) {
                        const data: T = await response.json();
                        setCachedData<T>(cacheKey, data);
                        return data;
                    } else {
                        console.error(`Failed to fetch data from ${url}:`, response.statusText);
                        throw new Error('Failed to fetch data');
                    }
                }
            }
        } catch (err) {
            console.error(`Error during API fetch attempt ${i + 1}:`, err);
        }

        await new Promise(res => setTimeout(res, delay));
    }

    return null;
};

// Check if the backend is ready, if it has been checked before, no need to call the API again
const checkBackendReady = async (): Promise<boolean> => {
    //TODO add some sort of timeout to the health response in local storage
    const storedHealthStatus = sessionStorage.getItem('apiHealth');

    if (storedHealthStatus !== null) {
        return storedHealthStatus === 'true';
    }

    try {
        const response = await fetch('/api/healthcheck');
        const isHealthy = response.ok;

        sessionStorage.setItem('apiHealth', String(isHealthy));

        return isHealthy;
    } catch (error) {
        console.error("Error checking backend readiness:", error);
        sessionStorage.setItem('apiHealth', 'false');
        return false;
    }
};

