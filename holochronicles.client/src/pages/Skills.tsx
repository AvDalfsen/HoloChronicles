import { useEffect, useState } from 'react';

export interface Skill {
    key?: string;
    name?: string;
    description?: string;
    charKey?: string;
    typeValue?: string;
    source?: string[];
}

function Skills() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDataWithRetry(attempts = 5, delay = 1000) {
            for (let i = 0; i < attempts; i++) {
                try {
                    const isBackendReady = await checkBackendReady();
                    if (isBackendReady) {
                        await populateSkills();
                        return;
                    }
                } catch (err) {
                    // ignore and retry
                }

                await new Promise(res => setTimeout(res, delay));
            }

            setError("Backend is not ready. Please try again later.");
        }

        fetchDataWithRetry();
    }, []);

    const checkBackendReady = async (): Promise<boolean> => {
        try {
            const response = await fetch('/healthcheck');
            return response.ok;
        } catch (error) {
            console.error("Error checking backend readiness:", error);
            return false;
        }
    };

    async function populateSkills() {
        try {
            const response = await fetch('skills');
            if (response.ok) {
                const data: Skill[] = await response.json();
                setSkills(data);
            } else {
                console.error('Failed to fetch skills:', response.statusText);
                throw new Error('Failed to fetch skills');
            }
        } catch (error) {
            console.error('Error fetching skills:', error);
            throw error;
        }
    }

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