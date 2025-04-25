import { Character } from './character';

// Default character template
export const defaultCharacter: Character = {
    name: '',
    species: '',
    career: '',
    specialization: [],
    characteristics: {
        brawn: 2,
        agility: 2,
        intellect: 2,
        cunning: 2,
        willpower: 2,
        presence: 2,
    },
    skills: {},
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
    gear: [],
    credits: 500,
    background: '',
    motivations: [],
};