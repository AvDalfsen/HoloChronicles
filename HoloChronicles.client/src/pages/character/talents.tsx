import React, { useState } from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import type { Talent } from '@/types/talent';
import type { Career } from '@/types/career';
import type { Specialization } from '@/types/specialization';
import TalentSheet from '@/pages/utils/talentSheet';
import { getSpecializationGroups, getStartingSpecializationKey } from '@/domain/character/specializationSelections';
import {
    useCachedData, CAREERS_API_KEY, CAREERS_CACHE_KEY, TALENTS_API_KEY, TALENTS_CACHE_KEY,
    SPECIALIZATIONS_API_KEY, SPECIALIZATIONS_CACHE_KEY,
} from '@/pages/utils/fetcher';

export default function Talents() {
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const character = useCharacterStore(state => state.character);
    const careers = useCachedData<Career[]>(CAREERS_API_KEY, CAREERS_CACHE_KEY);
    const talents = useCachedData<Talent[]>(TALENTS_API_KEY, TALENTS_CACHE_KEY);
    const specs = useCachedData<Specialization[]>(SPECIALIZATIONS_API_KEY, SPECIALIZATIONS_CACHE_KEY);

    if (specs.loading || talents.loading || careers.loading) return <p>Loading…</p>;
    if (specs.error || talents.error || careers.error) return <p role="alert">{specs.error || talents.error || careers.error}</p>;
    if (!specs.data || !talents.data || !careers.data) return <p role="alert">Data missing.</p>;

    const career = careers.data.find(item => item.key === character.career);
    const selected = specs.data.find(spec => spec.key === (selectedKey ?? getStartingSpecializationKey(character)));
    return <div className="z-20 p-5 w-full flex items-start space-x-6">
        <div className="h-[43vw] w-[15vw] min-w-[200px] overflow-y-auto pb-10 bg-white border rounded-lg shadow-md sticky top-0">
            <table className="w-full table-fixed text-sm text-left border-collapse">
                <thead className="table-header"><tr><th className="table-cell">Name</th></tr></thead>
                <tbody>{getSpecializationGroups(character, specs.data, career).map(({ label, specs: entries }) => entries.length > 0 && <React.Fragment key={label}>
                    <tr className="bg-gray-100"><td className="px-4 py-2 font-semibold text-gray-700">{label}</td></tr>
                    {entries.map(spec => <tr key={spec.key} onClick={() => setSelectedKey(spec.key)}
                        className={`hover:bg-gray-50 cursor-pointer ${selected?.key === spec.key ? 'bg-blue-50' : ''}`}>
                        <td className="border-t px-4 py-2 font-medium">{spec.name}</td>
                    </tr>)}
                </React.Fragment>)}</tbody>
            </table>
        </div>
        <div>{selected ? <TalentSheet specialization={selected} talents={talents.data} /> : <p>Specialization or talents not found.</p>}</div>
    </div>;
}
