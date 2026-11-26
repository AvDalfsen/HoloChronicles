import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import Careers from '@/pages/character/careers';
import Specializations from '@/pages/character/specializations';
import TalentSheet from '@/pages/utils/talentSheet';
import { useCharacterStore } from '@/stores/characterStore';
import { useCachedData, SKILLS_API_KEY, CAREERS_API_KEY, SPECIES_CACHE_KEY } from '@/pages/utils/fetcher';
import { choiceCharacter, choiceDefinitions } from '../../fixtures/characterChoices';
import { humanSpecies } from '../../fixtures/character';

vi.mock('@/pages/utils/fetcher', async importOriginal => ({
    ...await importOriginal<typeof import('@/pages/utils/fetcher')>(), useCachedData: vi.fn(),
}));
let definitions = choiceDefinitions();
beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(SPECIES_CACHE_KEY, JSON.stringify([humanSpecies]));
    useCharacterStore.setState({ character: choiceCharacter() });
    definitions = choiceDefinitions();
    vi.mocked(useCachedData).mockImplementation(<T,>(url: string) => ({
        data: (url === SKILLS_API_KEY ? definitions.skills : url === CAREERS_API_KEY ? definitions.careers : definitions.specializations) as T,
        loading: false, error: null,
    }));
});

function selectRow(table: string, name: string) { fireEvent.click(within(screen.getByRole('table', { name: table })).getByText(name)); }
function requestCareerChange() {
    selectRow('Careers', 'Other career');
    fireEvent.click(screen.getByRole('button', { name: 'Select Other career' }));
}

describe('career choice screens', () => {
    it('derives remaining choices from an explicit allowance and enables a choice again after deselection', () => {
        render(<Careers />);
        for (const name of ['Athletics', 'COOL', 'VIGIL']) fireEvent.click(screen.getByRole('checkbox', { name: `Free career rank in ${name}` }));
        expect(screen.getByText('Remaining free career skills: 0')).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: 'Free career rank in Stealth' })).toBeDisabled();
        fireEvent.click(screen.getByRole('checkbox', { name: 'Free career rank in Athletics' }));
        expect(screen.getByText('Remaining free career skills: 1')).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: 'Free career rank in Stealth' })).toBeEnabled();
    });

    it('previews an exact affected-rank refund, cancels without mutation, then applies atomically', () => {
        const store = useCharacterStore.getState();
        store.setFreeSkillChoice({ source: 'career', sourceKey: 'CAREER', skillKey: 'ATHL', selected: true }, definitions);
        store.adjustSkillPurchase('ATHL', 1, definitions);
        store.adjustSkillPurchase('PILOT', 1, definitions);
        const before = useCharacterStore.getState().character;
        render(<Careers />);
        requestCareerChange();
        expect(screen.getByRole('dialog')).toHaveTextContent('Undo 1 purchased Athletics rank and refund 10 XP.');
        expect(screen.getByRole('dialog')).not.toHaveTextContent('purchased PILOT');
        expect(useCharacterStore.getState().character).toBe(before);
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(useCharacterStore.getState().character).toBe(before);
        requestCareerChange();
        fireEvent.click(screen.getByRole('button', { name: 'Apply change' }));
        expect(useCharacterStore.getState().character).toMatchObject({ career: 'OTHER', specializations: [], experience: { usedExperience: 10 }, xp: 100 });
        expect(useCharacterStore.getState().character.skills.find(skill => skill.key === 'PILOT')?.rank.purchasedRanks).toBe(1);
    });

    it.each(['character', 'definitions'] as const)('rejects confirmation if the %s changed after preview', change => {
        const view = render(<Careers />);
        requestCareerChange();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        if (change === 'character') act(() => useCharacterStore.getState().resetCharacter('New draft'));
        else { definitions = choiceDefinitions(); view.rerender(<Careers />); }
        const current = useCharacterStore.getState().character;
        fireEvent.click(screen.getByRole('button', { name: 'Apply change' }));
        expect(screen.getByRole('alert')).toHaveTextContent('changed while this confirmation was open');
        expect(useCharacterStore.getState().character).toBe(current);
    });

    it('shows the refund before adding a free grant to a previously purchased skill', () => {
        useCharacterStore.getState().adjustSkillPurchase('ATHL', 1, definitions);
        render(<Careers />);
        fireEvent.click(screen.getByRole('checkbox', { name: 'Free career rank in Athletics' }));
        expect(screen.getByRole('dialog')).toHaveTextContent('refund 5 XP');
        expect(screen.getByRole('checkbox', { name: 'Free career rank in Athletics' })).not.toBeChecked();
        fireEvent.click(screen.getByRole('button', { name: 'Apply change' }));
        expect(screen.getByRole('checkbox', { name: 'Free career rank in Athletics' })).toBeChecked();
        expect(useCharacterStore.getState().character.experience.usedExperience).toBe(0);
    });

    it('allows browsing but no free specialization ranks until the starting choice is selected', () => {
        useCharacterStore.getState().updateCharacter({ specializations: [] });
        const before = useCharacterStore.getState().character;
        render(<Specializations />);
        selectRow('Specializations', 'Test specialization');
        const checkbox = screen.getByRole('checkbox', { name: 'Free starting-specialization rank in Stealth' });
        expect(checkbox).toBeDisabled();
        expect(useCharacterStore.getState().character).toBe(before);
        fireEvent.click(screen.getByRole('button', { name: 'Select Test specialization' }));
        expect(checkbox).toBeEnabled();
        fireEvent.click(checkbox);
        expect(checkbox).toBeChecked();
        expect(screen.getByText('Remaining free specialization skills: 1')).toBeInTheDocument();
        expect(before.specializations).toEqual([]);
    });

    it('keeps paid additional specializations visible after starting-choice removal', () => {
        useCharacterStore.getState().updateCharacter({ specializations: ['SPEC', 'EXTRA'] });
        render(<Specializations />);
        selectRow('Specializations', 'Test specialization');
        fireEvent.click(screen.getByRole('button', { name: 'Remove Test specialization' }));
        fireEvent.click(screen.getByRole('button', { name: 'Apply change' }));
        expect(screen.getByText('Purchased Specializations')).toBeInTheDocument();
        expect(within(screen.getByRole('table', { name: 'Specializations' })).getByText('Additional specialization')).toBeInTheDocument();
        expect(useCharacterStore.getState().character.specializations).toEqual(['', 'EXTRA']);
    });

    it('blocks starting-tree removal when an old talent has no recorded charge', () => {
        useCharacterStore.getState().updateCharacter({ talents: [{ specializationKey: 'SPEC', talents: [{ key: 'T', row: 0, col: 0 }] }] });
        const before = useCharacterStore.getState().character;
        render(<Specializations />);
        selectRow('Specializations', 'Test specialization');
        fireEvent.click(screen.getByRole('button', { name: 'Remove Test specialization' }));
        expect(screen.getByRole('alert')).toHaveTextContent('without recorded XP costs');
        expect(useCharacterStore.getState().character).toBe(before);
    });

    it('records an actual new talent charge so starting-tree removal can refund it exactly', () => {
        const spec = { ...definitions.specializations[0], talentRows: [{ cost: 5, talents: ['T'], directions: [{ up: false, down: false, left: false, right: false }] }] };
        const view = render(<TalentSheet specialization={spec} talents={[{ key: 'T', name: 'Test talent', description: '', ranked: false, forceTalent: false, juryRigged: false }]} />);
        fireEvent.click(screen.getByRole('button', { name: 'Test talent (5 XP, row 1, column 1)' }));
        expect(useCharacterStore.getState().character.talents[0].talents[0].purchaseCost).toBe(5);
        view.unmount();
        render(<Specializations />);
        selectRow('Specializations', 'Test specialization');
        fireEvent.click(screen.getByRole('button', { name: 'Remove Test specialization' }));
        expect(screen.getByRole('dialog')).toHaveTextContent('Remove 1 talent purchase and refund 5 XP.');
        fireEvent.click(screen.getByRole('button', { name: 'Apply change' }));
        expect(useCharacterStore.getState().character).toMatchObject({ talents: [], experience: { usedExperience: 0 }, xp: 110 });
    });

    it('charges the displayed non-career specialization surcharge after browsing a universal specialization', () => {
        const outside = { ...definitions.specializations[0], key: 'OUTSIDE', name: 'Outside specialization' };
        definitions = { ...definitions, specializations: [...definitions.specializations, outside] };
        render(<Specializations />);
        selectRow('Specializations', 'Additional specialization');
        selectRow('Specializations', 'Outside specialization');
        const row = screen.getByRole('button', { name: 'Select Outside specialization' }).closest('tr')!;
        expect(within(row).getByText('30')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Select Outside specialization' }));
        expect(useCharacterStore.getState().character).toMatchObject({ specializations: ['SPEC', 'OUTSIDE'], experience: { usedExperience: 30 }, xp: 80 });
    });
});
