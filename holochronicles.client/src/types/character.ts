export interface Character {
    name: string;
    species: string;
    xp: number;
    career: string;
    specialization: string[];
    characteristics: {
        brawn: CharacteristicValue;
        agility: CharacteristicValue;
        intellect: CharacteristicValue;
        cunning: CharacteristicValue;
        willpower: CharacteristicValue;
        presence: CharacteristicValue;
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

export interface CharacteristicValue {
    total: number;
    species: number;
    bought: number;
    gear: number;
    cybernetics: number;
}