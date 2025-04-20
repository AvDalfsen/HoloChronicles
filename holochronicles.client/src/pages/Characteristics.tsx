import { useEffect, useState } from 'react';

export interface Characteristic {
    key?: string;
    name?: string;
    abbrev?: string;
    description?: string;
    sources?: string[];
}

function Characteristics() {
    const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDataWithRetry(attempts = 5, delay = 1000) {
            for (let i = 0; i < attempts; i++) {
                try {
                    const isBackendReady = await checkBackendReady();
                    if (isBackendReady) {
                        await populateCharacteristics();
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

    return (
        <div>
            <h1>Characteristics</h1>
            <p>Them sweet Characteristics, baby!</p>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {characteristics.length === 0 ? (
                <div>
                    <p><em>Loading characteristics...</em></p>
                    <div className="spinner" />
                </div>
            ) : (
                <table className="table table-striped" aria-labelledby="tableLabel">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Key</th>
                            <th>Abbrev</th>
                            <th>Sources</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {characteristics.map((char) => (
                            <tr key={char.name}>
                                <td>{char.name}</td>
                                <td>{char.key}</td>
                                <td>{char.abbrev}</td>
                                <td>
                                    {char.sources && char.sources.length > 0 ? (
                                        char.sources.map((source, idx) => (
                                            <span key={idx}>{source}<br /></span>
                                        ))
                                    ) : (
                                        <em>No sources listed</em>
                                    )}
                                </td>
                                <td>{char.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Characteristics;