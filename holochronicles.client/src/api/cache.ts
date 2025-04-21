export function getCachedData<T>(key: string): T | null {
    const cachedData = localStorage.getItem(key);
    if (cachedData) {
        try {
            const parsedData = JSON.parse(cachedData) as T;

            if (Array.isArray(parsedData)) {
                return parsedData.length > 0 ? parsedData : null;
            }

            return parsedData;
        } catch (error) {
            console.error(`Error parsing cached data for key ${key}:`, error);
            return null;
        }
    }
    return null;
}

export function setCachedData<T>(key: string, data: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error caching data for key ${key}:`, error);
    }
}
