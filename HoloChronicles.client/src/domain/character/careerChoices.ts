import type { Character, CharacterSkill } from '@/types/character';
import type { Career } from '@/types/career';
import { getExperienceSummary } from './experience';
import { planSkillPurchaseReset, type SkillDefinitions } from './skills';
import { resolveCareerSkillKeys } from './careerSkills';
import { getOwnedSpecializationKeys, getStartingSpecializationKey, replaceStartingSpecialization } from './specializationSelections';

export type FreeSkillSource = 'career' | 'starting-specialization';
export type CharacterChoice =
    | { type: 'career'; key: string }
    | { type: 'starting-specialization'; key: string | null }
    | { type: 'free-skill'; source: FreeSkillSource; sourceKey: string; skillKey: string; selected: boolean };

export interface ChoiceConsequences {
    freeRanksRemoved: { skillKey: string; source: FreeSkillSource }[];
    skillsRefunded: { skillKey: string; ranks: number; xp: number }[];
    specializationsRemoved: string[];
    talentsRefunded: { specializationKey: string; talentKey: string; xp: number }[];
}

export type CharacterChoiceResult =
    | { ok: true; character: Character; xpChange: number; consequences: ChoiceConsequences; requiresConfirmation: boolean }
    | { ok: false; code: 'missing-definition' | 'invalid-character' | 'invalid-choice' | 'allowance-exhausted'
        | 'unknown-purchase-cost' | 'stale-plan'; message: string };

const reject = (code: Extract<CharacterChoiceResult, { ok: false }>['code'], message: string): CharacterChoiceResult =>
    ({ ok: false, code, message });
const freeRankField = (source: FreeSkillSource) => source === 'career' ? 'careerRanks' : 'specializationRanks';
const careerForceRating = (career: Career | undefined) => career?.attributes?.forceRating ?? career?.forceRating ?? 0;

export function getFreeSkillAllowance(character: Character, source: FreeSkillSource, definitions: SkillDefinitions) {
    const sourceKey = source === 'career' ? character.career : getStartingSpecializationKey(character);
    const definition = source === 'career'
        ? definitions.careers.find(item => item.key === sourceKey)
        : definitions.specializations.find(item => item.key === sourceKey);
    const allowance = source === 'career' ? (definition as Career | undefined)?.freeRanks ?? 4 : 2;
    const field = freeRankField(source);
    const allocated = character.skills.reduce((sum, skill) => sum + (skill.rank[field] ?? 0), 0);
    return { sourceKey, allowance: definition ? allowance : 0, allocated, remaining: definition ? allowance - allocated : 0 };
}

/** A creation/rebuild edit, not an advancement purchase or a general rank adjustment. */
export function planCharacterChoice(character: Character, choice: CharacterChoice, definitions: SkillDefinitions): CharacterChoiceResult {
    if (!choice || !['career', 'starting-specialization', 'free-skill'].includes(choice.type)
        || (choice.type === 'free-skill' && (!['career', 'starting-specialization'].includes(choice.source) || typeof choice.selected !== 'boolean'))) {
        return reject('invalid-choice', 'The requested character choice is invalid.');
    }
    const consequences: ChoiceConsequences = { freeRanksRemoved: [], skillsRefunded: [], specializationsRemoved: [], talentsRefunded: [] };
    const success = (next: Character, xpChange = 0): CharacterChoiceResult => ({
        ok: true, character: next, xpChange, consequences,
        requiresConfirmation: consequences.skillsRefunded.length > 0 || consequences.talentsRefunded.length > 0
            || (choice.type !== 'free-skill' && (consequences.freeRanksRemoved.length > 0 || consequences.specializationsRemoved.length > 0)),
    });
    const originalMembership = resolveCareerSkillKeys(character, definitions);
    if (!originalMembership.ok) return reject('missing-definition', originalMembership.message);
    if (new Set(getOwnedSpecializationKeys(character)).size !== getOwnedSpecializationKeys(character).length
        || new Set(character.skills.map(skill => skill.key)).size !== character.skills.length
        || character.skills.some(skill => ![skill.rank.careerRanks ?? 0, skill.rank.specializationRanks ?? 0].every(rank => rank === 0 || rank === 1))) {
        return reject('invalid-character', 'The saved career, specialization, or free skill choices are inconsistent and need correction.');
    }

    let next: Character = { ...character, skills: character.skills.map(skill => ({ ...skill, rank: { ...skill.rank } })) };
    const oldStartingKey = getStartingSpecializationKey(character);
    const clearFreeRanks = (source: FreeSkillSource) => {
        const field = freeRankField(source);
        next.skills = next.skills.map(skill => {
            if (!skill.rank[field]) return skill;
            consequences.freeRanksRemoved.push({ skillKey: skill.key, source });
            return { ...skill, rank: { ...skill.rank, [field]: 0 } };
        });
    };
    const setStartingKey = (key: string | null) => {
        next.specializations = replaceStartingSpecialization(character, key);
        clearFreeRanks('starting-specialization');
        if (oldStartingKey) consequences.specializationsRemoved.push(oldStartingKey);
    };

    if (choice.type === 'career') {
        const career = definitions.careers.find(item => item.key === choice.key);
        if (!career) return reject('missing-definition', 'The chosen career definition is missing.');
        if (choice.key === character.career) return success(character);
        const previous = definitions.careers.find(item => item.key === character.career);
        const oldForce = careerForceRating(previous);
        const newForce = careerForceRating(career);
        const forceRating = character.forceRating - oldForce + newForce;
        if (![character.forceRating, oldForce, newForce, forceRating].every(value => Number.isSafeInteger(value) && value >= 0)
            || character.forceRating < oldForce) {
            return reject('invalid-character', 'The saved Force rating does not match its career contribution and needs correction.');
        }
        next.career = career.key;
        next.forceRating = forceRating;
        clearFreeRanks('career');
        if (oldStartingKey && !career.specializations.includes(oldStartingKey)) setStartingKey(null);
    } else if (choice.type === 'starting-specialization') {
        if (choice.key === oldStartingKey) return success(character);
        if (choice.key !== null) {
            const definition = definitions.specializations.find(item => item.key === choice.key);
            const career = definitions.careers.find(item => item.key === character.career);
            if (!definition || !career) return reject('missing-definition', 'The selected career or starting specialization definition is missing.');
            if (!career.specializations.includes(choice.key)) return reject('invalid-choice', 'Choose a starting specialization from the current career.');
            if (getOwnedSpecializationKeys(character).includes(choice.key)) {
                return reject('invalid-choice', 'That specialization is already owned. Converting a paid specialization into the starting choice is not supported yet.');
            }
        }
        setStartingKey(choice.key);
    } else {
        const allowance = getFreeSkillAllowance(character, choice.source, definitions);
        if (!allowance.sourceKey || allowance.sourceKey !== choice.sourceKey) {
            return reject('invalid-choice', 'That free skill source is no longer selected. Review the current choices.');
        }
        const definition = choice.source === 'career'
            ? definitions.careers.find(item => item.key === allowance.sourceKey)
            : definitions.specializations.find(item => item.key === allowance.sourceKey);
        if (!definitions.skills.some(skill => skill.key === choice.skillKey) || !definition?.careerSkills.includes(choice.skillKey)) {
            return reject('invalid-choice', 'That skill is not a free choice from the selected source.');
        }
        if (!Number.isSafeInteger(allowance.allowance) || allowance.allowance < 0) {
            return reject('invalid-character', 'The selected source has an invalid free skill allowance.');
        }
        const field = freeRankField(choice.source);
        const existing = next.skills.find(skill => skill.key === choice.skillKey);
        if (!!existing?.rank[field] === choice.selected) return success(character);
        if (choice.selected && allowance.remaining <= 0) return reject('allowance-exhausted', 'All free skill choices from this source have been allocated.');
        if (choice.selected) {
            const otherFreeRanks = (existing?.rank.speciesRanks ?? 0)
                + (existing?.rank.careerRanks ?? 0) + (existing?.rank.specializationRanks ?? 0);
            if (otherFreeRanks >= 2) return reject('invalid-choice', 'Free creation choices cannot raise the skill above rank 2.');
        }
        const updated: CharacterSkill = existing ?? { key: choice.skillKey, rank: {} };
        updated.rank[field] = choice.selected ? 1 : 0;
        if (!existing) next.skills.push(updated);
        if (!choice.selected) consequences.freeRanksRemoved.push({ skillKey: choice.skillKey, source: choice.source });
    }

    // Only a changed free-rank basis invalidates a paid skill's creation prices.
    // Career membership changes by themselves never reprice earlier purchases.
    const affected = character.skills.filter(skill => {
        const updated = next.skills.find(item => item.key === skill.key);
        return (skill.rank.careerRanks ?? 0) + (skill.rank.specializationRanks ?? 0)
            !== (updated?.rank.careerRanks ?? 0) + (updated?.rank.specializationRanks ?? 0);
    });
    const reset = planSkillPurchaseReset(character, affected.map(skill => skill.key));
    if (!reset.ok) return reject(reset.code === 'unknown-purchase-cost' ? reset.code : 'invalid-character', reset.message);
    for (const skill of affected) {
        if (!(skill.rank.purchasedRanks ?? 0)) continue;
        consequences.skillsRefunded.push({ skillKey: skill.key, ranks: skill.rank.purchasedRanks!, xp: skill.purchases!.reduce((sum, purchase) => sum + purchase.cost, 0) });
        const resetSkill = reset.character.skills.find(item => item.key === skill.key)!;
        next.skills = next.skills.map(item => item.key === skill.key ? { ...resetSkill, rank: { ...resetSkill.rank,
            careerRanks: item.rank.careerRanks, specializationRanks: item.rank.specializationRanks } } : item);
    }

    let talentRefund = 0;
    for (const key of consequences.specializationsRemoved) {
        const blocks = character.talents.filter(block => block.specializationKey === key);
        const talents = blocks.flatMap(block => block.talents);
        if (blocks.length > 1 || new Set(talents.map(talent => `${talent.row}:${talent.col}`)).size !== talents.length) {
            return reject('invalid-character', 'The starting specialization has duplicate saved talent purchases and needs correction.');
        }
        for (const talent of talents) {
            if (!Number.isSafeInteger(talent.purchaseCost) || talent.purchaseCost! < 0) {
                return reject('unknown-purchase-cost', 'This starting specialization has talent purchases without recorded XP costs. Undo or reconcile them before replacing it.');
            }
            talentRefund += talent.purchaseCost!;
            consequences.talentsRefunded.push({ specializationKey: key, talentKey: talent.key, xp: talent.purchaseCost! });
        }
    }
    next.talents = character.talents.filter(block => !consequences.specializationsRemoved.includes(block.specializationKey));
    const membership = resolveCareerSkillKeys(next, definitions);
    if (!membership.ok) return reject('missing-definition', membership.message);
    next.skills = next.skills.map(skill => ({ ...skill, isCareer: membership.keys.has(skill.key) }));
    const xpChange = reset.xpChange - talentRefund;
    const spent = character.experience.usedExperience + xpChange;
    if (!Number.isSafeInteger(spent) || spent < 0) return reject('invalid-character', 'The recorded refunds exceed spent XP; correct the character before applying this change.');
    next = { ...next, experience: { ...character.experience, usedExperience: spent } };
    next.xp = getExperienceSummary(next).available;
    return success(next, xpChange);
}
