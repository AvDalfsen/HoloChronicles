import React, { useState } from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import type { Character } from '@/types/character';
import type { Specialization } from '@/types/specialization';
import type { Career } from '@/types/career';
import type { Skill } from '@/types/skill';
import {
    useCachedData, CAREERS_API_KEY, CAREERS_CACHE_KEY, SKILLS_API_KEY, SKILLS_CACHE_KEY,
    SPECIALIZATIONS_API_KEY, SPECIALIZATIONS_CACHE_KEY,
} from '@/pages/utils/fetcher';
import { MinusSquare, PlusSquare } from 'lucide-react';
import { FormattedDescription } from '@/lib/descriptionFormatter';
import { getExperienceSummary } from '@/domain/character/experience';
import { getFreeSkillAllowance, planCharacterChoice } from '@/domain/character/careerChoices';
import { resolveCareerSkillKeys } from '@/domain/character/careerSkills';
import { getOwnedSpecializationKeys, getStartingSpecializationKey, getSpecializationGroups, getSpecializationPurchaseCost } from '@/domain/character/specializationSelections';
import { useCharacterChoiceAction } from '@/features/character/useCharacterChoiceAction';
import { CharacterChoiceFeedback } from '@/components/character/choiceConfirmation';

export default function Specializations() {
    const { character, updateCharacter } = useCharacterStore();
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [pendingSale, setPendingSale] = useState<{ spec: Specialization; before: Character } | null>(null);
    const specs = useCachedData<Specialization[]>(SPECIALIZATIONS_API_KEY, SPECIALIZATIONS_CACHE_KEY);
    const careers = useCachedData<Career[]>(CAREERS_API_KEY, CAREERS_CACHE_KEY);
    const skills = useCachedData<Skill[]>(SKILLS_API_KEY, SKILLS_CACHE_KEY);
    const definitions = { careers: careers.data ?? [], skills: skills.data ?? [], specializations: specs.data ?? [] };
    const action = useCharacterChoiceAction(definitions);

    if (specs.loading || careers.loading || skills.loading) return <p>Loading…</p>;
    if (specs.error || careers.error || skills.error) return <p role="alert">{specs.error || careers.error || skills.error}</p>;
    if (!specs.data || !careers.data || !skills.data) return <p role="alert">Data missing.</p>;

    const career = careers.data.find(item => item.key === character.career);
    const startingKey = getStartingSpecializationKey(character);
    const starting = specs.data.find(item => item.key === startingKey);
    const selected = specs.data.find(item => item.key === selectedKey);
    const active = starting ?? selected;
    const owned = getOwnedSpecializationKeys(character);
    const allowance = getFreeSkillAllowance(character, 'starting-specialization', definitions);
    const groups = getSpecializationGroups(character, specs.data, career)
        .filter(group => startingKey || group.label === 'Purchased Specializations' || group.label === 'Career Specializations');

    // Additional paid specialization accounting remains the next domain slice.
    const purchaseAdditional = (spec: Specialization) => {
        const cost = getSpecializationPurchaseCost(character, spec, career);
        if (!startingKey || owned.includes(spec.key) || getExperienceSummary(character).available < cost) return;
        const specializations = [...character.specializations, spec.key];
        const membership = resolveCareerSkillKeys({ ...character, specializations }, definitions);
        if (!membership.ok) { setActionError(membership.message); return; }
        setActionError(null);
        updateCharacter({ specializations,
            skills: character.skills.map(skill => ({ ...skill, isCareer: membership.keys.has(skill.key) })),
            experience: { ...character.experience, usedExperience: character.experience.usedExperience + cost },
        });
    };
    const sellAdditional = (spec: Specialization, before: Character) => {
        if (useCharacterStore.getState().character !== before) {
            setActionError('Your character changed while this confirmation was open. Review the sale again.');
            setPendingSale(null);
            return;
        }
        const specializations = character.specializations.filter(key => key !== spec.key);
        const membership = resolveCareerSkillKeys({ ...character, specializations }, definitions);
        if (!membership.ok) { setActionError(membership.message); return; }
        const talentRefund = character.talents.filter(block => block.specializationKey === spec.key)
            .flatMap(block => block.talents).reduce((sum, talent) => sum + (talent.purchaseCost ?? (talent.row + 1) * 5), 0);
        const refund = owned.length * 10 + (career?.specializations.includes(spec.key) || spec.universal ? 0 : 10) + talentRefund;
        if (refund > character.experience.usedExperience) {
            setActionError('The refund exceeds spent XP. Reconcile the specialization purchases before selling.');
            setPendingSale(null);
            return;
        }
        updateCharacter({ specializations,
            talents: character.talents.filter(block => block.specializationKey !== spec.key),
            skills: character.skills.map(skill => ({ ...skill, isCareer: membership.keys.has(skill.key) })),
            experience: { ...character.experience, usedExperience: character.experience.usedExperience - refund },
        });
        setActionError(null);
        setPendingSale(null);
    };
    const remove = (spec: Specialization) => {
        setActionError(null);
        if (spec.key === startingKey) action.request({ type: 'starting-specialization', key: null });
        else if (character.talents.some(block => block.specializationKey === spec.key && block.talents.length)) {
            setPendingSale({ spec, before: character });
        } else sellAdditional(spec, character);
    };

    return <div className="z-20 p-5 w-full flex items-start space-x-6">
        {actionError && <p role="alert" className="text-destructive">{actionError}</p>}
        <CharacterChoiceFeedback action={action} />
        <div className="sticky top-0 bg-white border rounded-lg shadow-md overflow-auto max-w-2xl">
            <table aria-label="Specializations" className="w-full table-fixed text-sm text-left border-collapse">
                <thead className="table-header"><tr><th className="table-cell">Name</th><th className="table-cell">Cost</th><th className="table-cell"> </th></tr></thead>
                <tbody>{groups.map(({ label, specs: entries }) => entries.length > 0 && <React.Fragment key={label}>
                    <tr className="bg-gray-100"><td colSpan={3} className="px-4 py-2 font-semibold">{label}</td></tr>
                    {entries.map(spec => {
                        const purchased = owned.includes(spec.key);
                        const quote = !startingKey && !purchased ? planCharacterChoice(character, { type: 'starting-specialization', key: spec.key }, definitions) : null;
                        const cost = getSpecializationPurchaseCost(character, spec, career);
                        const disabled = !purchased && (quote ? !quote.ok : getExperienceSummary(character).available < cost);
                        return <tr key={spec.key} onClick={() => setSelectedKey(spec.key)} className={`cursor-pointer hover:bg-gray-50 ${selectedKey === spec.key ? 'bg-blue-50' : ''}`}>
                            <td className="border-t px-4 py-2 font-medium">{spec.name}</td>
                            <td className="border-t px-4 py-2">{purchased ? '' : startingKey ? cost : 'Free'}</td>
                            <td className="border-t px-4 py-2 text-right">{selectedKey === spec.key && <button
                                title={purchased ? 'Unselect this specialization' : 'Select this specialization'}
                                aria-label={`${purchased ? 'Remove' : 'Select'} ${spec.name}`}
                                disabled={disabled}
                                onClick={event => {
                                    event.stopPropagation();
                                    setActionError(null);
                                    if (purchased) remove(spec);
                                    else if (!startingKey) action.request({ type: 'starting-specialization', key: spec.key });
                                    else purchaseAdditional(spec);
                                }}>
                                {purchased ? <MinusSquare className="w-5 h-5 inline" /> : <PlusSquare className="w-5 h-5 inline" />}
                            </button>}</td>
                        </tr>;
                    })}
                </React.Fragment>)}</tbody>
            </table>
        </div>
        {selected && <div className="card w-1/3 max-h-[calc(100vh-130px)] overflow-auto">
            <h2 className="text-lg font-semibold mb-4">{selected.name}</h2>
            <FormattedDescription description={selected.description} />
        </div>}
        {active && <div className="card w-1/3 max-h-[calc(100vh-130px)] overflow-auto">
            <h2 className="text-lg font-semibold mb-4">Specialization skills</h2>
            <ul>{active.careerSkills.map(key => {
                const name = definitions.skills.find(skill => skill.key === key)?.name ?? key;
                const checked = !!startingKey && character.skills.some(skill => skill.key === key && skill.rank.specializationRanks === 1);
                const choice = { type: 'free-skill', source: 'starting-specialization', sourceKey: active.key, skillKey: key, selected: !checked } as const;
                const quote = startingKey === active.key ? planCharacterChoice(character, choice, definitions) : null;
                return { key, name, checked, choice, quote };
            }).sort((a, b) => a.name.localeCompare(b.name)).map(({ key, name, checked, choice, quote }) => <li key={key} className="flex items-center justify-between border-t px-4 py-2">
                <span>{name}</span><input type="checkbox" aria-label={`Free starting-specialization rank in ${name}`}
                    checked={checked} disabled={!quote?.ok} title={quote && !quote.ok ? quote.message : undefined}
                    onChange={() => action.request(choice)} />
            </li>)}</ul>
            <p className="mt-2 font-medium">{startingKey ? `Remaining free specialization skills: ${allowance.remaining}` : 'Please choose your starting specialization.'}</p>
        </div>}
        {pendingSale && <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50" role="dialog" aria-label="Sell specialization">
            <div className="bg-background p-6 rounded shadow-md max-w-sm">
                <h3>Sell {pendingSale.spec.name}?</h3>
                <p>This also removes and refunds its purchased talents.</p>
                <button className="btn" onClick={() => sellAdditional(pendingSale.spec, pendingSale.before)}>Yes, sell it</button>
                <button className="btn" onClick={() => setPendingSale(null)}>Cancel</button>
            </div>
        </div>}
    </div>;
}
