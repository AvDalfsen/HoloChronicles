import { useEffect, useState } from 'react';
import { fetchDataWithRetryAndCache } from '@/api/fetcher';
import { Species, StartingChars } from '@/types/species';

export const SPECIES_CACHE_KEY = 'speciesCache';
const SPECIES_API = '/api/species';
const ATTR_ORDER: [keyof StartingChars, string][] = [
    ['brawn', 'Br'],
    ['agility', 'Ag'],
    ['intellect', 'Int'],
    ['cunning', 'Cun'],
    ['willpower', 'Wil'],
    ['presence', 'Pr'],
];

type SortKey = 'name' | 'experience' | keyof StartingChars;

export default function SpeciesListPage() {
    const [species, setSpecies] = useState<Species[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [sortAsc, setSortAsc] = useState(true);

    const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);

    useEffect(() => {
        async function loadSpecies() {
            try {
                const data = await fetchDataWithRetryAndCache<Species[]>(
                    SPECIES_API,
                    SPECIES_CACHE_KEY
                );
                if (data) {
                    setSpecies(data);
                } else {
                    setError('No species data returned');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to fetch species');
            } finally {
                setLoading(false);
            }
        }

        loadSpecies();
    }, []);

    const onSpeciesClick = (s: Species) => {
        setSelectedSpecies(s);
        console.log('Species selected:', s.key);
        // TODO: Implement character sheet update logic
    };

    const sortBy = (key: SortKey) => {
        if (sortKey === key) {
            setSortAsc(!sortAsc);
        } else {
            setSortKey(key);
            setSortAsc(true);
        }
    };

    const sortedSpecies = [...species].sort((a, b) => {
        let aVal: string | number | undefined;
        let bVal: string | number | undefined;

        if (sortKey === 'experience') {
            aVal = a.startingAttrs?.experience ?? 0;
            bVal = b.startingAttrs?.experience ?? 0;
        } else if (sortKey === 'name') {
            aVal = a.name ?? '';
            bVal = b.name ?? '';
        } else {
            // Sorting by a characteristic
            aVal = a.startingChars?.[sortKey] ?? 0;
            bVal = b.startingChars?.[sortKey] ?? 0;
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortAsc ? aVal - bVal : bVal - aVal;
        }

        return sortAsc
            ? String(aVal).localeCompare(String(bVal))
            : String(bVal).localeCompare(String(aVal));
    });


    if (loading) {
        return (
            <div className="p-6">
                <p><em>Loading species...</em></p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <p className="text-red-500">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Species List</h1>
            {species.length === 0 ? (
                <p><em>No species found.</em></p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table-auto border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th
                                    className="cursor-pointer px-4 py-2 text-left"
                                    onClick={() => sortBy('name')}
                                >
                                    Name {sortKey === 'name' && (sortAsc ? '▲' : '▼')}
                                </th>
                                <th
                                    className="cursor-pointer px-4 py-2 text-left"
                                    onClick={() => sortBy('experience')}
                                >
                                    Starting XP {sortKey === 'experience' && (sortAsc ? '▲' : '▼')}
                                </th>
                                {ATTR_ORDER.map(([key, label]) => (
                                    <th
                                        key={key}
                                        className="cursor-pointer px-2 py-2 text-right min-w-[40px]"
                                        onClick={() => sortBy(key)}
                                    >
                                        {label} {sortKey === key && (sortAsc ? '▲' : '▼')}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedSpecies.map((s) => (
                                <tr
                                    key={s.key}
                                    className={`hover:bg-gray-100 cursor-pointer ${selectedSpecies?.key === s.key ? 'bg-blue-100' : ''}`}
                                    onClick={() => onSpeciesClick(s)}
                                >
                                    <td className="border-t px-4 py-2">{s.name ?? 'Unnamed'}</td>
                                    <td className="border-t px-4 py-2">{s.startingAttrs?.experience ?? '-'}</td>
                                    {ATTR_ORDER.map(([key]) => (
                                        <td key={key} className="border-t px-4 py-2 text-sm text-gray-700">
                                            {s.startingChars?.[key] ?? '—'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
