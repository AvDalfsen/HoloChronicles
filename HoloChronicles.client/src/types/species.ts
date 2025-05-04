export interface StartingChars {
    brawn: number;
    agility: number;
    intellect: number;
    cunning: number;
    willpower: number;
    presence: number;
}

export interface StartingAttrs {
    woundThreshold: number;
    strainThreshold: number;
    experience: number;
    defenseRanged?: number;
    defenseMelee?: number;
    soakValue?: number;
    forceRating?: number;
    encumbranceBonus?: number;
}

export interface SkillModifier {
    key?: string;
    rankStart?: number;
    rankLimit?: number;
    rankAdd?: number;
    isCareer?: boolean;
    skillType?: string;
}

export interface TalentModifier {
    key?: string;
    rankAdd?: number;
}

export interface DieModifier {
    skillKey?: string;
    advantageCount?: number;
    skillType?: string;
    boostCount?: number;
    setbackCount?: number;
    successCount?: number;
    addSetbackCount?: number;
}

export interface SpeciesRequirement {
    career?: string;
    specialization?: string;
    fromSkillType?: string;
    skillType?: string;
    nonCareer?: string;
}

export interface SkillTraining {
    skillCount?: number;
    requirement?: SpeciesRequirement;
}

export interface Option {
    key?: string;
    name?: string;
    description?: string;
    skillModifiers?: SkillModifier[];
    dieModifiers?: DieModifier[];
    startingSkillTraining?: SkillTraining[];
    experience?: number;
    talentModifiers?: TalentModifier[];
}

export interface OptionChoice {
    key?: string;
    name?: string;
    options?: Option[];
}

export interface WeaponModifier {
    allSkillKey?: string;
    damageAdd?: number;
    crit?: number;
    range?: string;
    unarmedName?: string;
    skillKey?: string;
    damage?: number;
    qualities?: Quality[];
    rangeValue?: string;
}

export interface SubSpecies {
    key?: string;
    name?: string;
    description?: string;
    startingChars?: StartingChars;
    startingAttrs?: StartingAttrs;
    skillModifiers?: SkillModifier[];
    optionChoices?: OptionChoice[];
    cyberneticsAdjust?: number;
    weaponModifiers?: WeaponModifier[];
    talentModifiers?: TalentModifier[];
}

export interface Species {
    key: string;
    name: string;
    description: string;
    sources?: string[];
    custom?: string;
    startingChars: StartingChars;
    startingAttrs: StartingAttrs;
    skillModifiers?: SkillModifier[];
    talentModifiers?: TalentModifier[];
    optionChoices?: OptionChoice[];
    subSpeciesList?: SubSpecies[];
    weaponModifiers?: WeaponModifier[];
    noForceAbilities?: boolean;
    cyberneticsAdjust?: number;
}

export interface Quality {
    key?: string;
    count?: number;
}