// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { Character, CharacteristicKey } from '@/types/character';
import { createDefaultCharacter } from '@/types/defaultCharacter';
import { planCharacteristicChange } from '@/domain/character/characteristics';
import { deriveCharacteristicStats } from '@/domain/character/derivedStats';
import { getExperienceSummary } from '@/domain/character/experience';
import { humanSpecies } from '../../fixtures/character';

function apply(character: Character, key: CharacteristicKey, delta: 1 | -1) {
    const result = planCharacteristicChange(character, { key, delta }, humanSpecies);
    if (!result.ok) throw new Error(result.message);
    return result;
}

function freeze(value: object) {
    Object.values(value).forEach(item => {
        if (item && typeof item === 'object') freeze(item);
    });
    Object.freeze(value);
}

describe('creation characteristic operations without browser storage', () => {
    it('charges 30 XP for Brawn 2 to 3 and evaluates the complete result immutably', () => {
        const character = createDefaultCharacter();
        character.wounds.current = 4;
        freeze(character);
        const result = apply(character, 'brawn', 1);

        expect(result.xpChange).toBe(30);
        expect(result.character.characteristics.brawn).toMatchObject({ bought: 1, total: 3, purchaseCosts: [30] });
        expect(getExperienceSummary(result.character)).toEqual({ total: 110, spent: 30, available: 80 });
        expect(result.character.xp).toBe(80);
        expect(result.character.wounds).toEqual({ current: 4, threshold: 13 });
        expect(result.character.soak).toBe(3);
        expect(result.character.strain.threshold).toBe(12);
        expect(character.characteristics.brawn.bought).toBe(0);
        expect(character.experience.usedExperience).toBe(0);
    });

    it('uses training contributions for price and cap, and recomputes stale totals', () => {
        const character = createDefaultCharacter();
        character.characteristics.brawn.gear = 2;
        character.characteristics.brawn.cybernetics = 1;
        character.characteristics.brawn.total = 99;
        const result = apply(character, 'brawn', 1);
        expect(result.xpChange).toBe(30);
        expect(result.character.characteristics.brawn.total).toBe(6);
    });

    it('rejects unaffordable purchases using experience inputs rather than stale cached XP', () => {
        const character = createDefaultCharacter();
        character.experience.usedExperience = 90;
        character.xp = 1000;
        const before = structuredClone(character);
        expect(planCharacteristicChange(character, { key: 'brawn', delta: 1 }, humanSpecies))
            .toMatchObject({ ok: false, code: 'insufficient-xp' });
        expect(character).toEqual(before);
    });

    it('allows spending exactly the remaining XP', () => {
        const character = createDefaultCharacter();
        character.experience.usedExperience = 80;
        expect(getExperienceSummary(apply(character, 'brawn', 1).character).available).toBe(0);
    });

    it.each([5, 6])('rejects increases at training rank %i', rank => {
        const character = createDefaultCharacter();
        character.characteristics.brawn.bought = rank - 2;
        expect(planCharacteristicChange(character, { key: 'brawn', delta: 1 }, humanSpecies))
            .toMatchObject({ ok: false, code: 'rank-limit' });
    });

    it('cannot undo a species rank', () => {
        expect(planCharacteristicChange(createDefaultCharacter(), { key: 'brawn', delta: -1 }, humanSpecies))
            .toMatchObject({ ok: false, code: 'no-purchase' });
    });

    it('refunds recorded charges in reverse order and restores the initial character', () => {
        const original = createDefaultCharacter();
        const first = apply(original, 'brawn', 1).character;
        const second = apply(first, 'brawn', 1).character;
        expect(second.characteristics.brawn.purchaseCosts).toEqual([30, 40]);
        const undoSecond = apply(second, 'brawn', -1);
        expect(undoSecond.xpChange).toBe(-40);
        const undoFirst = apply(undoSecond.character, 'brawn', -1);
        expect(undoFirst.xpChange).toBe(-30);
        expect(undoFirst.character).toEqual(original);
    });

    it('refunds the actual charge even if the species contribution changed afterward', () => {
        const purchased = apply(createDefaultCharacter(), 'brawn', 1).character;
        purchased.characteristics.brawn.species = 3;
        const result = apply(purchased, 'brawn', -1);
        expect(result.xpChange).toBe(-30);
        expect(result.character.experience.usedExperience).toBe(0);
        expect(result.character.characteristics.brawn.total).toBe(3);
    });

    it('keeps legacy ranks editable by adding known purchases, but never guesses old refunds', () => {
        const legacy = createDefaultCharacter();
        legacy.characteristics.brawn.bought = 1;
        legacy.experience.usedExperience = 30;
        expect(planCharacteristicChange(legacy, { key: 'brawn', delta: -1 }, humanSpecies))
            .toMatchObject({ ok: false, code: 'unknown-purchase-cost' });

        const purchased = apply(legacy, 'brawn', 1);
        expect(purchased.xpChange).toBe(40);
        const undone = apply(purchased.character, 'brawn', -1).character;
        expect(undone.characteristics.brawn.bought).toBe(1);
        expect(undone.experience.usedExperience).toBe(30);
        expect(planCharacteristicChange(undone, { key: 'brawn', delta: -1 }, humanSpecies))
            .toMatchObject({ ok: false, code: 'unknown-purchase-cost' });
    });

    it('rejects inconsistent purchase histories and refunds exceeding recorded spending', () => {
        const character = createDefaultCharacter();
        character.characteristics.brawn.purchaseCosts = [30];
        expect(planCharacteristicChange(character, { key: 'brawn', delta: -1 }, humanSpecies))
            .toMatchObject({ ok: false, code: 'invalid-character' });
        character.characteristics.brawn.bought = 1;
        expect(planCharacteristicChange(character, { key: 'brawn', delta: -1 }, humanSpecies))
            .toMatchObject({ ok: false, code: 'invalid-character' });
    });

    it('rejects a species context for another character', () => {
        expect(planCharacteristicChange(createDefaultCharacter(), { key: 'brawn', delta: 1 }, { ...humanSpecies, key: 'OTHER' }))
            .toMatchObject({ ok: false, code: 'species-mismatch' });
    });

    it('updates Willpower-derived strain independently of Brawn', () => {
        const result = apply(createDefaultCharacter(), 'willpower', 1).character;
        expect(result.strain.threshold).toBe(13);
        expect(result.wounds.threshold).toBe(12);
    });

    it('recalculates thresholds for species with identical starting characteristics', () => {
        const result = deriveCharacteristicStats(createDefaultCharacter(), {
            ...humanSpecies,
            startingAttrs: { experience: 110, woundThreshold: 15, strainThreshold: 17, soakValue: 3 },
        });
        expect(result.wounds.threshold).toBe(17);
        expect(result.strain.threshold).toBe(19);
        expect(result.soak).toBe(5);
    });
});
