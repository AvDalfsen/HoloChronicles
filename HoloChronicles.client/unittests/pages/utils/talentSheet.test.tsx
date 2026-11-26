import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import TalentSheet from '@/pages/utils/talentSheet';
import type { Specialization } from '@/types/specialization';
import type { Direction, Talent } from '@/types/talent';
import { useCharacterStore } from '@/stores/characterStore';
import { SPECIES_CACHE_KEY } from '@/pages/utils/fetcher';
import { humanSpecies } from '../../fixtures/character';

const direction = (overrides: Partial<Direction> = {}): Direction => ({ up: false, down: false, left: false, right: false, ...overrides });
const names = ['A', 'B', 'C', 'D', 'E', 'F'];
const talents: Talent[] = names.map(key => ({ key, name: key, description: key, ranked: false, forceTalent: false, juryRigged: false }));
const specialization: Specialization = {
    key: 'TEST', name: 'Test tree', description: '', sources: [], careerSkills: [], attributes: {},
    talentRows: [
        { cost: 5, talents: ['A', 'B', 'C'], directions: [direction({ right: true, down: true }), direction({ right: true }), direction({ down: true })] },
        { cost: 10, talents: ['D', 'E', 'F'], directions: [direction(), direction({ left: true }), direction({ up: true })] },
    ],
};
let heights: number[];

beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(SPECIES_CACHE_KEY, JSON.stringify([humanSpecies]));
    useCharacterStore.getState().resetCharacter();
    heights = [100, 180, 400, 240, 80, 160];
    // jsdom has no layout: give visible cards distinct heights and their cells
    // the tallest height in the row, reproducing the reported browser layout.
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        if (this.matches('.talent-sheet')) return new DOMRect(50, 100, 972, 800);
        const box = this.matches('.talent-box') ? this : this.querySelector('.talent-box');
        const index = names.indexOf(box?.querySelector('.talent-name')?.textContent ?? '');
        if (index < 0) return new DOMRect();
        const row = Math.floor(index / 3);
        const height = this.matches('.cell') ? Math.max(...heights.slice(row * 3, row * 3 + 3)) : heights[index];
        return new DOMRect(70 + (index % 3) * 316, row === 0 ? 120 : 536, 300, height);
    });
});

afterEach(() => vi.restoreAllMocks());

function lines(container: HTMLElement) {
    return [...container.querySelectorAll('svg.connectors line')].map(line => ({
        x1: Number(line.getAttribute('x1')), y1: Number(line.getAttribute('y1')),
        x2: Number(line.getAttribute('x2')), y2: Number(line.getAttribute('y2')),
    }));
}

describe('talent sheet connectors', () => {
    it('aligns all horizontal links in a row with its shortest visible card, including leftward links', () => {
        const { container } = render(<TalentSheet specialization={specialization} talents={talents} />);
        const connectors = lines(container);
        expect(connectors).toHaveLength(6);
        // A is the shortest card in row 0, even for the link between B and C.
        // E sets an independent connection height for row 1.
        expect(connectors.filter(line => line.y1 === line.y2)).toEqual([
            { x1: 320, y1: 70, x2: 336, y2: 70 },
            { x1: 636, y1: 70, x2: 652, y2: 70 },
            { x1: 336, y1: 476, x2: 320, y2: 476 },
        ]);
    });

    it('connects vertical links to the actual top and bottom edges, with coordinates relative to the sheet', () => {
        const { container } = render(<TalentSheet specialization={specialization} talents={talents} />);
        expect(lines(container).filter(line => line.y1 !== line.y2)).toEqual([
            { x1: 170, y1: 120, x2: 170, y2: 436 },
            { x1: 802, y1: 420, x2: 802, y2: 436 },
            { x1: 802, y1: 436, x2: 802, y2: 420 },
        ]);
    });

    it('remeasures changed talent descriptions even when the tree structure is unchanged', () => {
        const view = render(<TalentSheet specialization={specialization} talents={talents} />);
        heights[0] = 300;
        view.rerender(<TalentSheet specialization={specialization} talents={talents.map(talent => talent.key === 'A' ? { ...talent, description: 'A much longer description' } : talent)} />);
        // B is now the shortest card in row 0.
        expect(lines(view.container).filter(line => line.y1 === line.y2)).toEqual([
            { x1: 320, y1: 110, x2: 336, y2: 110 },
            { x1: 636, y1: 110, x2: 652, y2: 110 },
            { x1: 336, y1: 476, x2: 320, y2: 476 },
        ]);
    });

    it('drops connectors to missing cards, ignores their old measurements, and preserves their grid slots', () => {
        const view = render(<TalentSheet specialization={specialization} talents={talents} />);
        view.rerender(<TalentSheet specialization={specialization} talents={talents.filter(talent => talent.key !== 'A')} />);
        const cells = view.container.querySelectorAll('.cell');
        expect(cells).toHaveLength(6);
        expect(cells[0]).toBeEmptyDOMElement();
        expect(lines(view.container)).toHaveLength(4);
        expect(lines(view.container).filter(line => line.y1 === line.y2)).toEqual([
            { x1: 636, y1: 110, x2: 652, y2: 110 },
            { x1: 336, y1: 476, x2: 320, y2: 476 },
        ]);
    });

    it('replaces the previous connectors when switching to a smaller talent sheet', () => {
        const view = render(<TalentSheet specialization={specialization} talents={talents} />);
        const smaller: Specialization = { ...specialization, key: 'SMALL', talentRows: [
            { cost: 5, talents: ['A', 'B'], directions: [direction({ right: true }), direction()] },
        ] };
        view.rerender(<TalentSheet specialization={smaller} talents={talents} />);
        expect(lines(view.container)).toEqual([{ x1: 320, y1: 70, x2: 336, y2: 70 }]);
    });
});

describe('talent card purchase and sale', () => {
    it('toggles a talent and its exact XP charge through the card button', () => {
        useCharacterStore.getState().updateCharacter({ specializations: ['TEST'] });
        render(<TalentSheet specialization={specialization} talents={talents} />);
        const card = screen.getByRole('button', { name: 'A (5 XP, row 1, column 1)' });
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
        expect(card).toHaveAttribute('aria-pressed', 'false');
        card.focus();
        expect(card).toHaveFocus();

        fireEvent.click(card);
        expect(card).toHaveAttribute('aria-pressed', 'true');
        expect(useCharacterStore.getState().character).toMatchObject({
            experience: { usedExperience: 5 }, xp: 105,
            talents: [{ specializationKey: 'TEST', talents: [{ key: 'A', row: 0, col: 0, purchaseCost: 5 }] }],
        });

        fireEvent.click(card);
        expect(card).toHaveAttribute('aria-pressed', 'false');
        expect(useCharacterStore.getState().character).toMatchObject({ talents: [], experience: { usedExperience: 0 }, xp: 110 });
    });

    it.each([false, true])('keeps a locked card disabled when specialization ownership is %s', owned => {
        if (owned) useCharacterStore.getState().updateCharacter({ specializations: ['TEST'] });
        const before = useCharacterStore.getState().character;
        render(<TalentSheet specialization={specialization} talents={talents} />);
        const card = screen.getByRole('button', { name: 'D (10 XP, row 2, column 1)' });
        expect(card).toBeDisabled();
        fireEvent.click(card);
        expect(useCharacterStore.getState().character).toBe(before);
    });

    it('unlocks connected cards and refunds disconnected purchases when the starting card is sold', () => {
        useCharacterStore.getState().updateCharacter({ specializations: ['TEST'] });
        render(<TalentSheet specialization={specialization} talents={talents} />);
        const parent = screen.getByRole('button', { name: 'A (5 XP, row 1, column 1)' });
        const child = screen.getByRole('button', { name: 'D (10 XP, row 2, column 1)' });
        expect(child).toBeDisabled();
        fireEvent.click(parent);
        expect(child).toBeEnabled();
        fireEvent.click(child);
        expect(child).toHaveAttribute('aria-pressed', 'true');
        expect(useCharacterStore.getState().character.experience.usedExperience).toBe(15);

        fireEvent.click(parent);
        expect(parent).toHaveAttribute('aria-pressed', 'false');
        expect(child).toHaveAttribute('aria-pressed', 'false');
        expect(child).toBeDisabled();
        expect(useCharacterStore.getState().character).toMatchObject({ talents: [], experience: { usedExperience: 0 }, xp: 110 });
    });
});

describe('ranked talent badges', () => {
    const rankedTalents = talents.map(talent => talent.key === 'A'
        ? { ...talent, ranked: true, description: 'Gain one benefit per rank.' } : talent);
    const repeatedTree: Specialization = { ...specialization, talentRows: [
        { ...specialization.talentRows[0], talents: ['A', 'A', 'B'] },
        specialization.talentRows[1],
    ] };

    function seedOtherTree(keys: string[]) {
        const character = useCharacterStore.getState().character;
        useCharacterStore.setState({ character: { ...character,
            specializations: ['TEST', 'OTHER'],
            talents: [{ specializationKey: 'OTHER', talents: keys.map((key, index) => ({
                key, row: Math.floor(index / 4), col: index % 4, purchaseCost: 5,
            })) }],
            experience: { ...character.experience, usedExperience: keys.length * 5 },
        } });
    }

    function expectBadges(count: number, numeral: string) {
        const title = `${count} ${count === 1 ? 'rank' : 'ranks'} purchased across all specializations`;
        for (const card of screen.getAllByRole('button', { name: /^A \(/ })) {
            expect(within(card).getByTitle(title)).toHaveTextContent(numeral);
            expect(card).toHaveAttribute('aria-description', title);
        }
    }

    it('shows ranks from other specializations on every matching box, keeping non-ranked talents and descriptions unchanged', () => {
        seedOtherTree(['A', 'A', 'B']);
        const before = useCharacterStore.getState().character;
        render(<TalentSheet specialization={repeatedTree} talents={rankedTalents} />);
        expectBadges(2, 'II');
        for (const card of screen.getAllByRole('button', { name: /^A \(/ })) expect(card).toHaveAttribute('aria-pressed', 'false');
        expect(screen.getByRole('button', { name: 'B (5 XP, row 1, column 3)' })).toBeEmptyDOMElement();
        expect(screen.getAllByText('Gain one benefit per rank.')).toHaveLength(2);
        expect(useCharacterStore.getState().character).toBe(before);
    });

    it('updates all badges on purchase and sale, including unpurchased boxes, and hides them after the last rank is removed', () => {
        seedOtherTree(['A']);
        render(<TalentSheet specialization={repeatedTree} talents={rankedTalents} />);
        const first = screen.getByRole('button', { name: 'A (5 XP, row 1, column 1)' });
        const second = screen.getByRole('button', { name: 'A (5 XP, row 1, column 2)' });
        expectBadges(1, 'I');
        fireEvent.click(first);
        expectBadges(2, 'II');
        fireEvent.click(second);
        expectBadges(3, 'III');
        fireEvent.click(first);
        expectBadges(2, 'II');
        fireEvent.click(second);
        expectBadges(1, 'I');
        expect(screen.getAllByText('Gain one benefit per rank.')).toHaveLength(2);

        // A different editor removes the remaining purchase from the other tree.
        act(() => useCharacterStore.getState().updateCharacter({ talents: [] }));
        expect(first).toBeEmptyDOMElement();
        expect(second).toBeEmptyDOMElement();
        expect(first).not.toHaveAttribute('aria-description');
    });

    it.each([[4, 'IV'], [9, 'IX'], [14, 'XIV']] as const)('renders %i purchased ranks as %s', (count, numeral) => {
        seedOtherTree(Array.from({ length: count }, () => 'A'));
        render(<TalentSheet specialization={specialization} talents={rankedTalents} />);
        expectBadges(count, numeral);
    });
});

describe('talent purchase affordability', () => {
    function setRemainingXP(remaining: number) {
        const character = useCharacterStore.getState().character;
        useCharacterStore.setState({ character: { ...character,
            specializations: ['TEST'],
            xp: 999, // The legacy display cache must never authorize a purchase.
            experience: { ...character.experience, usedExperience: 110 - remaining },
        } });
    }

    it('disables unaffordable cards using the real balance and leaves the character untouched', () => {
        setRemainingXP(4);
        const before = useCharacterStore.getState().character;
        render(<TalentSheet specialization={specialization} talents={talents} />);
        const card = screen.getByRole('button', { name: 'A (5 XP, row 1, column 1)' });
        expect(card).toBeDisabled();
        expect(card).not.toHaveAttribute('title');
        expect(card).toHaveAttribute('aria-description', 'Not enough XP');
        fireEvent.click(card);
        expect(useCharacterStore.getState().character).toBe(before);
    });

    it('allows spending exactly the remaining XP and selling the talent to make other purchases affordable again', () => {
        setRemainingXP(5);
        render(<TalentSheet specialization={specialization} talents={talents} />);
        const first = screen.getByRole('button', { name: 'A (5 XP, row 1, column 1)' });
        const second = screen.getByRole('button', { name: 'B (5 XP, row 1, column 2)' });
        expect(first).toBeEnabled();
        fireEvent.click(first);
        expect(useCharacterStore.getState().character).toMatchObject({ xp: 0, experience: { usedExperience: 110 } });
        expect(first).toBeEnabled();
        expect(first).toHaveAttribute('title', 'Sell A');
        expect(second).toBeDisabled();
        fireEvent.click(second);
        expect(useCharacterStore.getState().character.talents[0].talents).toHaveLength(1);

        fireEvent.click(first);
        expect(useCharacterStore.getState().character).toMatchObject({ talents: [], xp: 5, experience: { usedExperience: 105 } });
        expect(second).toBeEnabled();
    });

    it('keeps the first purchase when two cards are clicked before the balance has rerendered', () => {
        setRemainingXP(5);
        render(<TalentSheet specialization={specialization} talents={talents} />);
        const first = screen.getByRole('button', { name: 'A (5 XP, row 1, column 1)' });
        const second = screen.getByRole('button', { name: 'B (5 XP, row 1, column 2)' });
        act(() => {
            fireEvent.click(first);
            fireEvent.click(second);
        });
        expect(useCharacterStore.getState().character).toMatchObject({
            xp: 0, experience: { usedExperience: 110 },
            talents: [{ specializationKey: 'TEST', talents: [{ key: 'A', row: 0, col: 0, purchaseCost: 5 }] }],
        });
    });

    it('allows a previously overspent character to refund purchased talents', () => {
        setRemainingXP(-5);
        const character = useCharacterStore.getState().character;
        useCharacterStore.setState({ character: { ...character,
            talents: [{ specializationKey: 'TEST', talents: [{ key: 'A', row: 0, col: 0, purchaseCost: 5 }] }],
        } });
        render(<TalentSheet specialization={specialization} talents={talents} />);
        const card = screen.getByRole('button', { name: 'A (5 XP, row 1, column 1)' });
        expect(card).toBeEnabled();
        fireEvent.click(card);
        expect(useCharacterStore.getState().character).toMatchObject({ talents: [], xp: 0, experience: { usedExperience: 110 } });
    });
});
