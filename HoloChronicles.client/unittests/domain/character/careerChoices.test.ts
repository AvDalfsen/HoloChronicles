// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { getFreeSkillAllowance, planCharacterChoice, type CharacterChoice } from '@/domain/character/careerChoices';
import { planSkillPurchaseChange } from '@/domain/character/skills';
import { getOwnedSpecializationKeys, getSpecializationGroups, getSpecializationPurchaseCost, getStartingSpecializationKey, replaceStartingSpecialization } from '@/domain/character/specializationSelections';
import { choiceCharacter, choiceDefinitions } from '../../fixtures/characterChoices';

const free = (skillKey: string, selected = true): CharacterChoice => ({ type: 'free-skill', source: 'career', sourceKey: 'CAREER', skillKey, selected });

describe('career and starting-specialization choices', () => {
    it('uses explicit career allowances, and the separate two-choice starting allowance', () => {
        const defs = choiceDefinitions();
        let character = choiceCharacter();
        expect(getFreeSkillAllowance(character, 'career', defs)).toMatchObject({ allowance: 3, remaining: 3 });
        for (const key of ['ATHL', 'COOL', 'VIGIL']) {
            const result = planCharacterChoice(character, free(key), defs);
            expect(result.ok).toBe(true);
            if (!result.ok) throw Error(result.message);
            character = result.character;
        }
        expect(getFreeSkillAllowance(character, 'career', defs).remaining).toBe(0);
        expect(planCharacterChoice(character, free('STEALTH'), defs)).toMatchObject({ ok: false, code: 'allowance-exhausted' });
        expect(getFreeSkillAllowance(character, 'starting-specialization', defs)).toMatchObject({ allowance: 2, remaining: 2 });
        const fallback = { ...defs, careers: defs.careers.map(career => ({ ...career, freeRanks: undefined })) };
        expect(getFreeSkillAllowance(character, 'career', fallback).remaining).toBe(1);
    });

    it.each([
        { ...free('ATHL'), sourceKey: 'OTHER' },
        free('PILOT'), free('MISSING'),
        { type: 'starting-specialization', key: 'EXTRA' },
        { ...free('ATHL'), source: 'unknown' },
        { ...free('ATHL'), selected: 1 },
        { type: 'unknown' },
    ])('rejects an ineligible or malformed choice %j without mutation', choice => {
        const character = choiceCharacter();
        const before = structuredClone(character);
        expect(planCharacterChoice(character, choice as CharacterChoice, choiceDefinitions()).ok).toBe(false);
        expect(character).toEqual(before);
    });

    it('counts free training for the creation ceiling, independently of paid and cybernetic ranks', () => {
        const character = choiceCharacter();
        character.skills = [{ key: 'ATHL', rank: { speciesRanks: 2, cyberRanks: 4 } }];
        expect(planCharacterChoice(character, free('ATHL'), choiceDefinitions())).toMatchObject({ ok: false, code: 'invalid-choice' });
        character.skills[0].rank.speciesRanks = 1;
        const result = planCharacterChoice(character, free('ATHL'), choiceDefinitions());
        expect(result).toMatchObject({ ok: true, character: { skills: [{ rank: { speciesRanks: 1, careerRanks: 1, cyberRanks: 4 } }] } });
    });

    it('refunds only the paid ranks with a changed free basis, preserving unrelated unknown costs', () => {
        const defs = choiceDefinitions();
        let character = choiceCharacter();
        character.skills = [{ key: 'STEALTH', rank: { speciesRanks: 1, specializationRanks: 1, cyberRanks: 2 } }];
        for (let i = 0; i < 2; i++) {
            const purchase = planSkillPurchaseChange(character, { key: 'STEALTH', delta: 1 }, defs);
            if (!purchase.ok) throw Error(purchase.message);
            character = purchase.character;
        }
        character.skills.push({ key: 'ATHL', rank: { purchasedRanks: 1 } });
        character.experience.usedExperience += 10;
        character.specializations.push('EXTRA');
        const before = structuredClone(character);
        const result = planCharacterChoice(character, { type: 'starting-specialization', key: null }, defs);
        expect(result).toMatchObject({ ok: true, xpChange: -35, requiresConfirmation: true,
            character: { specializations: ['', 'EXTRA'], experience: { usedExperience: 10 }, xp: 100 },
            consequences: { skillsRefunded: [{ skillKey: 'STEALTH', ranks: 2, xp: 35 }] },
        });
        if (!result.ok) throw Error(result.message);
        expect(result.character.skills[0]).toMatchObject({ rank: { speciesRanks: 1, specializationRanks: 0, purchasedRanks: 0, cyberRanks: 2 } });
        expect(result.character.skills[0].purchases).toBeUndefined();
        expect(result.character.skills[1]).toMatchObject({ key: 'ATHL', rank: { purchasedRanks: 1 } });
        expect(character).toEqual(before);
    });

    it.each([true, false])('refunds the changed skill when a free grant is set to %s', selected => {
        const character = choiceCharacter();
        character.skills = [{ key: 'ATHL', rank: { careerRanks: selected ? 0 : 1, purchasedRanks: 1 }, purchases: [{ cost: 10, nonCareer: true }] }];
        character.experience.usedExperience = 10;
        expect(planCharacterChoice(character, free('ATHL', selected), choiceDefinitions())).toMatchObject({ ok: true, xpChange: -10,
            character: { skills: [{ rank: { careerRanks: selected ? 1 : 0, purchasedRanks: 0 } }] }, requiresConfirmation: true });
    });

    it('keeps historical paid costs when only career membership changes', () => {
        const character = choiceCharacter();
        character.skills = [{ key: 'ATHL', rank: { purchasedRanks: 1 }, purchases: [{ cost: 10, nonCareer: true }] }];
        character.experience.usedExperience = 10;
        const result = planCharacterChoice(character, { type: 'career', key: 'OTHER' }, choiceDefinitions());
        expect(result).toMatchObject({ ok: true, xpChange: 0, character: { skills: [{ isCareer: false, purchases: [{ cost: 10, nonCareer: true }] }], experience: { usedExperience: 10 } } });
    });

    it('preserves eligible starting and paid trees while changing only the career Force contribution', () => {
        const character = choiceCharacter();
        character.forceRating = 2;
        character.specializations.push('EXTRA');
        character.skills = [{ key: 'STEALTH', rank: { specializationRanks: 1, cyberRanks: 2 } }];
        const defs = choiceDefinitions();
        const result = planCharacterChoice(character, { type: 'career', key: 'SHARED' }, defs);
        expect(result).toMatchObject({ ok: true, character: { forceRating: 3, specializations: ['SPEC', 'EXTRA'], skills: [{ rank: { specializationRanks: 1, cyberRanks: 2 } }] }, consequences: { specializationsRemoved: [] } });
        if (!result.ok) throw Error(result.message);
        expect(planCharacterChoice(result.character, { type: 'career', key: 'CAREER' }, defs)).toMatchObject({ ok: true, character: { forceRating: 2 } });
    });

    it('refunds recorded talent charges only for the removed starting tree', () => {
        const character = choiceCharacter();
        character.specializations.push('EXTRA');
        character.talents = [
            { specializationKey: 'SPEC', talents: [{ key: 'TALENT', row: 4, col: 0, purchaseCost: 5 }] },
            { specializationKey: 'EXTRA', talents: [{ key: 'OTHER', row: 0, col: 0 }] },
        ];
        character.experience.usedExperience = 35;
        const result = planCharacterChoice(character, { type: 'career', key: 'OTHER' }, choiceDefinitions());
        expect(result).toMatchObject({ ok: true, xpChange: -5, character: { specializations: ['', 'EXTRA'], talents: [character.talents[1]], experience: { usedExperience: 30 } } });
    });

    it.each(['unknown-skill', 'unknown-talent', 'duplicate-talent', 'refund-overrun', 'duplicate-skill', 'missing-definition', 'force-underflow'] as const)('rejects %s atomically', problem => {
        const character = choiceCharacter();
        const defs = choiceDefinitions();
        let choice: CharacterChoice = { type: 'career', key: 'OTHER' };
        if (problem === 'unknown-skill') character.skills = [{ key: 'ATHL', rank: { careerRanks: 1, purchasedRanks: 1 } }];
        if (problem === 'unknown-talent') character.talents = [{ specializationKey: 'SPEC', talents: [{ key: 'T', row: 0, col: 0 }] }];
        if (problem === 'duplicate-talent' || problem === 'refund-overrun') {
            const talent = { key: 'T', row: 0, col: 0, purchaseCost: 5 };
            character.talents = [{ specializationKey: 'SPEC', talents: problem === 'duplicate-talent' ? [talent, { ...talent }] : [talent] }];
        }
        if (problem === 'duplicate-skill') character.skills = [{ key: 'ATHL', rank: {} }, { key: 'ATHL', rank: {} }];
        if (problem === 'missing-definition') character.specializations.push('MISSING');
        if (problem === 'force-underflow') { character.career = 'SHARED'; choice = { type: 'career', key: 'CAREER' }; }
        const before = structuredClone(character);
        expect(planCharacterChoice(character, choice, defs).ok).toBe(false);
        expect(character).toEqual(before);
    });

    it('leaves no-ops untouched and never mutates frozen inputs or definitions', () => {
        const character = choiceCharacter();
        const defs = choiceDefinitions();
        const freeze = (value: object) => { Object.values(value).forEach(item => { if (item && typeof item === 'object') freeze(item); }); Object.freeze(value); };
        freeze(character); freeze(defs);
        for (const choice of [{ type: 'career', key: 'CAREER' }, { type: 'starting-specialization', key: 'SPEC' }, free('ATHL', false)] as CharacterChoice[]) {
            const result = planCharacterChoice(character, choice, defs);
            expect(result.ok && result.character).toBe(character);
        }
        expect(planCharacterChoice(character, free('ATHL'), defs)).toMatchObject({ ok: true });
    });

    it('encapsulates empty starting slots without counting them as owned or duplicating universal groups', () => {
        const character = choiceCharacter();
        const defs = choiceDefinitions();
        character.specializations = ['', 'EXTRA'];
        expect(getStartingSpecializationKey(character)).toBeNull();
        expect(getOwnedSpecializationKeys(character)).toEqual(['EXTRA']);
        expect(replaceStartingSpecialization(character, 'SPEC')).toEqual(['SPEC', 'EXTRA']);
        expect(getSpecializationPurchaseCost(character, defs.specializations[0], defs.careers[0])).toBe(20);
        character.specializations = ['SPEC'];
        const career = { ...defs.careers[0], specializations: ['SPEC', 'EXTRA'] };
        expect(getSpecializationGroups(character, defs.specializations, career).flatMap(group => group.specs).filter(spec => spec.key === 'EXTRA')).toHaveLength(1);
        character.specializations = ['', 'SPEC'];
        expect(planCharacterChoice(character, { type: 'starting-specialization', key: 'SPEC' }, defs)).toMatchObject({ ok: false, code: 'invalid-choice' });
    });
});
