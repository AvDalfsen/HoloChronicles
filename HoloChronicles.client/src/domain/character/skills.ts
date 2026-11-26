import type { Character, CharacterSkill, SkillPurchase } from '@/types/character';
import type { Skill } from '@/types/skill';
import type { Career } from '@/types/career';
import type { Specialization } from '@/types/specialization';
import { getCharacteristicKey, recalculateTotalCharacteristic } from './derivedStats';
import { getExperienceSummary } from './experience';
import { capEffectiveRank } from './rankLimits';

export interface SkillDefinitions {
    skills: readonly Skill[];
    careers: readonly Career[];
    specializations: readonly Specialization[];
}

/** Buy one paid rank (+1), or undo the latest known purchase (-1). */
export interface SkillPurchaseChange {
    key: string;
    delta: 1 | -1;
}

type RejectionCode = 'invalid-character' | 'missing-definition' | 'rank-limit'
    | 'insufficient-xp' | 'no-purchase' | 'unknown-purchase-cost';

export type SkillPurchaseResult =
    | { ok: true; character: Character; xpChange: number }
    | { ok: false; code: RejectionCode; message: string };

const reject = (code: RejectionCode, message: string): SkillPurchaseResult => ({ ok: false, code, message });

/** Training prices and the rank-five cap exclude cybernetic bonuses. */
export function getSkillTrainingRank(skill: CharacterSkill | undefined): number {
    return (skill?.rank.speciesRanks ?? 0) + (skill?.rank.careerRanks ?? 0)
        + (skill?.rank.specializationRanks ?? 0) + (skill?.rank.purchasedRanks ?? 0);
}

export function getSkillTotalRanks(skill: CharacterSkill | undefined): number {
    const cybernetics = skill?.rank.cyberRanks ?? 0;
    return capEffectiveRank('skill', getSkillTrainingRank(skill) + cybernetics, cybernetics);
}

/** Numeric pool only; SVGs and presentation stay in the screen. */
export function getSkillDicePool(character: Character, definition: Skill) {
    const skill = character.skills.find(item => item.key === definition.key);
    const key = getCharacteristicKey(skill?.charKeyOverride ?? definition.charKey);
    if (!key) return { ok: false as const, message: `Unknown characteristic for ${definition.name}.` };

    const rank = getSkillTotalRanks(skill);
    const characteristic = recalculateTotalCharacteristic(character, key);
    if (![rank, characteristic].every(value => Number.isSafeInteger(value) && value >= 0)) {
        return { ok: false as const, message: `Invalid ranks or characteristic for ${definition.name}.` };
    }
    const proficiency = Math.min(rank, characteristic);
    return { ok: true as const, rank, proficiency, ability: Math.max(rank, characteristic) - proficiency };
}

function validSkill(skill: CharacterSkill): boolean {
    const ranks = skill.rank;
    const purchases = skill.purchases ?? [];
    return !!ranks && [ranks.speciesRanks ?? 0, ranks.careerRanks ?? 0,
        ranks.specializationRanks ?? 0, ranks.purchasedRanks ?? 0, ranks.cyberRanks ?? 0]
        .every(value => Number.isSafeInteger(value) && value >= 0)
        && Array.isArray(purchases) && purchases.length <= (ranks.purchasedRanks ?? 0)
        && purchases.every(purchase => purchase && Number.isSafeInteger(purchase.cost)
            && purchase.cost > 0 && purchase.cost % 5 === 0 && typeof purchase.nonCareer === 'boolean');
}

function careerStatus(character: Character, key: string, definitions: SkillDefinitions) {
    const career = definitions.careers.find(item => item.key === character.career);
    if (character.career && !career) {
        return { ok: false as const, message: 'The selected career definition is missing. Restore it before buying skill ranks.' };
    }
    let isCareer = career?.careerSkills.includes(key) ?? false;
    for (const specKey of character.specializations.filter(Boolean)) {
        const specialization = definitions.specializations.find(item => item.key === specKey);
        if (!specialization) {
            return { ok: false as const, message: 'A selected specialization definition is missing. Restore it before buying skill ranks.' };
        }
        isCareer ||= specialization.careerSkills.includes(key);
    }
    return { ok: true as const, isCareer };
}

function validExperience(character: Character): boolean {
    const { total, spent } = getExperienceSummary(character);
    return [total, spent].every(value => Number.isSafeInteger(value) && value >= 0);
}

function withSpending(character: Character, skills: CharacterSkill[], xpChange: number): Character {
    const updated = {
        ...character,
        skills,
        experience: { ...character.experience, usedExperience: character.experience.usedExperience + xpChange },
    };
    return { ...updated, xp: getExperienceSummary(updated).available };
}

/** Buy or undo one paid rank, without mutating the character or definitions. */
export function planSkillPurchaseChange(character: Character, change: SkillPurchaseChange, definitions: SkillDefinitions): SkillPurchaseResult {
    if (!definitions.skills.some(skill => skill.key === change.key)) {
        return reject('missing-definition', 'This skill definition is missing. Restore it before editing its ranks.');
    }
    const matches = character.skills.filter(skill => skill.key === change.key);
    const skill = matches[0] ?? { key: change.key, rank: {} };
    if ((change.delta !== 1 && change.delta !== -1) || matches.length > 1
        || !validSkill(skill) || !validExperience(character)) {
        return reject('invalid-character', 'This character has inconsistent skill ranks, history, or XP and needs correction before editing.');
    }
    const purchases = skill.purchases ?? [];
    const purchasedRanks = skill.rank.purchasedRanks ?? 0;
    const xp = getExperienceSummary(character);
    if (purchases.reduce((sum, purchase) => sum + purchase.cost, 0) > xp.spent) {
        return reject('invalid-character', 'The recorded purchases exceed spent XP; correct the character before editing them.');
    }

    let xpChange: number;
    let history: SkillPurchase[];
    let updatedSkill = { ...skill, rank: { ...skill.rank, purchasedRanks: purchasedRanks + change.delta } };
    if (change.delta === 1) {
        const status = careerStatus(character, change.key, definitions);
        if (!status.ok) return reject('missing-definition', status.message);
        const trainingRank = getSkillTrainingRank(skill);
        if (trainingRank >= 5) return reject('rank-limit', 'Skill purchases cannot raise the trained rank above 5.');
        xpChange = (trainingRank + 1) * 5 + (status.isCareer ? 0 : 5);
        if (xp.available < xpChange) {
            return reject('insufficient-xp', `This increase costs ${xpChange} XP; ${xp.available} XP is available.`);
        }
        history = [...purchases, { cost: xpChange, nonCareer: !status.isCareer }];
        updatedSkill = { ...updatedSkill, isCareer: status.isCareer };
    } else {
        if (purchasedRanks === 0) return reject('no-purchase', 'There is no purchased skill rank to undo.');
        const purchase = purchases[purchases.length - 1];
        if (!purchase) {
            return reject('unknown-purchase-cost', 'This saved skill rank has no recorded XP cost and cannot be refunded automatically.');
        }
        xpChange = -purchase.cost;
        history = purchases.slice(0, -1);
    }

    if (history.length) updatedSkill.purchases = history;
    else delete updatedSkill.purchases;
    const skills = matches.length
        ? character.skills.map(item => item.key === change.key ? updatedSkill : item)
        : [...character.skills, updatedSkill];
    return { ok: true, character: withSpending(character, skills, xpChange), xpChange };
}

/** Transitional adapter for legacy career/starting-specialization resets.
 * Refund all paid ranks together, or leave everything untouched if any cost is unknown. */
export function planSkillPurchaseReset(character: Character): SkillPurchaseResult {
    if (!validExperience(character) || new Set(character.skills.map(skill => skill.key)).size !== character.skills.length
        || !character.skills.every(validSkill)) {
        return reject('invalid-character', 'This character has inconsistent skill ranks, history, or XP and needs correction before resetting purchases.');
    }
    let refund = 0;
    for (const skill of character.skills) {
        if ((skill.rank.purchasedRanks ?? 0) !== (skill.purchases?.length ?? 0)) {
            return reject('unknown-purchase-cost', 'Some saved skill ranks have no recorded XP cost. Their purchases cannot be reset automatically.');
        }
        refund += skill.purchases?.reduce((sum, purchase) => sum + purchase.cost, 0) ?? 0;
    }
    if (!Number.isSafeInteger(refund) || refund > character.experience.usedExperience) {
        return reject('invalid-character', 'The recorded skill purchases exceed spent XP; correct the character before resetting them.');
    }
    const skills = character.skills.map(skill => {
        if (!(skill.rank.purchasedRanks ?? 0)) return skill;
        const updated = { ...skill, rank: { ...skill.rank, purchasedRanks: 0 } };
        delete updated.purchases;
        return updated;
    });
    const xpChange = 0 - refund;
    return { ok: true, character: withSpending(character, skills, xpChange), xpChange };
}
