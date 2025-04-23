import { Character } from './character';

// Default character template
export const defaultCharacter: Character = {
    name: '',
    species: '',
    career: '',
    specialization: [],
    characteristics: {
        brawn: 1,
        agility: 1,
        intellect: 1,
        cunning: 1,
        willpower: 1,
        presence: 1,
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
    soak: 0,
    defense: {
        melee: 0,
        ranged: 0,
    },
    gear: [],
    credits: 500,
    background: '',
    motivations: [],
};