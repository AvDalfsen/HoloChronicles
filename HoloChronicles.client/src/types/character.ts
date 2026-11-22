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
    /** Legacy cached available XP. Read domain getExperienceSummary for balances. */
    xp: number;
    career: string;
    specializations: string[];
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
    /** Exact costs of the most recently bought ranks, in purchase order.
     * Older bought ranks may have no cost history; never infer their refund. */
    purchaseCosts?: number[];
}

export type CharacteristicKey = keyof Character['characteristics'];

export interface SpecializationTalents {
    specializationKey: string;
    talents: storedTalent[];
}

export interface storedTalent {
    key: string;
    col: number;
    row: number;
}
