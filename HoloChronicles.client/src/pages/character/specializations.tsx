import { useEffect, useState } from 'react';
import { fetchDataWithRetryAndCache } from '@/api/dataFetcher';
import { useCharacterStore } from '@/stores/characterStore';
import { Specialization } from '@/types/specialization';

const SPECIALIZATIONS_CACHE_KEY = 'specializationsCache';
const SPECIALIZATIONS_API_KEY = '/api/specializations';

function Specializations() {
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { character, updateCharacter } = useCharacterStore();

    useEffect(() => {
        async function loadSkills() {
            const data = await fetchDataWithRetryAndCache<Specialization[]>(
                SPECIALIZATIONS_API_KEY,
                SPECIALIZATIONS_CACHE_KEY
            );
            if (data) {
                setSpecializations(data);
            } else {
                setError('Failed to fetch specializations');
            }
        }

        loadSkills();
    }, []);

    return (
        <div>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {specializations.length === 0 ? (
                <div>
                    <p><em>Loading specializations...</em></p>
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
                        {specializations.map(specializations => (
                            <tr key={specializations.name}>
                                <td>{specializations.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Specializations;