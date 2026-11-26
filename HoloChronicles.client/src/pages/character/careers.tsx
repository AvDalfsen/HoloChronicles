import { useState } from 'react';
import type { Career } from '@/types/career';
import type { Skill } from '@/types/skill';
import type { Specialization } from '@/types/specialization';
import { useCharacterStore } from '@/stores/characterStore';
import { PlusSquare } from 'lucide-react';
import { FormattedDescription } from '@/lib/descriptionFormatter';
import { CharacterChoiceFeedback } from '@/components/character/choiceConfirmation';
import { useCharacterChoiceAction } from '@/features/character/useCharacterChoiceAction';
import { getFreeSkillAllowance, planCharacterChoice } from '@/domain/character/careerChoices';
import {
    useCachedData, CAREERS_API_KEY, CAREERS_CACHE_KEY, SKILLS_API_KEY, SKILLS_CACHE_KEY,
    SPECIALIZATIONS_API_KEY, SPECIALIZATIONS_CACHE_KEY,
} from '@/pages/utils/fetcher';

export default function Careers() {
    const character = useCharacterStore(state => state.character);
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const careers = useCachedData<Career[]>(CAREERS_API_KEY, CAREERS_CACHE_KEY);
    const skills = useCachedData<Skill[]>(SKILLS_API_KEY, SKILLS_CACHE_KEY);
    const specializations = useCachedData<Specialization[]>(SPECIALIZATIONS_API_KEY, SPECIALIZATIONS_CACHE_KEY);
    const definitions = { careers: careers.data ?? [], skills: skills.data ?? [], specializations: specializations.data ?? [] };
    const action = useCharacterChoiceAction(definitions);

    if (careers.loading || skills.loading || specializations.loading) return <p>Loading…</p>;
    if (careers.error || skills.error || specializations.error) return <p role="alert">{careers.error || skills.error || specializations.error}</p>;
    if (!careers.data || !skills.data || !specializations.data) return <p role="alert">Data missing.</p>;

    const current = careers.data.find(career => career.key === character.career);
    const selected = careers.data.find(career => career.key === selectedKey) ?? current;
    const allowance = getFreeSkillAllowance(character, 'career', definitions);
    const selection = selected ? planCharacterChoice(character, { type: 'career', key: selected.key }, definitions) : null;

    return (
        <div className="z-20 p-5 w-full flex items-start space-x-6">
            <CharacterChoiceFeedback action={action} />
            <div className="sticky top-0 left-0 bg-white border rounded-lg shadow-md overflow-auto max-w-2xl">
                <table className="w-full table-fixed text-sm text-left border-collapse" aria-label="Careers">
                    <thead className="table-header"><tr><th>Name</th><th>Free skills</th><th>Force rating</th><th>Source</th><th /></tr></thead>
                    <tbody>
                        {[...careers.data].sort((a, b) => (a.sources?.[0] ?? '').localeCompare(b.sources?.[0] ?? '')).map(career => (
                            <tr key={career.key} onClick={() => setSelectedKey(career.key)} className={`hover:bg-gray-50 cursor-pointer ${selected?.key === career.key ? 'bg-blue-50' : ''}`}>
                                <td className="border-t px-4 py-2 font-medium">{career.name}</td>
                                <td className="border-t px-4 py-2">{career.freeRanks ?? 4}</td>
                                <td className="border-t px-4 py-2">{career.attributes?.forceRating ?? career.forceRating ?? '-'}</td>
                                <td className="border-t px-4 py-2">{career.sources?.[0] ?? '-'}</td>
                                <td className="border-t px-4 py-2">
                                    {selected?.key === career.key && career.key !== character.career && (
                                        <button title="Select this career" aria-label={'Select ' + career.name}
                                            disabled={!selection?.ok}
                                            onClick={event => { event.stopPropagation(); action.request({ type: 'career', key: career.key }); }}>
                                            <PlusSquare className="w-5 h-5 text-blue-600" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {selection && !selection.ok && <p role="alert" className="text-destructive p-3">{selection.message}</p>}
            </div>
            {selected && <>
                <div className="card w-1/3 max-h-[calc(100vh-130px)] overflow-auto">
                    <h2 className="text-lg font-semibold mb-4">{selected.name}</h2>
                    <FormattedDescription description={selected.description} />
                </div>
                <div className="card w-1/3 max-h-[calc(100vh-130px)] overflow-auto">
                    <h2 className="text-lg font-semibold mb-4">Career skills</h2>
                    <ul>
                        {selected.careerSkills.map(key => {
                            const skill = definitions.skills.find(item => item.key === key);
                            const checked = (character.skills.find(item => item.key === key)?.rank.careerRanks ?? 0) === 1;
                            const choice = { type: 'free-skill' as const, source: 'career' as const, sourceKey: selected.key, skillKey: key, selected: !checked };
                            const plan = planCharacterChoice(character, choice, definitions);
                            return <li key={key} className="flex items-center justify-between border-t px-4 py-2">
                                <span>{skill?.name ?? key}</span>
                                {selected.key === character.career && <input type="checkbox"
                                    aria-label={'Free career rank in ' + (skill?.name ?? key)}
                                    checked={checked} disabled={!plan.ok} title={plan.ok ? undefined : plan.message}
                                    onChange={() => action.request(choice)} />}
                            </li>;
                        })}
                    </ul>
                    {selected.key === character.career && <p className="mt-2 font-medium">Remaining free career skills: {allowance.remaining}</p>}
                </div>
            </>}
        </div>
    );
}
