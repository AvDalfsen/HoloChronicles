// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { Character, CharacterSkill } from '@/types/character';
import { createDefaultCharacter } from '@/types/defaultCharacter';
import { getExperienceSummary } from '@/domain/character/experience';
import { getSkillDicePool, getSkillTotalRanks, getSkillTrainingRank, planSkillPurchaseChange, planSkillPurchaseReset } from '@/domain/character/skills';
import { skillDefinitions } from '../../fixtures/character';

function apply(character: Character, delta: 1 | -1, key = 'ATHL') {
    const result = planSkillPurchaseChange(character, { key, delta }, skillDefinitions);
    if (!result.ok) throw new Error(result.message);
    return result;
}

function freeze(value: object) {
    Object.values(value).forEach(item => {
        if (item && typeof item === 'object') freeze(item);
    });
    Object.freeze(value);
}

describe('skill purchase and undo without browser storage', () => {
    it('charges 10 + 15 XP for two non-career ranks and refunds those amounts in reverse order', () => {
        const first = apply(createDefaultCharacter(), 1);
        const second = apply(first.character, 1);
        expect([first.xpChange, second.xpChange]).toEqual([10, 15]);
        expect(second.character.skills[0]).toMatchObject({
            rank: { purchasedRanks: 2 },
            purchases: [{ cost: 10, nonCareer: true }, { cost: 15, nonCareer: true }],
        });
        expect(getExperienceSummary(second.character)).toEqual({ total: 110, spent: 25, available: 85 });
        const undoSecond = apply(second.character, -1);
        const undoFirst = apply(undoSecond.character, -1);
        expect([undoSecond.xpChange, undoFirst.xpChange]).toEqual([-15, -10]);
        expect(undoFirst.character.skills[0].rank.purchasedRanks).toBe(0);
        expect(undoFirst.character.skills[0].purchases).toBeUndefined();
        expect(undoFirst.character.xp).toBe(110);
    });

    it('keeps the non-career surcharge when a skill becomes career and prices only the next purchase at the new rate', () => {
        const first = apply(createDefaultCharacter(), 1).character;
        first.career = 'CAREER';
        const second = apply(first, 1);
        expect(second.xpChange).toBe(10);
        expect(second.character.skills[0].purchases).toEqual([
            { cost: 10, nonCareer: true }, { cost: 10, nonCareer: false },
        ]);
        const undoSecond = apply(second.character, -1);
        const undoFirst = apply(undoSecond.character, -1);
        expect([undoSecond.xpChange, undoFirst.xpChange]).toEqual([-10, -10]);
        expect(undoFirst.character.experience.usedExperience).toBe(0);
    });

    it('derives career membership from all current definitions instead of the cached flag', () => {
        const character = createDefaultCharacter();
        character.career = 'CAREER';
        character.specializations = ['SPEC', ''];
        character.skills = [{ key: 'STEALTH', rank: {}, isCareer: false }];
        expect(apply(character, 1, 'STEALTH')).toMatchObject({
            xpChange: 5, character: { skills: [{ isCareer: true, purchases: [{ nonCareer: false }] }] },
        });
        character.career = '';
        character.specializations = [];
        character.skills[0].isCareer = true;
        expect(apply(character, 1, 'STEALTH').xpChange).toBe(10);
    });

    it('includes free rank origins in training prices but excludes cybernetics from price and cap', () => {
        const character = createDefaultCharacter();
        character.career = 'CAREER';
        character.skills = [{ key: 'ATHL', rank: { speciesRanks: 1, careerRanks: 1, specializationRanks: 1, cyberRanks: 2 } }];
        const result = apply(character, 1);
        expect(result.xpChange).toBe(20);
        expect(getSkillTrainingRank(result.character.skills[0])).toBe(4);
        expect(getSkillTotalRanks(result.character.skills[0])).toBe(6);
        const fifthRank = apply(result.character, 1);
        expect(fifthRank.xpChange).toBe(25);
        expect(getSkillTrainingRank(fifthRank.character.skills[0])).toBe(5);
        expect(getSkillTotalRanks(fifthRank.character.skills[0])).toBe(6);
        expect(fifthRank.character.skills[0].rank.cyberRanks).toBe(2);
        const undone = apply(fifthRank.character, -1);
        expect(undone.xpChange).toBe(-25);
        expect(getSkillTrainingRank(undone.character.skills[0])).toBe(4);
        expect(getSkillTotalRanks(undone.character.skills[0])).toBe(6);
    });

    it.each([5, 6])('rejects increases at trained rank %i', rank => {
        const character = createDefaultCharacter();
        character.skills = [{ key: 'ATHL', rank: { speciesRanks: rank } }];
        expect(planSkillPurchaseChange(character, { key: 'ATHL', delta: 1 }, skillDefinitions))
            .toMatchObject({ ok: false, code: 'rank-limit' });
    });

    it('checks the real XP budget, allows an exact spend, and leaves rejected input unchanged', () => {
        const character = createDefaultCharacter();
        character.xp = 1000;
        character.experience.usedExperience = 101;
        const before = structuredClone(character);
        expect(planSkillPurchaseChange(character, { key: 'ATHL', delta: 1 }, skillDefinitions))
            .toMatchObject({ ok: false, code: 'insufficient-xp' });
        expect(character).toEqual(before);
        character.experience.usedExperience = 100;
        expect(apply(character, 1).character.xp).toBe(0);
    });

    it('preserves unrelated ranks, metadata, damage, and the input objects', () => {
        const character = createDefaultCharacter();
        character.skills = [
            { key: 'ATHL', rank: { speciesRanks: 1, cyberRanks: 1 }, charKeyOverride: 'AG' },
            { key: 'STEALTH', rank: { careerRanks: 1 }, isCareer: true },
        ];
        character.wounds.current = 4;
        freeze(character);
        freeze(skillDefinitions);
        const result = apply(character, 1).character;
        expect(result.skills[0]).toMatchObject({ rank: { speciesRanks: 1, cyberRanks: 1, purchasedRanks: 1 }, charKeyOverride: 'AG' });
        expect(result.skills[1]).toBe(character.skills[1]);
        expect(result.wounds).toBe(character.wounds);
        expect(character.skills[0].rank.purchasedRanks).toBeUndefined();
        expect(character.experience.usedExperience).toBe(0);
    });

    it('cannot undo free or cybernetic ranks', () => {
        const character = createDefaultCharacter();
        character.skills = [{ key: 'ATHL', rank: { careerRanks: 1, cyberRanks: 1 } }];
        expect(planSkillPurchaseChange(character, { key: 'ATHL', delta: -1 }, skillDefinitions))
            .toMatchObject({ ok: false, code: 'no-purchase' });
    });

    it('retains legacy ranks without inventing their historical charges', () => {
        const character = createDefaultCharacter();
        character.skills = [{ key: 'ATHL', rank: { purchasedRanks: 1 } }];
        character.experience.usedExperience = 10;
        expect(planSkillPurchaseChange(character, { key: 'ATHL', delta: -1 }, skillDefinitions))
            .toMatchObject({ ok: false, code: 'unknown-purchase-cost' });
        const purchased = apply(character, 1);
        expect(purchased.xpChange).toBe(15);
        const undone = apply(purchased.character, -1).character;
        expect(undone.skills[0].rank.purchasedRanks).toBe(1);
        expect(undone.experience.usedExperience).toBe(10);
        expect(planSkillPurchaseChange(undone, { key: 'ATHL', delta: -1 }, skillDefinitions))
            .toMatchObject({ ok: false, code: 'unknown-purchase-cost' });
    });

    it('refunds an exact purchase after free/cybernetic ranks or career definitions change', () => {
        const character = apply(createDefaultCharacter(), 1).character;
        character.skills[0].rank.careerRanks = 1;
        character.skills[0].rank.cyberRanks = 2;
        character.career = 'MISSING';
        const result = planSkillPurchaseChange(character, { key: 'ATHL', delta: -1 }, skillDefinitions);
        expect(result).toMatchObject({ ok: true, xpChange: -10 });
        if (result.ok) expect(getSkillTotalRanks(result.character.skills[0])).toBe(3);
    });

    it.each([
        { career: 'MISSING', specializations: [] },
        { career: 'CAREER', specializations: ['MISSING'] },
    ])('reports unresolved current grants instead of guessing a purchase price', grants => {
        const character = { ...createDefaultCharacter(), ...grants };
        expect(planSkillPurchaseChange(character, { key: 'ATHL', delta: 1 }, skillDefinitions))
            .toMatchObject({ ok: false, code: 'missing-definition' });
    });

    it('rejects an unknown skill definition', () => {
        expect(planSkillPurchaseChange(createDefaultCharacter(), { key: 'UNKNOWN', delta: 1 }, skillDefinitions))
            .toMatchObject({ ok: false, code: 'missing-definition' });
    });

    it.each<CharacterSkill>([
        { key: 'ATHL', rank: { purchasedRanks: -1 } },
        { key: 'ATHL', rank: { careerRanks: 0.5 } },
        { key: 'ATHL', rank: {}, purchases: [{ cost: 10, nonCareer: true }] },
        { key: 'ATHL', rank: { purchasedRanks: 1 }, purchases: [{ cost: -10, nonCareer: true }] },
    ])('rejects inconsistent rank/history data', skill => {
        const character = createDefaultCharacter();
        character.skills = [skill];
        expect(planSkillPurchaseChange(character, { key: 'ATHL', delta: 1 }, skillDefinitions))
            .toMatchObject({ ok: false, code: 'invalid-character' });
    });

    it('rejects duplicate skill entries and purchase records exceeding spent XP', () => {
        const character = apply(createDefaultCharacter(), 1).character;
        character.skills.push({ key: 'ATHL', rank: {} });
        expect(planSkillPurchaseChange(character, { key: 'ATHL', delta: 1 }, skillDefinitions))
            .toMatchObject({ ok: false, code: 'invalid-character' });
        character.skills.pop();
        character.experience.usedExperience = 5;
        expect(planSkillPurchaseChange(character, { key: 'ATHL', delta: -1 }, skillDefinitions))
            .toMatchObject({ ok: false, code: 'invalid-character' });
    });
});

describe('skill views and transitional purchase reset', () => {
    it.each([
        { purchasedRanks: 7, cyberRanks: 0, expected: 5 },
        { purchasedRanks: 5, cyberRanks: 3, expected: 6 },
    ])('caps effective skill ranks without rewriting the training or cybernetic contributions', ({ purchasedRanks, cyberRanks, expected }) => {
        const skill = { key: 'ATHL', rank: { purchasedRanks, cyberRanks } };
        freeze(skill);
        expect(getSkillTotalRanks(skill)).toBe(expected);
        expect(getSkillTrainingRank(skill)).toBe(purchasedRanks);
        expect(skill.rank.cyberRanks).toBe(cyberRanks);
    });

    it('uses the capped skill and characteristic together when calculating the dice pool', () => {
        const character = createDefaultCharacter();
        character.skills = [{ key: 'ATHL', rank: { purchasedRanks: 5, cyberRanks: 2 } }];
        character.characteristics.brawn = { species: 3, bought: 2, gear: 3, cybernetics: 1, total: 99 };
        expect(getSkillDicePool(character, skillDefinitions.skills[0]))
            .toEqual({ ok: true, rank: 6, proficiency: 6, ability: 1 });
    });

    it.each([Infinity, 6.5])('does not turn an invalid imported rank or characteristic into a valid dice pool by capping it', invalid => {
        const character = createDefaultCharacter();
        character.skills = [{ key: 'ATHL', rank: { purchasedRanks: invalid } }];
        expect(getSkillDicePool(character, skillDefinitions.skills[0]).ok).toBe(false);
        character.skills = [];
        character.characteristics.brawn.gear = invalid;
        expect(getSkillDicePool(character, skillDefinitions.skills[0]).ok).toBe(false);
    });

    it('calculates dice using all rank origins, characteristic contributions, and a saved override', () => {
        const character = createDefaultCharacter();
        character.skills = [{ key: 'ATHL', rank: { careerRanks: 1, purchasedRanks: 1, cyberRanks: 1 }, charKeyOverride: 'AG' }];
        character.characteristics.agility.species = 4;
        character.characteristics.agility.total = 99;
        expect(getSkillDicePool(character, skillDefinitions.skills[0]))
            .toEqual({ ok: true, rank: 3, proficiency: 3, ability: 1 });
    });

    it('reports unknown characteristic keys rather than guessing a dice pool', () => {
        expect(getSkillDicePool(createDefaultCharacter(), { ...skillDefinitions.skills[0], charKey: 'UNKNOWN' }).ok).toBe(false);
    });

    it('refunds exact charges and removes every paid rank together while preserving other rank origins', () => {
        let character = apply(createDefaultCharacter(), 1).character;
        character = apply(character, 1).character;
        character = apply(character, 1, 'STEALTH').character;
        character.skills[0].rank.speciesRanks = 1;
        character.skills[0].rank.cyberRanks = 1;
        character.experience.usedExperience += 30; // Unrelated characteristic purchase.
        character.career = 'CAREER';
        freeze(character);
        const result = planSkillPurchaseReset(character);
        expect(result).toMatchObject({ ok: true, xpChange: -35 });
        if (!result.ok) throw new Error(result.message);
        expect(result.character.experience.usedExperience).toBe(30);
        expect(result.character.skills[0].rank).toEqual({ purchasedRanks: 0, speciesRanks: 1, cyberRanks: 1 });
        expect(result.character.skills.every(skill => !skill.purchases && skill.rank.purchasedRanks === 0)).toBe(true);
        expect(planSkillPurchaseReset(result.character)).toMatchObject({ ok: true, xpChange: 0 });
        expect(character.skills[0].rank.purchasedRanks).toBe(2);
    });

    it('rejects a bulk reset atomically when even one historical charge is unknown', () => {
        const character = apply(createDefaultCharacter(), 1).character;
        character.skills.push({ key: 'STEALTH', rank: { purchasedRanks: 1 } });
        character.experience.usedExperience += 10;
        const before = structuredClone(character);
        expect(planSkillPurchaseReset(character)).toMatchObject({ ok: false, code: 'unknown-purchase-cost' });
        expect(character).toEqual(before);
    });

    it('rejects a bulk refund exceeding aggregate spent XP', () => {
        let character = apply(createDefaultCharacter(), 1).character;
        character = apply(character, 1, 'STEALTH').character;
        character.experience.usedExperience = 10;
        expect(planSkillPurchaseReset(character)).toMatchObject({ ok: false, code: 'invalid-character' });
    });
});
