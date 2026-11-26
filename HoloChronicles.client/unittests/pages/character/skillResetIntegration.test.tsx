import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Careers from '@/pages/character/careers';
import Specializations from '@/pages/character/specializations';
import { useCharacterStore } from '@/stores/characterStore';
import { getSkillTotalRanks } from '@/domain/character/skills';
import { useCachedData, SKILLS_API_KEY, CAREERS_API_KEY, SPECIES_CACHE_KEY } from '@/pages/utils/fetcher';
import { humanSpecies, skillDefinitions } from '../../fixtures/character';

vi.mock('@/pages/utils/fetcher', async importOriginal => ({
    ...await importOriginal<typeof import('@/pages/utils/fetcher')>(),
    useCachedData: vi.fn(),
}));

beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(SPECIES_CACHE_KEY, JSON.stringify([humanSpecies]));
    useCharacterStore.getState().resetCharacter();
    vi.mocked(useCachedData).mockImplementation(<T,>(url: string) => ({
        data: (url === SKILLS_API_KEY ? skillDefinitions.skills
            : url === CAREERS_API_KEY ? skillDefinitions.careers : skillDefinitions.specializations) as T,
        loading: false,
        error: null,
    }));
});

function switchCareer() {
    fireEvent.click(screen.getByText('Other career'));
    fireEvent.click(screen.getByTitle('Select this career'));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, switch' }));
}

function sellStartingSpecialization() {
    fireEvent.click(screen.getByText('Test specialization'));
    fireEvent.click(screen.getByTitle('Unselect this specialization'));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, sell it' }));
}

describe('legacy transitions use the skill domain for paid-rank resets', () => {
    it.each(['before', 'after'] as const)('refunds exact skill charges after reload when cybernetics were added %s training', async timing => {
        const store = useCharacterStore.getState();
        store.updateCharacter({
            career: 'CAREER',
            specializations: ['SPEC'],
            skills: [{ key: 'STEALTH', rank: { specializationRanks: 1, cyberRanks: timing === 'before' ? 2 : 0 } }],
        });
        // One free starting-specialization rank; the next two trained ranks cost 10 + 15 XP.
        expect(store.adjustSkillPurchase('STEALTH', 1, skillDefinitions)).toMatchObject({ ok: true, xpChange: 10 });
        expect(store.adjustSkillPurchase('STEALTH', 1, skillDefinitions)).toMatchObject({ ok: true, xpChange: 15 });
        if (timing === 'after') {
            const purchased = useCharacterStore.getState().character;
            store.updateCharacter({
                skills: purchased.skills.map(skill => ({ ...skill, rank: { ...skill.rank, cyberRanks: 2 } })),
            });
        }
        const beforeReload = useCharacterStore.getState().character;
        expect(beforeReload.skills[0].purchases).toEqual([
            { cost: 10, nonCareer: false }, { cost: 15, nonCareer: false },
        ]);
        expect(beforeReload.experience.usedExperience).toBe(25);
        expect(getSkillTotalRanks(beforeReload.skills[0])).toBe(5);

        const saved = localStorage.getItem('swrpg-character')!;
        store.resetCharacter();
        localStorage.setItem('swrpg-character', saved);
        await useCharacterStore.persist.rehydrate();
        render(<Specializations />);
        sellStartingSpecialization();

        const character = useCharacterStore.getState().character;
        expect(character.specializations).toEqual(['']);
        expect(character.experience.usedExperience).toBe(0);
        expect(character.xp).toBe(110);
        expect(character.skills[0].rank).toEqual({ specializationRanks: 0, purchasedRanks: 0, cyberRanks: 2 });
        expect(character.skills[0].purchases).toBeUndefined();
        expect(character.skills[0].isCareer).toBe(false);
        expect(getSkillTotalRanks(character.skills[0])).toBe(2);
        expect(store.adjustSkillPurchase('STEALTH', -1, skillDefinitions)).toMatchObject({ ok: false, code: 'no-purchase' });
        expect(useCharacterStore.getState().character.experience.usedExperience).toBe(0);
    });

    it('refunds the original non-career charges when changing career, and removes the ranks', () => {
        const store = useCharacterStore.getState();
        store.adjustSkillPurchase('ATHL', 1, skillDefinitions);
        store.adjustSkillPurchase('ATHL', 1, skillDefinitions);
        store.updateCharacter({ career: 'CAREER' });
        render(<Careers />);
        switchCareer();
        const character = useCharacterStore.getState().character;
        expect(character.career).toBe('OTHER');
        expect(character.experience.usedExperience).toBe(0);
        expect(character.xp).toBe(110);
        expect(character.skills.every(skill => !(skill.rank.purchasedRanks ?? 0) && !skill.purchases)).toBe(true);
    });

    it('leaves a legacy character intact when career switching cannot refund unknown costs', () => {
        const store = useCharacterStore.getState();
        const character = { ...store.character, career: 'CAREER',
            skills: [{ key: 'ATHL', rank: { purchasedRanks: 1 } }],
            experience: { ...store.character.experience, usedExperience: 10 },
        };
        useCharacterStore.setState({ character });
        render(<Careers />);
        switchCareer();
        expect(screen.getByRole('alert')).toHaveTextContent('no recorded XP cost');
        expect(useCharacterStore.getState().character).toBe(character);
    });

    it('removes refunded paid ranks when selling the starting specialization, preserving unrelated grants', () => {
        const store = useCharacterStore.getState();
        store.adjustSkillPurchase('ATHL', 1, skillDefinitions);
        store.adjustSkillPurchase('ATHL', 1, skillDefinitions);
        const purchased = useCharacterStore.getState().character;
        store.updateCharacter({
            career: 'CAREER', specializations: ['SPEC'],
            skills: purchased.skills.map(skill => ({ ...skill, rank: { ...skill.rank, speciesRanks: 1, specializationRanks: 1 } })),
        });
        render(<Specializations />);
        sellStartingSpecialization();
        const character = useCharacterStore.getState().character;
        expect(character.specializations).toEqual(['']);
        expect(character.experience.usedExperience).toBe(0);
        expect(character.skills[0].rank).toMatchObject({ speciesRanks: 1, specializationRanks: 0, purchasedRanks: 0 });
        expect(character.skills[0].purchases).toBeUndefined();
        expect(store.adjustSkillPurchase('ATHL', -1, skillDefinitions)).toMatchObject({ ok: false, code: 'no-purchase' });
    });

    it('leaves a legacy character intact when starting-specialization removal cannot refund unknown costs', () => {
        const store = useCharacterStore.getState();
        const character = { ...store.character, career: 'CAREER', specializations: ['SPEC'],
            skills: [{ key: 'ATHL', rank: { purchasedRanks: 1 } }],
            experience: { ...store.character.experience, usedExperience: 10 },
        };
        useCharacterStore.setState({ character });
        render(<Specializations />);
        sellStartingSpecialization();
        expect(screen.getByRole('alert')).toHaveTextContent('no recorded XP cost');
        expect(useCharacterStore.getState().character).toBe(character);
    });
});
