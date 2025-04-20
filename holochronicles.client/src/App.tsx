import { useEffect, useState } from 'react';
import './App.css';

export interface Characteristic {
    key?: string;
    name?: string;
    abbrev?: string;
    description?: string;
    sources?: string[];
}

export interface Skill {
    key?: string;
    name?: string;
    description?: string;
    charKey?: string;
    typeValue?: string;
    source?: string[];
}

function App() {
    const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDataWithRetry(attempts = 5, delay = 1000) {
            for (let i = 0; i < attempts; i++) {
                try {
                    const isBackendReady = await checkBackendReady();
                    if (isBackendReady) {
                        await populateCharacteristics();
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

    const characteristicsContent = characteristics.length === 0
        ? (
            <div>
                <p><em>Loading characteristics...</em></p>
                <div className="spinner" />
            </div>
        )
        : <table className="table table-striped" aria-labelledby="tableLabel">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                {characteristics.map(characteristic =>
                    <tr key={characteristic.name}>
                        <td>{characteristic.name}</td>
                        <td>{characteristic.description}</td>
                    </tr>
                )}
            </tbody>
        </table>;

    const skillsContent = skills.length === 0
        ? (
            <div>
                <p><em>Loading skills...</em></p>
                <div className="spinner" />
            </div>
        )
        : <table className="table table-striped" aria-labelledby="tableLabel">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>CharKey</th>
                </tr>
            </thead>
            <tbody>
                {skills.map(skill =>
                    <tr key={skill.name}>
                        <td>{skill.name}</td>
                        <td>{skill.charKey}</td>
                    </tr>
                )}
            </tbody>
        </table>;

    return (
        <div>
            <h1>Characteristics</h1>
            <p>Them sweet Characteristics, baby!</p>
            {characteristicsContent}

            <h1>Skills</h1>
            <p>All them awesome skills, yo!</p>
            {skillsContent}

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );

    async function populateCharacteristics() {
        try {
            const response = await fetch('characteristics');
            if (response.ok) {
                const data: Characteristic[] = await response.json();
                setCharacteristics(data);
            } else {
                console.error('Failed to fetch characteristics:', response.statusText);
                throw new Error('Failed to fetch characteristics');
            }
        } catch (error) {
            console.error('Error fetching characteristics:', error);
            throw error;
        }
    }

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
}

export default App;
