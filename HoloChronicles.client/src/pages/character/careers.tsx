import { useEffect, useState } from 'react';
import { fetchDataWithRetryAndCache } from '@/api/dataFetcher';
import { useCharacterStore } from '@/stores/characterStore';
import { Career } from '@/types/career';

const CAREERS_CACHE_KEY = 'careersCache';
const CAREERS_API_KEY = '/api/career';

function Skills() {
    const [careers, setCareers] = useState<Career[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { character, updateCharacter } = useCharacterStore();

    useEffect(() => {
        async function loadSkills() {
            const data = await fetchDataWithRetryAndCache<Career[]>(
                CAREERS_API_KEY,
                CAREERS_CACHE_KEY
            );
            if (data) {
                setCareers(data);
            } else {
                setError('Failed to fetch careers');
            }
        }

        loadSkills();
    }, []);

    return (
        <div>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {careers.length === 0 ? (
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
                        {careers.map(career => (
                            <tr key={career.name}>
                                <td>{career.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Skills;