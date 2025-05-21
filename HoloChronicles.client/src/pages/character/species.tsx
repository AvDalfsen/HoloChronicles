import { useEffect, useState } from 'react';
import { Species, StartingChars } from '@/types/species';
import { useCharacterStore } from '@/stores/characterStore';
import { FormattedDescription } from '@/lib/descriptionFormatter';
import {
    useCachedData,
    SPECIES_API_KEY, SPECIES_CACHE_KEY,
} from '@/pages/utils/fetcher';

export const CHAR_ORDER: [keyof StartingChars, string][] = [
    ['brawn', 'Br'],
    ['agility', 'Ag'],
    ['intellect', 'Int'],
    ['cunning', 'Cun'],
    ['willpower', 'Wil'],
    ['presence', 'Pr'],
];

type SortKey = 'name' | 'experience' | keyof StartingChars;

export default function SpeciesPage() {
    const { data: species, loading: loadingSpecies, error: errorSpecies } =
        useCachedData<Species[]>(SPECIES_API_KEY, SPECIES_CACHE_KEY);

    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [sortAsc, setSortAsc] = useState(true);
    const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
    const { character, updateCharacter } = useCharacterStore();

    useEffect(() => {
        if (species && character.species) {
            const current = species.find((s) => s.key === character.species) ?? null;
            setSelectedSpecies(current);
        }
    }, [species, character.species]);

    if (loadingSpecies) {
        return <p>Loading…</p>;
    }

    if (errorSpecies) {
        return <p className="text-red-500">{errorSpecies}</p>;
    }

    if (!species) {
        return <p className="text-red-500">Data missing.</p>;
    }

    const onSpeciesClick = (s: Species) => {
        setSelectedSpecies(s);
        console.log('Species selected:', s.key);
    };

    const selectSpeciesClick = () => {
        updateCharacter({
            species: selectedSpecies?.key,
        });
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
        } else { // Sorting by a characteristic
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

    //TODO: Add all of the extra details (options, modifiers, etc.) and choices (skills, talents, subspecies), as well as a picture.
    //TODO: Make the characteristics look better.
    //TODO: Add a way to filter
    //TODO: Sort out global text and padding sizes instead of setting pixels
    return (
        <div className="z-20 p-5 w-full flex space-x-6">
            {/* Species Table */}
            <div className="sticky top-0 left-0 bg-white border rounded-lg shadow-md h-[calc(100vh-130px)] overflow-auto max-w-2xl">
                <table className="w-full table-fixed text-sm text-left border-collapse">
                    <thead className="table-header">
                        <tr>
                            <th
                                className="table-cell w-[20%] min-w-[150px]"
                                onClick={() => sortBy('name')}
                            >
                                Name {sortKey === 'name' && (sortAsc ? '▲' : '▼')}
                            </th>
                            <th
                                className="table-cell w-[20px]"
                                onClick={() => sortBy('experience')}
                            >
                                Starting XP {sortKey === 'experience' && (sortAsc ? '▲' : '▼')}
                            </th>
                            {CHAR_ORDER.map(([key, label]) => (
                                <th
                                    key={key}
                                    className="table-cell-small w-[15px]"
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
                                className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedSpecies?.key === s.key ? 'bg-blue-50' : ''}`}
                                onClick={() => onSpeciesClick(s)}
                            >
                                <td className="border-t px-4 py-2 w-[20%] font-medium">{s.name ?? 'Unnamed'}</td>
                                <td className="border-t px-4 py-2 w-[20px]">{s.startingAttrs?.experience ?? '-'}</td>
                                {CHAR_ORDER.map(([key]) => (
                                    <td
                                        key={key}
                                        className="border-t px-2 py-2 w-[15px]"
                                    >
                                        {s.startingChars?.[key] ?? '—'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Selected Species Info Card */}
            {selectedSpecies && (
                <div className="card w-1/3 h-[calc(100vh-130px)] overflow-auto">
                    <h2 className="text-lg font-semibold mb-4">{selectedSpecies.name}</h2>
                    <div>
                        <p><strong>Starting Experience:</strong> {selectedSpecies.startingAttrs?.experience ?? '-'}</p>
                        <p><strong>Brawn:</strong> {selectedSpecies.startingChars?.brawn ?? '—'}</p>
                        <p><strong>Agility:</strong> {selectedSpecies.startingChars?.agility ?? '—'}</p>
                        <p><strong>Intellect:</strong> {selectedSpecies.startingChars?.intellect ?? '—'}</p>
                        <p><strong>Cunning:</strong> {selectedSpecies.startingChars?.cunning ?? '—'}</p>
                        <p><strong>Willpower:</strong> {selectedSpecies.startingChars?.willpower ?? '—'}</p>
                        <p><strong>Presence:</strong> {selectedSpecies.startingChars?.presence ?? '—'}</p>
                        <div>
                            <strong>Description:</strong>
                            <FormattedDescription description={selectedSpecies.description} />
                        </div>
                        <p><strong>Sources:</strong></p>
                        <ul>
                            {selectedSpecies.sources?.map((source, index) => (
                                <li key={index}>{source}</li>
                            )) ?? <li>—</li>}
                        </ul>
                    </div>
                </div>
            )}

            <button
                onClick={selectSpeciesClick}
                className="fixed bottom-6 right-6 bg-blue-500 text-white py-2 px-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
            >
                Select Species
            </button>
        </div>
    );
}