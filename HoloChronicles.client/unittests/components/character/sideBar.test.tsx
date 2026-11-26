import { beforeEach, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '@/components/character/sideBar';
import { useCharacterStore } from '@/stores/characterStore';

beforeEach(() => { localStorage.clear(); useCharacterStore.getState().resetCharacter(); });

describe('sidebar starting-specialization navigation', () => {
    it.each([{ specializations: [] }, { specializations: [''] }, { specializations: ['', 'EXTRA'] }])('requires a real starting choice when saved slots are $specializations', ({ specializations }) => {
        useCharacterStore.getState().updateCharacter({ career: 'CAREER', specializations });
        render(<MemoryRouter><Sidebar /></MemoryRouter>);
        for (const name of ['Characteristics', 'Skills', 'Talents']) {
            expect(screen.queryByRole('link', { name })).not.toBeInTheDocument();
            expect(screen.getByText(name)).toHaveAttribute('aria-disabled', 'true');
        }
    });
    it('enables advancement screens after the starting choice', () => {
        useCharacterStore.getState().updateCharacter({ career: 'CAREER', specializations: ['SPEC', 'EXTRA'] });
        render(<MemoryRouter><Sidebar /></MemoryRouter>);
        for (const name of ['Characteristics', 'Skills', 'Talents']) expect(screen.getByRole('link', { name })).toBeInTheDocument();
    });
});
