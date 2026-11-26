import { beforeEach, describe, expect, it } from 'vitest';
import { useCharacterStore } from '@/stores/characterStore';
import { createDefaultCharacter, defaultCharacter } from '@/types/defaultCharacter';
import { getExperienceSummary } from '@/domain/character/experience';
import { SPECIES_CACHE_KEY } from '@/pages/utils/fetcher';
import { humanSpecies } from '../fixtures/character';

beforeEach(() => {
    localStorage.clear();
    useCharacterStore.getState().resetCharacter();
});

describe('characteristic operations in the character store', () => {
    it('uses the latest state for consecutive actions and commits complete results', () => {
        const adjust = useCharacterStore.getState().adjustCharacteristicPurchase;
        expect(adjust('brawn', 1, humanSpecies).ok).toBe(true);
        expect(adjust('brawn', 1, humanSpecies).ok).toBe(true);
        const character = useCharacterStore.getState().character;
        expect(character.characteristics.brawn.total).toBe(4);
        expect(character.wounds.threshold).toBe(14);
        expect(getExperienceSummary(character)).toEqual({ total: 110, spent: 70, available: 40 });

        const before = useCharacterStore.getState();
        expect(adjust('brawn', 1, humanSpecies)).toMatchObject({ ok: false, code: 'insufficient-xp' });
        expect(useCharacterStore.getState()).toBe(before);
    });

    it('retains exact refund costs through real persistence and rehydration', async () => {
        useCharacterStore.getState().adjustCharacteristicPurchase('brawn', 1, humanSpecies);
        useCharacterStore.getState().adjustCharacteristicPurchase('brawn', 1, humanSpecies);
        const saved = localStorage.getItem('swrpg-character')!;

        useCharacterStore.setState({ character: createDefaultCharacter() });
        localStorage.setItem('swrpg-character', saved);
        await useCharacterStore.persist.rehydrate();

        const undo = useCharacterStore.getState().adjustCharacteristicPurchase('brawn', -1, humanSpecies);
        expect(undo).toMatchObject({ ok: true, xpChange: -40 });
        expect(useCharacterStore.getState().character.characteristics.brawn.purchaseCosts).toEqual([30]);
        expect(useCharacterStore.getState().character.experience.usedExperience).toBe(30);
    });

    it('reads old saved ranks without inventing a purchase history', async () => {
        const legacy = createDefaultCharacter();
        legacy.characteristics.brawn.bought = 1;
        legacy.characteristics.brawn.total = 3;
        legacy.experience.usedExperience = 30;
        localStorage.setItem('swrpg-character', JSON.stringify({ state: { character: legacy }, version: 0 }));
        await useCharacterStore.persist.rehydrate();

        const before = useCharacterStore.getState().character;
        expect(useCharacterStore.getState().adjustCharacteristicPurchase('brawn', -1, humanSpecies))
            .toMatchObject({ ok: false, code: 'unknown-purchase-cost' });
        expect(useCharacterStore.getState().character).toBe(before);
    });

    it('creates fresh nested values on reset, including after an old handler mutates an array', () => {
        const first = useCharacterStore.getState().character;
        first.specializations.push('TEST_SPEC');
        first.characteristics.brawn.bought = 1;
        useCharacterStore.getState().resetCharacter('New Character');
        const reset = useCharacterStore.getState().character;

        expect(reset).toEqual(createDefaultCharacter('New Character'));
        expect(reset.specializations).not.toBe(first.specializations);
        expect(reset.characteristics.brawn).not.toBe(first.characteristics.brawn);
        expect(defaultCharacter.specializations).toEqual([]);
        expect(defaultCharacter.characteristics.brawn.bought).toBe(0);
    });

    it('normalizes cached available XP for remaining legacy update paths', () => {
        const character = useCharacterStore.getState().character;
        useCharacterStore.getState().updateCharacter({
            experience: { ...character.experience, usedExperience: 10 },
        });
        expect(useCharacterStore.getState().character.xp).toBe(100);
    });

    it('updates species thresholds through the legacy adapter even when characteristics do not change', () => {
        const otherSpecies = {
            ...humanSpecies,
            key: 'OTHER',
            startingAttrs: { experience: 110, woundThreshold: 15, strainThreshold: 17, soakValue: 3 },
        };
        localStorage.setItem(SPECIES_CACHE_KEY, JSON.stringify([humanSpecies, otherSpecies]));
        useCharacterStore.getState().updateCharacter({ species: 'OTHER' });
        const updated = useCharacterStore.getState().character;
        expect(updated.wounds.threshold).toBe(17);
        expect(updated.strain.threshold).toBe(19);
        expect(updated.soak).toBe(5);
    });
});
