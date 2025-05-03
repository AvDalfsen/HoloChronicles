import { Character } from './character';

// Default character template
export const defaultCharacter: Character = {
    name: '',
    species: 'HUMAN',
    xp: 110,
    experience: {
        experienceRanks: {
            startingRanks: 0,
            purchasedRanks: 0,
            speciesRanks: 110
        },
        usedExperience: 0
    },
    career: '',
    specialization: [],
    characteristics: {
        brawn: { total: 2, species: 2, bought: 0, gear: 0, cybernetics: 0 },
        agility: { total: 2, species: 2, bought: 0, gear: 0, cybernetics: 0 },
        intellect: { total: 2, species: 2, bought: 0, gear: 0, cybernetics: 0 },
        cunning: { total: 2, species: 2, bought: 0, gear: 0, cybernetics: 0 },
        willpower: { total: 2, species: 2, bought: 0, gear: 0, cybernetics: 0 },
        presence: { total: 2, species: 2, bought: 0, gear: 0, cybernetics: 0 },
    },
    skills: {},
    talents: [],
    wounds: {
        threshold: 10,
        current: 0,
    },
    strain: {
        threshold: 10,
        current: 0,
    },
    soak: 2,
    defense: {
        melee: 0,
        ranged: 0,
    },
    gear: [],
    credits: 500,
    background: '',
    motivations: [],
};
