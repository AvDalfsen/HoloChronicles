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
    specializations: string[];
    careerRanksRemaining: number;
    specializationRanksRemaining: number;
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
            specializationRanks?: number;
            purchasedRanks?: number;
            cyberRanks?: number;
        }
        isCareer?: boolean;
        charKeyOverride?: string;
    }[];
    talents: SpecializationTalents[];
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
    forceRating: number;
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

export interface SpecializationTalents {
    specializationKey: string;
    talents: storedTalent[];
}

export interface storedTalent {
    key: string;
    col: number;
    row: number;
}