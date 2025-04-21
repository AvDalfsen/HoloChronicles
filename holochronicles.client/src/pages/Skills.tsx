import { useEffect, useState } from 'react';
import { fetchDataWithRetryAndCache } from '@/api/fetcher';

export interface Skill {
    key?: string;
    name?: string;
    description?: string;
    charKey?: string;
    typeValue?: string;
    source?: string[];
}

const SKILLS_CACHE_KEY = 'skillsCache';

function Skills() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadSkills() {
            const data = await fetchDataWithRetryAndCache<Skill[]>(
                '/api/skills',
                SKILLS_CACHE_KEY
            );
            if (data) {
                setSkills(data);
            } else {
                setError('Failed to fetch skills');
            }
        }

        loadSkills();
    }, []);

    return (
        <div>
            <h1>Skills</h1>
            <p>All them awesome skills, yo!</p>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {skills.length === 0 ? (
                <div>
                    <p><em>Loading skills...</em></p>
                    <div className="spinner" />
                </div>
            ) : (
                <table className="table table-striped" aria-labelledby="tableLabel">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>CharKey</th>
                        </tr>
                    </thead>
                    <tbody>
                        {skills.map(skill => (
                            <tr key={skill.name}>
                                <td>{skill.name}</td>
                                <td>{skill.charKey}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Skills;
