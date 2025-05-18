import { useEffect, useState } from 'react';
import { fetchDataWithRetryAndCache } from '@/api/dataFetcher';
import { useCharacterStore } from '@/stores/characterStore';
import { Talent } from '@/types/talent';

const TALENTS_CACHE_KEY = 'talentsCache';
const TALENTS_API_KEY = '/api/talents';

function Talents() {
    const [talents, setTalents] = useState<Talent[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { character, updateCharacter } = useCharacterStore();

    useEffect(() => {
        async function loadTalents() {
            const data = await fetchDataWithRetryAndCache<Talent[]>(
                TALENTS_API_KEY,
                TALENTS_CACHE_KEY
            );
            if (data) {
                setTalents(data);
            } else {
                setError('Failed to fetch talents');
            }
        }

        loadTalents();
    }, []);

    return (
        <div>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {talents.length === 0 ? (
                <div>
                    <p><em>Loading skills...</em></p>
                    <div className="spinner" />
                </div>
            ) : (
                <table className="table table-striped" aria-labelledby="tableLabel">
                    <thead>
                        <tr>
                            <th>Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {talents.map(talents => (
                            <tr key={talents.name}>
                                <td>{talents.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Talents;