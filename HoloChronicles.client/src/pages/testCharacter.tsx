import React, { useEffect, useState } from 'react';

export default function CharacterJsonPage() {
    const [characterJson, setCharacterJson] = useState<string | null>(null);

    useEffect(() => {
        const storedCharacter = localStorage.getItem('swrpg-character');
        if (storedCharacter) {
            try {
                const parsed = JSON.parse(storedCharacter);
                setCharacterJson(JSON.stringify(parsed, null, 2)); // pretty print
            } catch (e) {
                setCharacterJson('Error parsing character JSON.');
            }
        } else {
            setCharacterJson('No character found in localStorage.');
        }
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Stored Character JSON</h1>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
                {characterJson}
            </pre>
        </div>
    );
}