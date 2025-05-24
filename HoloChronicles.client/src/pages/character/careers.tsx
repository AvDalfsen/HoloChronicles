import { useEffect, useState } from 'react';
import { Career } from '@/types/career';
import { Skill } from '@/types/skill';
import { useCharacterStore } from '@/stores/characterStore';
import { PlusSquare } from 'lucide-react';
import { FormattedDescription } from '@/lib/descriptionFormatter';
import {
    useCachedData,
    CAREERS_API_KEY, CAREERS_CACHE_KEY,
    SKILLS_API_KEY, SKILLS_CACHE_KEY
} from '@/pages/utils/fetcher'

export default function Careers() {
    const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
    const [currentCareer, setCurrentCareer] = useState<Career | null>(null);
    const remainingCareerSkills = useCharacterStore(
        (state) => state.character.careerRanksRemaining
    );
    const { character, updateCharacter } = useCharacterStore();

    const { data: careers, loading: loadingCareers, error: errorCareers } =
        useCachedData<Career[]>(CAREERS_API_KEY, CAREERS_CACHE_KEY);
    const { data: skills, loading: loadingSkills, error: errorSkills } =
        useCachedData<Skill[]>(SKILLS_API_KEY, SKILLS_CACHE_KEY);

    useEffect(() => {
        if (careers && character && character.career) {
            setCurrentCareer(careers.find(
                (careerItem) => careerItem.key === character.career
            )!);
            setSelectedCareer(currentCareer ?? null);
        }
    }, [careers, character]);

    if (loadingCareers || loadingSkills) {
        return <p>Loading…</p>;
    }

    if (errorCareers || errorSkills) {
        return (
            <p className="text-red-500">
                {errorCareers || errorSkills}
            </p>
        );
    }

    if (!careers || !skills) {
        return <p className="text-red-500">Data missing.</p>;
    }

    const onCareerClick = (c: Career) => {
        setSelectedCareer(c);
        console.log('Career selected:', c.key);
    };

    const selectCareerClick = () => {
        let forceRating = 0;
        const selectedCareerForceRating = selectedCareer?.attributes?.forceRating ?? 0;
        if (selectedCareerForceRating > 0) {
            forceRating = selectedCareerForceRating;
        }

        //When choosing a new career, ensure that all previously set (if any) careerskills (including specialization) are set to 0.
        const updatedSkills = character.skills.map(skill => ({
            ...skill,
            rank: {
                ...skill.rank,
                careerRanks: skill.rank.careerRanks === 1 ? 0 : skill.rank.careerRanks,
            },
        }));

        updateCharacter({
            career: selectedCareer?.key,
            careerRanksRemaining: selectedCareer?.freeRanks ?? 4,
            skills: updatedSkills,
            forceRating: forceRating,
        });
    };

    const updateCharacterCareerSkillValues = (skillKey: string, newValue: number) => {
        const skill = character.skills.find(s => s.key === skillKey);

        const updatedSkills = character.skills.map(s => {
            if (s.key === skillKey) {
                return {
                    ...s,
                    rank: {
                        ...s.rank,
                        careerRanks: newValue,
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
                    careerRanks: newValue,
                },
            });
        }

        updateCharacter({
            ...character,
            careerRanksRemaining: character.careerRanksRemaining - (newValue === 1 ? 1 : -1),
            skills: updatedSkills,
        });
    }

    return (
        <div className="z-20 p-5 w-full flex items-start space-x-6">
            {/* Career Table */}
            <div className="sticky top-0 left-0 bg-white border rounded-lg shadow-md overflow-auto max-w-2xl">
                <table className="w-full table-fixed text-sm text-left border-collapse">
                    <thead className="table-header">
                        <tr>
                            <th className="table-cell w-[25%] min-w-[150px]"> Name </th>
                            <th className="table-cell w-[18%]"> Free skills </th>
                            <th className="table-cell w-[25%]"> Force rating </th>
                            <th className="table-cell"> Source </th>
                            <th className="table-cell w-10 text-right"> </th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...careers]
                        .sort((a, b) => {
                            const aSource = a.sources?.[0] ?? '';
                            const bSource = b.sources?.[0] ?? '';
                            return aSource.localeCompare(bSource);
                        })
                        .map((c) => (
                            <tr
                                key={c.key}
                                className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedCareer?.key === c.key ? 'bg-blue-50' : ''}`}
                                onClick={() => onCareerClick(c)}
                            >
                                <td className="border-t px-4 py-2 w-[20%] font-medium">{c.name ?? 'Unnamed'}</td>
                                <td className="border-t px-4 py-2 w-[20px]">{c.freeRanks ?? '4'}</td>
                                <td className="border-t px-4 py-2 w-[20px]">{c.attributes?.forceRating ?? '-'}</td>
                                <td className="border-t px-4 py-2 w-[20px]"> 
                                    {c.sources
                                        ? (c.sources[0].match(/^(.*?)(?=\sCore|\s-\s)/)?.[1] ?? c.sources[0])
                                        : '-'}
                                </td>
                                <td className="border-t px-4 py-2 text-right">
                                    {selectedCareer !== currentCareer && selectedCareer?.key === c.key && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent row click
                                                selectCareerClick();
                                            }}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="Select this career"
                                        >
                                            <PlusSquare className="w-5 h-5 inline" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Selected Career Info Card */}
            {selectedCareer && (
                <div className="card w-1/3 max-h-[calc(100vh-130px)] overflow-auto">
                    <h2 className="text-lg font-semibold mb-4">{selectedCareer.name}</h2>
                    <div>
                        <div>
                            <strong>Description:</strong>
                            <FormattedDescription description={selectedCareer.description} />
                        </div>
                    </div>
                </div>
            )}
            {/* Selected Career Skills Card */}
            {selectedCareer && (
                <div className="card w-1/3 max-h-[calc(100vh-130px)] overflow-auto">
                    <h2 className="text-lg font-semibold mb-4">Career skills</h2>
                    <ul>
                        {(selectedCareer.careerSkills ?? [])
                            .map((sk) => {
                                const skill = skills.find((s) => s.key === sk);
                                return {
                                    key: sk,
                                    name: skill?.name ?? sk,
                                    isChecked:
                                        character.skills.find((s) => s.key === sk)?.rank
                                            .careerRanks === 1,
                                };
                            })
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(({ key: skillKey, name, isChecked }, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-center justify-between border-t px-4 py-2"
                                >
                                    <span>{name}</span>
                                    {selectedCareer.key === character.career &&
                                        (remainingCareerSkills > 0 || isChecked) && (
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => {
                                                    const newValue = e.target.checked ? 1 : 0;
                                                    updateCharacterCareerSkillValues(skillKey, newValue);
                                                }}
                                            />
                                        )}
                                </li>
                            ))}
                        {selectedCareer === currentCareer && (
                            <li className="mt-2 font-medium">
                                Remaining free career skills: {remainingCareerSkills}
                            </li>
                        )}
                    </ul>
                </div>
            )}

        </div>
    );
}