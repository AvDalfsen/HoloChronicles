import { useState, useEffect } from 'react';
import { fetchDataWithRetryAndCache } from '@/api/dataFetcher';

export const CAREERS_CACHE_KEY = 'HoloChroniclesCareersCache';
export const CHARACTERISTICS_CACHE_KEY = 'HoloChroniclesCharacteristicsCache';
export const SKILLS_CACHE_KEY = 'HoloChroniclesSkillsCache';
export const SPECIALIZATIONS_CACHE_KEY = 'HoloChroniclesSpecializationsCache';
export const SPECIES_CACHE_KEY = 'HoloChroniclesSpeciesCache';
export const TALENTS_CACHE_KEY = 'HoloChroniclesTalentsCache';

export const CAREERS_API_KEY = '/api/careers';
export const CHARACTERISTICS_API = '/api/characteristics';
export const SKILLS_API_KEY = '/api/skills';
export const SPECIALIZATIONS_API_KEY = '/api/specializations';
export const SPECIES_API_KEY = '/api/species';
export const TALENTS_API_KEY = '/api/talents';

export function useCachedData<T>(apiUrl: string, cacheKey: string) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            setLoading(true);
            try {
                const result = await fetchDataWithRetryAndCache<T>(apiUrl, cacheKey);
                if (!cancelled) {
                    if (result) setData(result);
                    else setError('No data returned');
                }
            } catch (e) {
                if (!cancelled) {
                    console.error(e);
                    setError(`Failed to fetch ${cacheKey}`);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [apiUrl, cacheKey]);

    return { data, loading, error };
}