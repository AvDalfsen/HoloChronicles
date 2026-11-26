import { beforeEach, describe, expect, it } from 'vitest';
import { useCharacterStore } from '@/stores/characterStore';
import { choiceDefinitions } from '../fixtures/characterChoices';

beforeEach(() => { localStorage.clear(); useCharacterStore.getState().resetCharacter(); });

describe('typed career choice store actions', () => {
    it('uses current state for consecutive choices, commits atomically, and skips no-ops and rejections', () => {
        const store = useCharacterStore.getState();
        const defs = choiceDefinitions();
        store.changeCareer('CAREER', defs);
        store.setStartingSpecialization('SPEC', defs);
        const snapshots: ReturnType<typeof useCharacterStore.getState>[] = [];
        const unsubscribe = useCharacterStore.subscribe(state => snapshots.push(state));
        try {
            for (const skillKey of ['ATHL', 'STEALTH', 'COOL', 'VIGIL']) store.setFreeSkillChoice({ source: 'career', sourceKey: 'CAREER', skillKey, selected: true }, defs);
            store.changeCareer('CAREER', defs);
            expect(snapshots).toHaveLength(3);
            expect(snapshots[2].character.skills.map(skill => skill.key)).toEqual(['ATHL', 'STEALTH', 'COOL']);
            expect(snapshots[2].character.experience.usedExperience).toBe(0);
        } finally { unsubscribe(); }
    });

    it.each(['purchase', 'reset', 'import'] as const)('rejects a confirmed edit after an intervening %s', change => {
        const store = useCharacterStore.getState();
        const defs = choiceDefinitions();
        store.changeCareer('CAREER', defs);
        store.setStartingSpecialization('SPEC', defs);
        const previewed = useCharacterStore.getState().character;
        if (change === 'purchase') store.adjustSkillPurchase('ATHL', 1, defs);
        if (change === 'reset') store.resetCharacter();
        if (change === 'import') store.importCharacter(JSON.stringify({ ...previewed, name: 'Imported' }));
        const current = useCharacterStore.getState();
        expect(store.setStartingSpecialization(null, defs, previewed)).toMatchObject({ ok: false, code: 'stale-plan' });
        expect(useCharacterStore.getState()).toBe(current);
    });

    it('rehydrates free choices and exact refunds while preserving paid additional specializations', async () => {
        const store = useCharacterStore.getState();
        const defs = choiceDefinitions();
        store.changeCareer('CAREER', defs);
        store.setStartingSpecialization('SPEC', defs);
        store.setFreeSkillChoice({ source: 'starting-specialization', sourceKey: 'SPEC', skillKey: 'STEALTH', selected: true }, defs);
        store.adjustSkillPurchase('STEALTH', 1, defs);
        store.updateCharacter({ specializations: ['SPEC', 'EXTRA'] });
        const saved = localStorage.getItem('swrpg-character')!;
        store.resetCharacter();
        localStorage.setItem('swrpg-character', saved);
        await useCharacterStore.persist.rehydrate();
        expect(store.setStartingSpecialization(null, defs)).toMatchObject({ ok: true, xpChange: -10 });
        const character = useCharacterStore.getState().character;
        expect(character.specializations).toEqual(['', 'EXTRA']);
        expect(character.skills[0].rank).toMatchObject({ specializationRanks: 0, purchasedRanks: 0 });
        expect(character.experience.usedExperience).toBe(0);
        expect(JSON.parse(localStorage.getItem('swrpg-character')!).state.character).toEqual(character);
    });
});
