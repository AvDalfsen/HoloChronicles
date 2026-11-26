import { beforeEach, describe, expect, it } from 'vitest';
import { useCharacterStore } from '@/stores/characterStore';
import { createDefaultCharacter } from '@/types/defaultCharacter';
import { skillDefinitions } from '../fixtures/character';

beforeEach(() => {
    localStorage.clear();
    useCharacterStore.getState().resetCharacter();
});

describe('skill operations in the character store', () => {
    it('uses the latest state for consecutive actions and leaves rejected state untouched', () => {
        const adjust = useCharacterStore.getState().adjustSkillPurchase;
        expect(adjust('ATHL', 1, skillDefinitions)).toMatchObject({ ok: true, xpChange: 10 });
        expect(adjust('ATHL', 1, skillDefinitions)).toMatchObject({ ok: true, xpChange: 15 });
        const character = useCharacterStore.getState().character;
        expect(character.skills[0].rank.purchasedRanks).toBe(2);
        expect(character.experience.usedExperience).toBe(25);
        expect(character.xp).toBe(85);

        useCharacterStore.setState({ character: {
            ...character, experience: { ...character.experience, usedExperience: 105 },
        } });
        const before = useCharacterStore.getState();
        expect(adjust('ATHL', 1, skillDefinitions)).toMatchObject({ ok: false, code: 'insufficient-xp' });
        expect(useCharacterStore.getState()).toBe(before);
    });

    it('retains mixed career purchase history through a cybernetic increase, persistence, and later removal of that bonus', async () => {
        const adjust = useCharacterStore.getState().adjustSkillPurchase;
        adjust('ATHL', 1, skillDefinitions);
        const purchased = useCharacterStore.getState().character;
        useCharacterStore.getState().updateCharacter({
            career: 'CAREER',
            skills: purchased.skills.map(skill => ({ ...skill, rank: { ...skill.rank, cyberRanks: 2 } })),
        });
        adjust('ATHL', 1, skillDefinitions);
        const saved = localStorage.getItem('swrpg-character')!;
        expect(JSON.parse(saved).state.character.skills[0].purchases).toEqual([
            { cost: 10, nonCareer: true }, { cost: 10, nonCareer: false },
        ]);
        expect(JSON.parse(saved).state.character.skills[0].rank.cyberRanks).toBe(2);

        useCharacterStore.setState({ character: createDefaultCharacter() });
        localStorage.setItem('swrpg-character', saved);
        await useCharacterStore.persist.rehydrate();
        const reloaded = useCharacterStore.getState().character;
        expect(reloaded.experience.usedExperience).toBe(20);
        useCharacterStore.getState().updateCharacter({
            skills: reloaded.skills.map(skill => ({ ...skill, rank: { ...skill.rank, cyberRanks: 0 } })),
        });
        expect(adjust('ATHL', -1, skillDefinitions)).toMatchObject({ ok: true, xpChange: -10 });
        expect(adjust('ATHL', -1, skillDefinitions)).toMatchObject({ ok: true, xpChange: -10 });
        expect(useCharacterStore.getState().character.experience.usedExperience).toBe(0);
        expect(useCharacterStore.getState().character.xp).toBe(110);
        expect(useCharacterStore.getState().character.skills[0].rank).toEqual({ purchasedRanks: 0, cyberRanks: 0 });
    });

    it('loads legacy drafts and allows new known purchases without guessing older refunds', async () => {
        const legacy = createDefaultCharacter();
        legacy.skills = [{ key: 'ATHL', rank: { purchasedRanks: 1 } }];
        legacy.experience.usedExperience = 10;
        localStorage.setItem('swrpg-character', JSON.stringify({ state: { character: legacy }, version: 0 }));
        await useCharacterStore.persist.rehydrate();
        const before = useCharacterStore.getState();
        const adjust = before.adjustSkillPurchase;
        expect(adjust('ATHL', -1, skillDefinitions)).toMatchObject({ ok: false, code: 'unknown-purchase-cost' });
        expect(useCharacterStore.getState()).toBe(before);
        expect(adjust('ATHL', 1, skillDefinitions)).toMatchObject({ ok: true, xpChange: 15 });
        expect(adjust('ATHL', -1, skillDefinitions)).toMatchObject({ ok: true, xpChange: -15 });
        expect(useCharacterStore.getState().character.skills[0].rank.purchasedRanks).toBe(1);
        expect(useCharacterStore.getState().character.experience.usedExperience).toBe(10);
    });

    it('commits ranks, history, and XP once per accepted operation and never for a rejection', () => {
        const snapshots: ReturnType<typeof useCharacterStore.getState>[] = [];
        const unsubscribe = useCharacterStore.subscribe(state => snapshots.push(state));
        try {
            const adjust = useCharacterStore.getState().adjustSkillPurchase;
            adjust('ATHL', 1, skillDefinitions);
            adjust('UNKNOWN', 1, skillDefinitions);
            expect(snapshots).toHaveLength(1);
            expect(snapshots[0].character).toMatchObject({
                xp: 100, experience: { usedExperience: 10 },
                skills: [{ rank: { purchasedRanks: 1 }, purchases: [{ cost: 10, nonCareer: true }] }],
            });
        } finally {
            unsubscribe();
        }
    });
});
