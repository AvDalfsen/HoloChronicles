import type { Species } from '@/types/species';
import type { SkillDefinitions } from '@/domain/character/skills';

export const humanSpecies: Species = {
    key: 'HUMAN',
    name: 'Human',
    description: '',
    startingChars: { brawn: 2, agility: 2, intellect: 2, cunning: 2, willpower: 2, presence: 2 },
    startingAttrs: { experience: 110, woundThreshold: 10, strainThreshold: 10 },
};

export const skillDefinitions: SkillDefinitions = {
    skills: [
        { key: 'ATHL', name: 'Athletics', charKey: 'BR', description: '', typeValue: 'General', source: [] },
        { key: 'STEALTH', name: 'Stealth', charKey: 'AG', description: '', typeValue: 'General', source: [] },
    ],
    careers: [
        { key: 'CAREER', name: 'Test career', description: '', careerSkills: ['ATHL'], specializations: ['SPEC'] },
        { key: 'OTHER', name: 'Other career', description: '', careerSkills: ['STEALTH'], specializations: [] },
    ],
    specializations: [
        { key: 'SPEC', name: 'Test specialization', description: '', careerSkills: ['STEALTH'], sources: [], talentRows: [], attributes: {} },
    ],
};
