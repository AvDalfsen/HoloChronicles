import { useEffect, useState } from 'react';
import React from 'react';
import { fetchDataWithRetryAndCache } from '@/api/fetcher';

export interface Characteristic {
    key?: string;
    name?: string;
    abbrev?: string;
    description?: string;
    sources?: string[];
}

const CHARACTERISTICS_CACHE_KEY = 'characteristicsCache';

function Characteristics() {
    const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadCharacteristics() {
            const data = await fetchDataWithRetryAndCache<Characteristic[]>(
                '/api/characteristics',
                CHARACTERISTICS_CACHE_KEY
            );
            if (data) {
                setCharacteristics(data);
            } else {
                setError('Failed to fetch characteristics');
            }
        }

        loadCharacteristics();
    }, []);

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
