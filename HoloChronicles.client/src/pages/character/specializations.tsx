import React, { useEffect, useState } from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import { Specialization } from '@/types/specialization';
import { Career } from '@/types/career';
import { Skill } from '@/types/skill';
import {
    useCachedData,
    CAREERS_API_KEY, CAREERS_CACHE_KEY,
    SKILLS_API_KEY, SKILLS_CACHE_KEY,
    SPECIALIZATIONS_API_KEY, SPECIALIZATIONS_CACHE_KEY
} from '@/pages/utils/fetcher';
import { MinusSquare, PlusSquare } from 'lucide-react';
import { FormattedDescription } from '@/lib/descriptionFormatter';

export default function Specializations() {
    const { character, updateCharacter } = useCharacterStore();

    const numberOfSpecializations = character.specializations.length ?? 0;

    const { data: specializations, loading: loadingSpecs, error: errorSpecs } =
        useCachedData<Specialization[]>(SPECIALIZATIONS_API_KEY, SPECIALIZATIONS_CACHE_KEY);

    const { data: careers, loading: loadingCareers, error: errorCareers } =
        useCachedData<Career[]>(CAREERS_API_KEY, CAREERS_CACHE_KEY);

    const { data: skills, loading: loadingSkills, error: errorSkills } =
        useCachedData<Skill[]>(SKILLS_API_KEY, SKILLS_CACHE_KEY);

    const [selectedSpecialization, setSelectedSpecialization] = useState<Specialization | null>(null);
    const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
    const [selectedSpecializationIsCareerOrUniversal, setSelectedSpecializationIsCareerOrUniversal] = useState(true);

    const remainingSpecializationsSkills = 2 - (character.skills.filter(s => s.rank.specializationRanks === 1).length ?? 0);

    // Sale conditionals ***
    const [pendingSpec, setPendingSpec] = useState<Specialization | null>(null);
    const handleConfirmSell = () => {
        if (pendingSpec) performSale(pendingSpec);
        setPendingSpec(null);
    };

    const handleCancelSell = () => setPendingSpec(null);
    // ***

    useEffect(() => {
        if (careers && character?.career) {
            const currentCareer = careers.find(
                (careerItem) => careerItem.key === character.career
            );
            setSelectedCareer(currentCareer ?? null);
        }
    }, [careers, character?.career]);

    if (loadingSpecs || loadingCareers || loadingSkills) {
        return <p>Loading…</p>;
    }

    if (errorSpecs || errorCareers || errorSkills) {
        return (
            <p className="text-red-500">
                {errorSpecs || errorCareers || errorSkills}
            </p>
        );
    }

    if (!specializations || !skills || !careers) {
        return <p className="text-red-500">Data missing.</p>;
    }

    const startingSpecialization = character.specializations.length > 0
        ? specializations.find(s => s.key === character.specializations[0])
        : null;

    const activeSpecialization = startingSpecialization || selectedSpecialization; // Show either skills from the selected specialization, or the starting specialization if it has been purchased.

    const onSpecializationClick = (spec: Specialization) => {
        setSelectedSpecialization(spec);
        if (selectedCareer?.specializations.includes(spec.key ?? '') || spec.universal) {
            setSelectedSpecializationIsCareerOrUniversal(true);
        }
        console.log('Specialization selected:', spec.key)
    };

    const selectStartingSpecializationClick = () => {
        //When choosing a new starting specialization, ensure that all previously set (if any) specialization ranks are set to 0.
        const updatedSkills = character.skills.map(skill => ({
            ...skill,
            rank: {
                ...skill.rank,
                specializationRanks: skill.rank.specializationRanks === 1 ? 0 : skill.rank.specializationRanks,
            },
        }));

        const updatedSpecializations = character.specializations;
        updatedSpecializations[0] = selectedSpecialization?.key ?? '';

        updateCharacter({
            specializations: updatedSpecializations,
            skills: updatedSkills,
        });
    };

    const updateCharacterSpecializationSkillValues = (skillKey: string, newValue: number) => {
        const skill = character.skills.find(s => s.key === skillKey);

        const updatedSkills = character.skills.map(s => {
            if (s.key === skillKey) {
                return {
                    ...s,
                    rank: {
                        ...s.rank,
                        specializationRanks: newValue,
                    },
                };
            }
            return s;
        });

        // If the skill wasn't found, add it
        if (!skill) {
            updatedSkills.push({
                key: skillKey,
                rank: {
                    specializationRanks: newValue,
                },
            });
        }

        updateCharacter({
            skills: updatedSkills,
        });
    }

    const sellSpecializationClick = (spec: Specialization) => {
        const specTalents = character.talents.find(t => t.specializationKey === spec.key);
        // If the specialization to-be-sold has purchased talents, notify the user
        const hasTalents = specTalents?.talents.length ?? 0 > 0;
        // If the user has purchased skills, those will be reset when the starting specialization is sold
        const hasPurchasedSkills = spec.key === startingSpecialization!.key && (character.skills.filter(s => s.rank.purchasedRanks ?? 0 > 0).length ?? 0) > 0;

        // Need confirmation only when talents would be lost
        if (hasTalents || hasPurchasedSkills) {
            setPendingSpec(spec);
        } else {
            performSale(spec);
        }
    };

    const performSale = (specialization: Specialization) => {
        const isStartingSpec = specialization === startingSpecialization;

        const specTalentsBlock = character.talents.find(
            t => t.specializationKey === specialization.key
        );

        const boughtTalents = specTalentsBlock?.talents ?? [];

        let refundTalentXP = 0;
        for (const t of boughtTalents) {
            refundTalentXP += (t.row + 1) * 5;
        }

        const specXP =
            (selectedSpecializationIsCareerOrUniversal ? 0 : 10) + //   career/universal discount
            numberOfSpecializations * 10;                          // + tier surcharge
        const totalRefund = refundTalentXP + (isStartingSpec ? 0 : specXP);

        const updatedTalents = character.talents.filter(
            t => t.specializationKey !== specialization.key
        );

        // Needed for selling both starting and non-starting specializations
        const basePatch = {
            talents: updatedTalents,
            experience: {
                ...character.experience,
                usedExperience: character.experience.usedExperience - totalRefund,
            },
        };

        if (isStartingSpec) {
            // Reset specialization ranks for all skills that referenced the start-spec
            const updatedSkills = character.skills.map(skill => ({
                ...skill,
                rank: {
                    ...skill.rank,
                    specializationRanks: skill.rank.specializationRanks === 1 ? 0 : skill.rank.specializationRanks,
                },
            }));

            // TODO: Only for starting spec, if already-purchased skills become careerskills upon purchasing the starting career, refund a certain amount of XP.

            const updatedSpecializations = [...character.specializations];
            updatedSpecializations[0] = '';

            updateCharacter({
                ...basePatch,
                skills: updatedSkills,
                specializations: updatedSpecializations,
            });
        } else {
            updateCharacter({
                ...basePatch,
                specializations: character.specializations.filter(
                    spec => spec !== specialization.key
                ),
            });
        }
    };

    // TODO: Add new specialization's skills to career skills.
    // TODO: Some Universal specializations grant a Force Rating
    // TDOO: Retroactively apply purchased talents if user gets a Force Rating after purchasing Force talents
    const purchaseSpecializationClick = (specialization: Specialization) => {
        const currentUsedXP = character.experience.usedExperience;
        const xpChange = (numberOfSpecializations + 1) * 10 - (selectedSpecializationIsCareerOrUniversal ? 0 : 10);

        const updatedSpecializations = [...character.specializations, specialization.key];

        updateCharacter({
            experience: {
                ...character.experience,
                usedExperience: currentUsedXP + xpChange,
            },
            specializations: updatedSpecializations,
        });
    }

    //TODO: on purchasing Republic Representative, show window to allow user to pick knowledge skill (addlCareerSkill) as new career skill.
    return (
        <div className="z-20 p-5 w-full flex items-start space-x-6">
            {!startingSpecialization && (
                <div className="sticky top-0 left-0 bg-white border rounded-lg shadow-md overflow-auto max-w-2xl">
                    <table className="w-full table-fixed text-sm text-left border-collapse">
                        <thead className="table-header">
                            <tr>
                                <th className="table-cell w-[50%] min-w-[150px]">Name</th>
                                <th className="table-cell w-10 text-right"> </th>
                            </tr>
                        </thead>
                        <tbody>
                            {specializations
                                .filter((spec) =>
                                    selectedCareer?.specializations.includes(spec.key ?? '')
                                )
                                .map((spec) => {
                                    const isPurchased = character.specializations.includes(spec.key ?? '');
                                    const isActive = selectedSpecialization?.key === spec.key;

                                    return (
                                        <tr
                                            key={spec.key}
                                            className={`
                                                hover:bg-gray-50 transition-colors 
                                                ${isPurchased ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} 
                                                ${isActive ? 'bg-blue-50' : ''}
                                            `}
                                            onClick={() => {
                                                if (!isPurchased) {
                                                    onSpecializationClick(spec);
                                                }
                                            }}
                                        >
                                            <td className="border-t px-4 py-2 font-medium">
                                                {spec.name}
                                                {isPurchased && <span className="text-gray-500"> – Purchased</span>}
                                            </td>
                                            <td className="border-t px-4 py-2 text-right">
                                                {isActive && !isPurchased && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent row click
                                                            selectStartingSpecializationClick();
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="Select this specialization"
                                                    >
                                                        <PlusSquare className="w-5 h-5 inline" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            )}
            {startingSpecialization && (
                <div className="sticky top-0 left-0 bg-white border rounded-lg shadow-md overflow-auto max-w-2xl">
                    <table className="w-full table-fixed text-sm text-left border-collapse">
                        <thead className="table-header">
                            <tr>
                                <th className="table-cell w-[40%] min-w-[150px]">Name</th>
                                <th className="table-cell">Cost</th>
                                <th className="table-cell w-10 text-right"> </th>
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
                                                onClick={() => onSpecializationClick(spec)}
                                            >
                                                <td className="border-t px-4 py-2 w-[20px] font-medium">{spec.name}</td>
                                                <td className="border-t px-4 py-2 w-[20px] font-medium">
                                                    
                                                    {//If specialization has already been purchased, do not show a cost
                                                     character.specializations.includes(spec.key) ? '' : (selectedCareer?.specializations.includes(spec.key ?? '') || spec.universal ? 0 : 10) + (10 * (numberOfSpecializations + 1))}
                                                </td>
                                                <td className="border-t px-4 py-2 text-right">
                                                    {selectedSpecialization?.key === spec.key && (
                                                        character.specializations.includes(spec.key ?? '') ? (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    sellSpecializationClick(selectedSpecialization);
                                                                }}
                                                                className="text-red-600 hover:text-red-800"
                                                                title="Unselect this specialization"
                                                            >
                                                                <MinusSquare className="w-5 h-5 inline" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                        purchaseSpecializationClick(selectedSpecialization);
                                                                }}
                                                                className="text-blue-600 hover:text-blue-800"
                                                                title="Select this specialization"
                                                            >
                                                                <PlusSquare className="w-5 h-5 inline" />
                                                            </button>
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                )
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {/* Selected Specialization Info Card */}
            {selectedSpecialization && (
                <div className="card w-1/3 max-h-[calc(100vh-130px)] overflow-auto">
                    <h2 className="text-lg font-semibold mb-4">{selectedSpecialization.name}</h2>
                    <div>
                        <div>
                            <strong>Description:</strong>
                            <FormattedDescription description={selectedSpecialization.description} />
                        </div>
                    </div>
                </div>
            )}
            {/* Selected Specialization Skills Card */}
            {activeSpecialization && (
                <div className="card w-1/3 max-h-[calc(100vh-130px)] overflow-auto">
                    <h2 className="text-lg font-semibold mb-4">Specialization skills</h2>
                    <ul>
                        {(activeSpecialization.careerSkills ?? [])
                            .map(sk => {
                                const skill = skills.find(s => s.key === sk);
                                return {
                                    key: sk,
                                    name: skill?.name ?? sk,
                                    isChecked:
                                        character.skills.find(s => s.key === sk)?.rank
                                            .specializationRanks === 1,
                                };
                            }) // Ensure that the skills with a free specialization rank are checked.
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(({ key: skillKey, name, isChecked }, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-center justify-between border-t px-4 py-2"
                                >
                                    <span>{name}</span>
                                    {(remainingSpecializationsSkills > 0 || isChecked) && (
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={e => {
                                                    const newValue = e.target.checked ? 1 : 0;
                                                    updateCharacterSpecializationSkillValues(
                                                        skillKey,
                                                        newValue
                                                    );
                                                }}
                                            />
                                        )}
                                </li>
                            ))}
                        <li className="mt-2 font-medium">
                            {character.specializations.length === 0 || character.specializations[0] === ''
                                ? 'Please choose your starting specialization.'
                                : `Remaining free specialization skills: ${remainingSpecializationsSkills}`}
                        </li>
                    </ul>
                </div>
            )}
            {pendingSpec && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
                    onClick={handleCancelSell}
                >
                    <div
                        className="bg-background p-6 rounded shadow-md text-center max-w-sm w-full"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold mb-4">
                            Sell {pendingSpec!.name}?
                        </h3>

                        <p className="mb-6 text-sm text-muted-foreground">
                            {pendingSpec?.key === startingSpecialization?.key ? (
                                <>
                                    Selling your <strong>starting</strong> specialization will refund all of its purchased talents, as well as all purchased skills.
                                    <p />
                                    Are you sure?
                                </>
                            ) : (
                                <>
                                    This specialization has purchased talents. Selling it will remove them and refund the XP.
                                    <p />
                                    Are you sure?
                                </>
                            )}
                        </p>

                        <div className="flex justify-center gap-4">
                            <button className="btn" onClick={handleConfirmSell}>
                                Yes, sell it
                            </button>
                            <button className="btn btn-outline" onClick={handleCancelSell}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}