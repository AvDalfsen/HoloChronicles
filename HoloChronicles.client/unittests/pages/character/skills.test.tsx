import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Skills from '@/pages/character/skills';
import Sidebar from '@/components/character/sideBar';
import { useCharacterStore } from '@/stores/characterStore';
import { useCachedData, SKILLS_API_KEY, CAREERS_API_KEY, SPECIES_API_KEY } from '@/pages/utils/fetcher';
import { humanSpecies, skillDefinitions } from '../../fixtures/character';

vi.mock('@/pages/utils/fetcher', async importOriginal => ({
    ...await importOriginal<typeof import('@/pages/utils/fetcher')>(),
    useCachedData: vi.fn(),
}));

function mockDefinitions(options: { missingSkills?: boolean; careerError?: boolean; charKey?: string } = {}) {
    vi.mocked(useCachedData).mockImplementation(<T,>(url: string) => ({
        data: (url === SKILLS_API_KEY ? options.missingSkills ? null : [{ ...skillDefinitions.skills[0], charKey: options.charKey ?? 'BR' }]
            : url === CAREERS_API_KEY ? options.careerError ? null : skillDefinitions.careers
                : url === SPECIES_API_KEY ? [humanSpecies] : skillDefinitions.specializations) as T,
        loading: false,
        error: options.careerError && url === CAREERS_API_KEY ? 'Career definitions unavailable.' : null,
    }));
}

function renderEditor() {
    render(<MemoryRouter><Skills /><Sidebar /></MemoryRouter>);
}

beforeEach(() => {
    localStorage.clear();
    useCharacterStore.getState().resetCharacter();
    mockDefinitions();
});

describe('skill screen and sidebar', () => {
    it('keeps the total at six while buying and undoing the fifth trained rank, with a seven-die characteristic', () => {
        const character = useCharacterStore.getState().character;
        useCharacterStore.setState({ character: {
            ...character,
            career: 'CAREER',
            experience: { ...character.experience, usedExperience: 20 },
            characteristics: {
                ...character.characteristics,
                brawn: { species: 2, bought: 0, gear: 5, cybernetics: 1, total: 99 },
            },
            skills: [{
                key: 'ATHL',
                rank: { speciesRanks: 1, careerRanks: 1, specializationRanks: 1, purchasedRanks: 1, cyberRanks: 2 },
                purchases: [{ cost: 20, nonCareer: false }],
            }],
        } });
        renderEditor();
        expect(screen.getByLabelText('Athletics total ranks')).toHaveTextContent('6');
        expect(screen.getByRole('img', { name: 'Athletics dice pool: 6 proficiency, 1 ability' })).toBeInTheDocument();
        expect(screen.getByText('Next increase: 25 XP')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Increase Athletics' }));
        expect(useCharacterStore.getState().character.skills[0].rank.purchasedRanks).toBe(2);
        expect(screen.getByLabelText('Athletics total ranks')).toHaveTextContent('6');
        expect(screen.getByRole('complementary')).toHaveTextContent(/spent\s*45; rem\s*65/);
        expect(screen.getByRole('button', { name: 'Increase Athletics' })).toBeDisabled();

        fireEvent.click(screen.getByRole('button', { name: 'Undo Athletics purchase' }));
        expect(useCharacterStore.getState().character.skills[0].rank.purchasedRanks).toBe(1);
        expect(screen.getByLabelText('Athletics total ranks')).toHaveTextContent('6');
        expect(screen.getByRole('complementary')).toHaveTextContent(/spent\s*20; rem\s*90/);
    });

    it('shows quotes, updates ranks/dice/XP, and undoes the recorded purchase', () => {
        renderEditor();
        expect(screen.getByText('Next increase: 10 XP')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Undo Athletics purchase' })).toBeDisabled();
        fireEvent.click(screen.getByRole('button', { name: 'Increase Athletics' }));
        expect(screen.getByLabelText('Athletics total ranks')).toHaveTextContent('1');
        expect(screen.getByRole('img', { name: 'Athletics dice pool: 1 proficiency, 1 ability' })).toBeInTheDocument();
        expect(screen.getByRole('complementary')).toHaveTextContent(/spent\s*10; rem\s*100/);
        expect(screen.getByRole('button', { name: 'Undo Athletics purchase' })).toHaveAttribute('title', 'Refund 10 XP');
        fireEvent.click(screen.getByRole('button', { name: 'Undo Athletics purchase' }));
        expect(screen.getByLabelText('Athletics total ranks')).toHaveTextContent('0');
        expect(screen.getByRole('complementary')).toHaveTextContent(/spent\s*0; rem\s*110/);
    });

    it('uses current grants for the quote and keeps the historical refund when career status changes', () => {
        renderEditor();
        fireEvent.click(screen.getByRole('button', { name: 'Increase Athletics' }));
        act(() => useCharacterStore.getState().updateCharacter({ career: 'CAREER' }));
        expect(screen.getByText('Next increase: 10 XP')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Undo Athletics purchase' })).toHaveAttribute('title', 'Refund 10 XP');
        fireEvent.click(screen.getByRole('button', { name: 'Undo Athletics purchase' }));
        expect(useCharacterStore.getState().character.experience.usedExperience).toBe(0);
    });

    it('explains insufficient XP and disables the purchase despite a stale cached balance', () => {
        const character = useCharacterStore.getState().character;
        useCharacterStore.setState({ character: {
            ...character, xp: 1000, experience: { ...character.experience, usedExperience: 105 },
        } });
        renderEditor();
        expect(screen.getByRole('button', { name: 'Increase Athletics' })).toBeDisabled();
        expect(screen.getByText('This increase costs 10 XP; 5 XP is available.')).toBeInTheDocument();
        expect(screen.getByRole('complementary')).toHaveTextContent(/spent\s*105; rem\s*5/);
    });

    it('explains an unknown historical cost while allowing the next purchase', () => {
        const character = useCharacterStore.getState().character;
        character.skills = [{ key: 'ATHL', rank: { purchasedRanks: 1 } }];
        character.experience.usedExperience = 10;
        renderEditor();
        expect(screen.getByRole('button', { name: 'Undo Athletics purchase' })).toBeDisabled();
        expect(screen.getByText('This saved skill rank has no recorded XP cost and cannot be refunded automatically.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Increase Athletics' })).toBeEnabled();
    });

    it('honors the characteristic override without importing the species screen', () => {
        const character = useCharacterStore.getState().character;
        character.skills = [{ key: 'ATHL', rank: { speciesRanks: 1 }, charKeyOverride: 'AG' }];
        character.characteristics.agility.species = 4;
        character.characteristics.agility.total = 99;
        renderEditor();
        expect(screen.getByRole('img', { name: 'Athletics dice pool: 1 proficiency, 3 ability' })).toBeInTheDocument();
    });

    it('blocks an unresolved grant but still allows undoing a known purchase during a catalog failure', () => {
        useCharacterStore.getState().adjustSkillPurchase('ATHL', 1, skillDefinitions);
        useCharacterStore.getState().updateCharacter({ career: 'CAREER' });
        mockDefinitions({ careerError: true });
        renderEditor();
        expect(screen.getByRole('button', { name: 'Increase Athletics' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Undo Athletics purchase' })).toBeEnabled();
        fireEvent.click(screen.getByRole('button', { name: 'Undo Athletics purchase' }));
        expect(useCharacterStore.getState().character.experience.usedExperience).toBe(0);
    });

    it('reports missing skill definitions without applying edits', () => {
        mockDefinitions({ missingSkills: true });
        const before = useCharacterStore.getState().character;
        renderEditor();
        expect(screen.getByRole('alert')).toHaveTextContent('Skill definitions are missing');
        expect(screen.queryByRole('button', { name: 'Increase Athletics' })).not.toBeInTheDocument();
        expect(useCharacterStore.getState().character).toBe(before);
    });

    it('reports an unknown characteristic instead of displaying a fabricated pool', () => {
        mockDefinitions({ charKey: 'UNKNOWN' });
        renderEditor();
        expect(screen.getByRole('alert')).toHaveTextContent('Unknown characteristic for Athletics.');
    });
});
