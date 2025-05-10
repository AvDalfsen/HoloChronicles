import { useEffect, useState } from 'react';
import { fetchDataWithRetryAndCache } from '@/api/dataFetcher';
import { useCharacterStore } from '@/stores/characterStore';
import { Career } from '@/types/career';
import { Skill } from '@/types/skill';
import { SKILLS_CACHE_KEY, SKILLS_API_KEY } from '@/pages/character/skills';
import { PlusSquare } from 'lucide-react';
import { FormattedDescription } from '@/lib/descriptionFormatter';

const CAREERS_CACHE_KEY = 'careersCache';
const CAREERS_API_KEY = '/api/career';

function Careers() {
    const [careers, setCareers] = useState<Career[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
    const numberOfChosenCareerSkills = useCharacterStore(
        (state) => state.character.skills.filter(s => s.rank.careerRanks === 1).length
    );
    const { character, updateCharacter } = useCharacterStore();
    const remaining = (selectedCareer?.freeRanks ?? 4) - numberOfChosenCareerSkills;

    useEffect(() => {
        async function loadCareers() {
            try {
                const data = await fetchDataWithRetryAndCache<Career[]>(
                    CAREERS_API_KEY,
                    CAREERS_CACHE_KEY
                );
                if (data) {
                    setCareers(data);
                    const currentCareer = data.find((careerItem) => careerItem.key === character.career)
                    setSelectedCareer(currentCareer ?? null);
                } else {
                    setError('No career data returned');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to fetch careers');
            } finally {
                setLoading(false);
            }
        }

        async function loadSkills() {
            const data = await fetchDataWithRetryAndCache<Skill[]>(
                SKILLS_API_KEY,
                SKILLS_CACHE_KEY
            );
            if (data) {
                setSkills(data);
            } else {
                setError('Failed to fetch skills');
            }
        }

        loadCareers();
        loadSkills();
    }, []);

    const onCareerClick = (c: Career) => {
        setSelectedCareer(c);
        console.log('Career selected:', c.key);
    };

    const selectCareerClick = () => {
        selectedCareer?.careerSkills

        updateCharacter({
            career: selectedCareer?.key,
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
            skills: updatedSkills,
        });
    }

    if (loading) {
        return (
            <div className="p-6">
                <p><em>Loading careers...</em></p>
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
        <div className="z-20 p-5 w-full flex space-x-6">
            {/* Career Table */}
            <div className="sticky top-0 left-0 bg-white border rounded-lg shadow-md overflow-auto max-w-2xl">
                <table className="w-full table-fixed text-sm text-left border-collapse">
                    <thead className="table-header">
                        <tr>
                            <th className="table-cell w-[30%] min-w-[150px]"> Name </th>
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
                                <td className="border-t px-4 py-2 w-[20px]">{c.sources ?? '-'}</td>
                                <td className="border-t px-4 py-2 text-right">
                                    {selectedCareer?.key === c.key && (
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
                <div className="card w-1/3 h-[calc(100vh-130px)] overflow-auto">
                    <h2 className="text-lg font-semibold mb-4">{selectedCareer.name}</h2>
                    <div>
                        <div>
                            <strong>Description:</strong>
                            <FormattedDescription description={selectedCareer.description} />
                        </div>
                    </div>
                </div>
            )}
            {/* Selected Career Info Card */}
            {selectedCareer && (
                <div className="card w-1/3 overflow-auto">
                    <h2 className="text-lg font-semibold mb-4">Career skills</h2>
                    <ul>
                        {selectedCareer.careerSkills
                            ?.map(sk => {
                                const isChecked = character.skills.find(s => s.key === sk)?.rank.careerRanks === 1;
                                return { key: sk, isChecked };
                            })
                            .sort((a, b) => a.key.localeCompare(b.key))
                            .filter(({ isChecked }) => remaining > 0 || isChecked)  // show unchecked only if you still have picks
                            .map(({ key: skillKey, isChecked }, idx) => {
                                const skill = skills.find(s => s.key === skillKey);
                                return (
                                    <li key={idx} className="flex items-center justify-between border-t px-4 py-2">
                                        <span>{skill?.name ?? skillKey}</span>
                                        {selectedCareer.key === character.career && (
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={e => {
                                                const newValue = e.target.checked ? 1 : 0;
                                                updateCharacterCareerSkillValues(skillKey, newValue);
                                            }}
                                        />
                                        )}
                                    </li>
                                );
                            })}

                        <li className="mt-2 font-medium">
                            Remaining career skill picks: {remaining}
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Careers;