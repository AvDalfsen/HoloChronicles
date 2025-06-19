import React, { useState, useEffect } from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import { Talent } from '@/types/talent';
import { Career } from '@/types/career';
import { Specialization } from '@/types/specialization';
import TalentSheet from '@/pages/utils/talentSheet';
import {
    useCachedData,
    CAREERS_API_KEY, CAREERS_CACHE_KEY,
    TALENTS_API_KEY, TALENTS_CACHE_KEY,
    SPECIALIZATIONS_API_KEY, SPECIALIZATIONS_CACHE_KEY
} from '@/pages/utils/fetcher'

export default function Talents() {
    const [selectedSpecialization, setSelectedSpecialization] = useState<Specialization | null>(null);
    const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
    const character = useCharacterStore(state => state.character);

    const { data: careers, loading: loadingCareers, error: errorCareers } =
        useCachedData<Career[]>(CAREERS_API_KEY, CAREERS_CACHE_KEY);

    const { data: talents, loading: loadingTalents, error: errorTalents } =
        useCachedData<Talent[]>(TALENTS_API_KEY, TALENTS_CACHE_KEY);

    const { data: specializations, loading: loadingSpecs, error: errorSpecs } =
        useCachedData<Specialization[]>(SPECIALIZATIONS_API_KEY, SPECIALIZATIONS_CACHE_KEY);

    // ← Hook must be here, before any early returns
    useEffect(() => {
        if (careers && character?.career) {
            const currentCareer = careers.find(c => c.key === character.career) ?? null;
            setSelectedCareer(currentCareer);
        }

        const startingSpecKey = character?.specializations[0];
        if (specializations && startingSpecKey) {
            const startingSpec = specializations.find(spec => spec.key === startingSpecKey);
            if (startingSpec) {
                setSelectedSpecialization(startingSpec);
            }
        }
    }, [careers, character?.career]);

    // now all your early-return guards
    if (loadingSpecs || loadingTalents || loadingCareers) {
        return <p>Loading…</p>;
    }

    if (errorSpecs || errorTalents || errorCareers) {
        return <p className="text-red-500">{errorSpecs || errorTalents || errorCareers}</p>;
    }

    if (!specializations || !talents) {
        return <p className="text-red-500">Data missing.</p>;
    }

    return (
        <div className="z-20 p-5 w-full flex items-start space-x-6">
            <div className="h-[43vw] w-[15vw] min-w-[200px] overflow-y-auto pb-10 bg-white border rounded-lg shadow-md sticky top-0 left-0">
                <table className="w-full table-fixed text-sm text-left border-collapse">
                    <thead className="table-header">
                        <tr>
                            <th className="table-cell w-[100%]">Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            {
                                label: 'Starting Specialization',
                                specs: specializations.filter(
                                    spec => character.specializations[0] === spec.key
                                ),
                            },
                            {
                                label: 'Purchased Specializations',
                                specs: specializations.filter(
                                    spec => character.specializations.includes(spec.key ?? '') && character.specializations[0] !== spec.key
                                ),
                            },
                            {
                                label: 'Career Specializations',
                                specs: specializations.filter(
                                    spec =>
                                        selectedCareer?.specializations.includes(spec.key ?? '') &&
                                        !character.specializations.includes(spec.key ?? '')
                                ),
                            },
                            {
                                label: 'Universal Specializations',
                                specs: specializations.filter(
                                    spec =>
                                        spec.universal &&
                                        !character.specializations.includes(spec.key ?? '')
                                ),
                            },
                            {
                                label: 'Non-Career Specializations',
                                specs: specializations.filter(
                                    spec =>
                                        !spec.universal &&
                                        !selectedCareer?.specializations.includes(spec.key ?? '') &&
                                        !character.specializations.includes(spec.key ?? '')
                                ),
                            },
                        ].map(({ label, specs }) => (
                            specs.length > 0 && (
                                <React.Fragment key={label}>
                                    <tr className="bg-gray-100">
                                        <td colSpan={5} className="px-4 py-2 font-semibold text-gray-700">
                                            {label}
                                        </td>
                                    </tr>
                                    {specs.map(spec => (
                                        <tr
                                            key={spec.key}
                                            className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedSpecialization?.key === spec.key ? 'bg-blue-50' : ''}`}
                                            onClick={() => setSelectedSpecialization(spec)}
                                        >
                                            <td className="border-t px-4 py-2 w-[20px] font-medium">{spec.name}</td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            )
                        ))}
                    </tbody>
                </table>
            </div>
            <table>
                <tbody>
                    {selectedSpecialization && talents ? (
                        <tr>
                            <td colSpan={100}>
                                <TalentSheet
                                    specialization={selectedSpecialization}
                                    talents={talents}
                                />
                            </td>
                        </tr>
                    ) : (
                        <tr>
                            <td>Specialization or talents not found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}