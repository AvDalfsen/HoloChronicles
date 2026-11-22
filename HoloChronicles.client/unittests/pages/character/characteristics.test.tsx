import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Characteristics from '@/pages/character/characteristics';
import Sidebar from '@/components/character/sideBar';
import { useCharacterStore } from '@/stores/characterStore';
import { useCachedData, SPECIES_API_KEY } from '@/pages/utils/fetcher';
import type { Characteristic } from '@/types/characteristic';
import type { Species } from '@/types/species';
import { humanSpecies } from '../../fixtures/character';

vi.mock('@/pages/utils/fetcher', async importOriginal => ({
    ...await importOriginal<typeof import('@/pages/utils/fetcher')>(),
    useCachedData: vi.fn(),
}));

function mockDefinitions(
    species: Species[] = [humanSpecies],
    characteristics: Characteristic[] = [{ key: 'BR', name: 'Brawn', abbrev: 'Br' }],
) {
    vi.mocked(useCachedData).mockImplementation(<T,>(url: string) => ({
        data: (url === SPECIES_API_KEY ? species : characteristics) as T,
        loading: false,
        error: null,
    }));
}

function renderEditor() {
    render(<MemoryRouter><Characteristics /><Sidebar /></MemoryRouter>);
}

beforeEach(() => {
    localStorage.clear();
    useCharacterStore.getState().resetCharacter();
    mockDefinitions();
});

describe('characteristic screen and sidebar', () => {
    it('shows the quoted charge, updates ranks and sidebar, and undoes the purchase', () => {
        renderEditor();
        expect(screen.getByText('Next increase: 30 XP')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Increase Brawn' }));
        expect(screen.getByLabelText('Brawn total')).toHaveTextContent('3');
        expect(screen.getByRole('complementary')).toHaveTextContent(/spent\s*30; rem\s*80/);
        expect(screen.getByRole('button', { name: 'Undo Brawn purchase' })).toHaveAttribute('title', 'Refund 30 XP');

        fireEvent.click(screen.getByRole('button', { name: 'Undo Brawn purchase' }));
        expect(screen.getByLabelText('Brawn total')).toHaveTextContent('2');
        expect(screen.getByRole('complementary')).toHaveTextContent(/spent\s*0; rem\s*110/);
    });

    it('explains an unaffordable increase and leaves it disabled', () => {
        const character = useCharacterStore.getState().character;
        useCharacterStore.setState({ character: {
            ...character,
            xp: 1000,
            experience: { ...character.experience, usedExperience: 90 },
        } });
        renderEditor();
        expect(screen.getByRole('button', { name: 'Increase Brawn' })).toBeDisabled();
        expect(screen.getByText('This increase costs 30 XP; 20 XP is available.')).toBeInTheDocument();
        expect(screen.getByRole('complementary')).toHaveTextContent(/spent\s*90; rem\s*20/);
    });

    it('uses a definition key even when the display name changes', () => {
        mockDefinitions([humanSpecies], [{ key: 'BR', name: 'Strength' }]);
        renderEditor();
        fireEvent.click(screen.getByRole('button', { name: 'Increase Strength' }));
        expect(useCharacterStore.getState().character.characteristics.brawn.bought).toBe(1);
    });

    it('explains why an older purchased rank cannot be refunded automatically', () => {
        const character = useCharacterStore.getState().character;
        character.characteristics.brawn.bought = 1;
        character.experience.usedExperience = 30;
        renderEditor();
        expect(screen.getByRole('button', { name: 'Undo Brawn purchase' })).toBeDisabled();
        expect(screen.getByText('This saved rank has no recorded XP cost and cannot be refunded automatically.')).toBeInTheDocument();
    });

    it('shows a missing-species error without changing the character', () => {
        mockDefinitions([]);
        const before = useCharacterStore.getState().character;
        renderEditor();
        expect(screen.getByRole('alert')).toHaveTextContent('selected species definitions are missing');
        expect(useCharacterStore.getState().character).toBe(before);
        expect(screen.queryByRole('button', { name: 'Increase Brawn' })).not.toBeInTheDocument();
    });

    it('reports unknown characteristic keys instead of accessing a name-derived property', () => {
        mockDefinitions([humanSpecies], [{ key: 'UNKNOWN', name: 'Unknown' }]);
        renderEditor();
        expect(screen.getByRole('alert')).toHaveTextContent('Unknown characteristic: UNKNOWN');
    });
});
