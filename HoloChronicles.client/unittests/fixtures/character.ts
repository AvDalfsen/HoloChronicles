import type { Species } from '@/types/species';

export const humanSpecies: Species = {
    key: 'HUMAN',
    name: 'Human',
    description: '',
    startingChars: { brawn: 2, agility: 2, intellect: 2, cunning: 2, willpower: 2, presence: 2 },
    startingAttrs: { experience: 110, woundThreshold: 10, strainThreshold: 10 },
};
