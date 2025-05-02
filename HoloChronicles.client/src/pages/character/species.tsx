import { useEffect, useState } from 'react';
import { fetchDataWithRetryAndCache } from '@/api/fetcher';
import { Species } from '@/types/species';

const SPECIES_CACHE_KEY = 'speciesCache';
const SPECIES_API = '/api/species';

export default function SpeciesListPage() {
    const [species, setSpecies] = useState<Species[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadSpecies() {
            try {
                const data = await fetchDataWithRetryAndCache<Species[]>(
                    SPECIES_API,
                    SPECIES_CACHE_KEY
                );
                if (data) {
                    setSpecies(data);
                } else {
                    setError('No species data returned');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to fetch species');
            } finally {
                setLoading(false);
            }
        }

        loadSpecies();
    }, []);

    if (loading) {
        return (
            <div className="p-6">
                <p><em>Loading species...</em></p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <p className="text-red-500">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Species List</h1>
            {species.length === 0 ? (
                <p><em>No species found.</em></p>
            ) : (
                <ul className="list-disc list-inside space-y-2">
                    {species.map((s) => (
                        <li key={s.key}>{s.name ?? 'Unnamed species'}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}
