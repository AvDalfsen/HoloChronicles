import type { Character } from './character';

// Allocate every nested value freshly for initialization, new characters and reset.
export function createDefaultCharacter(name = ''): Character {
    return {
        name,
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
        specializations: [],
        characteristics: {
            brawn: { total: 2, species: 2, bought: 0, gear: 0, cybernetics: 0 },
            agility: { total: 2, species: 2, bought: 0, gear: 0, cybernetics: 0 },
            intellect: { total: 2, species: 2, bought: 0, gear: 0, cybernetics: 0 },
            cunning: { total: 2, species: 2, bought: 0, gear: 0, cybernetics: 0 },
            willpower: { total: 2, species: 2, bought: 0, gear: 0, cybernetics: 0 },
            presence: { total: 2, species: 2, bought: 0, gear: 0, cybernetics: 0 },
        },
        skills: [],
        talents: [],
        wounds: {
            threshold: 12,
            current: 0,
        },
        strain: {
            threshold: 12,
            current: 0,
        },
        soak: 2,
        defense: {
            melee: 0,
            ranged: 0,
        },
        forceRating: 0,
        gear: [],
        credits: 500,
        background: '',
        motivations: [],
    };
}

// Retained for existing template comparisons. Never use as mutable store state.
export const defaultCharacter = createDefaultCharacter();
