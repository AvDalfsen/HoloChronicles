import { useEffect, useState } from 'react';
import { fetchDataWithRetryAndCache } from '@/api/fetcher';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { Characteristic } from '@/types/characteristic';
import { useCharacterStore } from '@/stores/characterStore';

const CHARACTERISTICS_CACHE_KEY = 'characteristicsCache';
const CHARACTERISTICS_API = '/api/characteristics';

function Characteristics() {
    const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { character, updateCharacter } = useCharacterStore();

    useEffect(() => {
        async function loadCharacteristics() {
            const data = await fetchDataWithRetryAndCache<Characteristic[]>(
                CHARACTERISTICS_API,
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

    const adjustValue = (key: string, delta: number) => {
        const currentVal = (character.characteristics as Record<string, number>)[key] ?? 0;
        const newValue = Math.max(1, currentVal + delta);

        updateCharacter({
            characteristics: {
                ...character.characteristics,
                [key]: newValue,
            },
        });
    };

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-3xl font-bold">Characteristics</h1>
            <p className="text-muted-foreground mb-6">Adjust your stats below:</p>

            {error && <p className="text-red-500">{error}</p>}

            {characteristics.length === 0 ? (
                <div>
                    <p><em>Loading characteristics...</em></p>
                    <div className="spinner" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {characteristics.map((char) => {
                        const key = (char.name ?? '').toLowerCase();
                        const value = (character.characteristics as Record<string, number>)[key] ?? 0;

                        return (
                            <div
                                key={char.key}
                                className="bg-white shadow-md rounded-2xl p-4 flex flex-col items-center text-center border"
                            >
                                <h2 className="text-xl font-semibold mb-2">{char.name}</h2>
                                {char.abbrev && (
                                    <p className="text-muted-foreground text-sm mb-2">({char.abbrev})</p>
                                )}
                                <div className="flex items-center space-x-4 mt-4">
                                    <Button
                                        size="icon"
                                        onClick={() => adjustValue(key, -1)}
                                        variant="outline"
                                    >
                                        <Minus />
                                    </Button>
                                    <span className="text-2xl w-10 text-center">{value}</span>
                                    <Button
                                        size="icon"
                                        onClick={() => adjustValue(key, 1)}
                                        variant="outline"
                                    >
                                        <Plus />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Characteristics;
