export type CareerRequirement = {
    wearingArmor?: boolean;
    career?: boolean;
    specialization?: boolean;
    nonCareer?: boolean;
    soakAtLeast?: number;
};

export type Attributes = {
    woundThreshold?: number;
    strainThreshold?: number;
    defenseRanged?: number;
    defenseMelee?: number;
    soakValue?: number;
    experience?: number;
    forceRating?: number;
    requirement?: CareerRequirement;
};

export type Career = {
    key: string;
    name: string;
    description: string;
    sources?: string[];
    careerSkills: string[];
    specializations: string[];
    forceRating?: number;
    freeRanks?: number;
    attributes?: Attributes;
};