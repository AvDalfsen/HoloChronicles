export interface Character {
    name: string;
    species: string;
    experience: {
        experienceRanks: {
            startingRanks: number
            purchasedRanks: number //Duty, Obligation, etc.
            speciesRanks: number
        }
        usedExperience: number
    }
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
    skills: {
        key: string;
        rank: {
            speciesRanks?: number;
            careerRanks?: number;
            purchasedRanks?: number;
            nonCareerRanks?: number;
            cyberRanks?: number;

        }
        isCareer?: boolean;
        charKeyOverride?: string;
    }[];
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