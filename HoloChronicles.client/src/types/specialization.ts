export interface Direction {
    down: boolean;
    up: boolean;
    right: boolean;
    left: boolean;
}

export interface TalentRow {
    cost?: number;
    talents?: string[];
    directions?: Direction[];
}

export interface TalentRequirement {
    wearingArmor?: boolean;
    career?: boolean;
    specialization?: boolean;
    nonCareer?: boolean;
    soakAtLeast?: number;
    wieldingMelee?: boolean;
    wieldingBrawl?: boolean;
    wieldingLightsaber?: boolean;
    minForceRating?: boolean;
}

export interface SpecializationAttributes {
    woundThreshold?: number;
    strainThreshold?: number;
    defenseRanged?: number;
    defenseMelee?: number;
    soakValue?: number;
    experience?: number;
    forceRating?: number;
    requirement?: TalentRequirement;
}

export interface Requirements {
    woundThreshold?: number;
    strainThreshold?: number;
    defenseRanged?: number;
    defenseMelee?: number;
    soakValue?: number;
    experience?: number;
    forceRating?: number;
}

export interface AddlCareerSkills {
    skillCount?: number;
    chooseByType?: boolean;
    typeValue?: string;
}

export interface Specialization {
    key: string;
    name: string;
    description: string;
    sources: string[];
    custom?: string;
    careerSkills: string[];
    talentRows: TalentRow[];
    universal?: boolean;
    attributes: SpecializationAttributes;
    requirements?: Requirements;
    addlCareerSkills?: AddlCareerSkills[];
}