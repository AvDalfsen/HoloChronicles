export interface Character {
    name: string;
    species: string;
    career: string;
    specialization: string[];
    characteristics: {
        brawn: number;
        agility: number;
        intellect: number;
        cunning: number;
        willpower: number;
        presence: number;
    };
    skills: Record<string, number>;
    talents: string[];
    wounds: {
        threshold: number;
        current: number;
    };
    strain: {
        threshold: number;
        current: number;
    };
    soak: number;
    defense: {
        melee: number;
        ranged: number;
    };
    gear: string[];
    credits: number;
    background: string;
    motivations: string[];
}