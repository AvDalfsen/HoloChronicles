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
    skills: CharacterSkill[];
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

export interface CharacterSkill {
    key: string;
    rank: {
        speciesRanks?: number;
        careerRanks?: number;
        specializationRanks?: number;
        purchasedRanks?: number;
        cyberRanks?: number;
    };
    /** Exact history for the most recent purchased ranks. Earlier ranks may be unknown. */
    purchases?: SkillPurchase[];
    /** Legacy display cache; purchase eligibility uses resolved career/specialization grants. */
    isCareer?: boolean;
    charKeyOverride?: string;
}

export interface SkillPurchase {
    cost: number;
    /** Career changes never rewrite the surcharge paid on this purchase. */
    nonCareer: boolean;
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
