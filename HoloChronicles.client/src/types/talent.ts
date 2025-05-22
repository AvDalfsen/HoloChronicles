export interface Direction {
    down: boolean;
    up: boolean;
    right: boolean;
    left: boolean;
}

export interface TalentRow {
    cost: number;
    talents: string[];
    directions: Direction[];
}

export interface TalentRequirement {
    wearingArmor?: boolean;
    soakAtLeast?: number;
}

export interface TalentAttributes {
    soakValue?: number;
    requirement?: TalentRequirement;
    defenseRanged?: number;
    defenseMelee?: number;
    forceRating?: number;
    strainThreshold?: number;
    woundThreshold?: number;
}

export interface ChooseCareerSkills {
    skillCount?: number;
    newSkills?: string[];
    chooseByType?: boolean;
    typeValue?: string;
    type?: string;
}

export interface TalentDieModifier {
    skillKey?: string;
    boostCount?: number;
    setbackCount?: number;
    forceCount?: number;
    skillType?: string;
    decreaseDifficultyCount?: number;
    applyOnce?: boolean;
    advantageCount?: number;
}

export interface SkillChoice {
    typeValue?: string;
    skillCount?: number;
    addDamagePerSkillRank?: boolean;
    addSkillsPerRank?: boolean;
    skillList?: string[];
}

export interface CharacteristicChoice {
    bonus?: string;
}

export interface RosterMods {
    pilotOnly?: boolean;
    defAll?: number;
}

export interface Damage {
    bonus?: number;
    skills?: string[];
}

export interface TalentQuality {
    key?: string;
    count?: number;
    useForceRating?: boolean;
}

export interface ItemChange {
    itemType?: string;
    qualityChanges?: TalentQuality[];
    damageChange?: number;
    skillKeys?: string[];
    encumChange?: number;
    addNewQualities?: boolean;
    unarmedOnly?: boolean;
    critChange?: number;
    updateQualities?: boolean;
}

export interface SkillChar {
    skillKey?: string;
    charKey?: string;
}

export interface Mod {
    key?: string;
    count?: number;
}

export interface Rigger {
    baseMods?: Mod[];
    silhouetteAdd?: number;
    chooseWeapon?: boolean;
    weaponMods?: Mod[];
    chooseVehicle?: boolean;
    silhouetteBase?: number;
}

export interface Talent {
    key: string;
    name: string;
    description: string;
    sources?: string[];
    custom?: string;
    ranked: boolean;
    activationValue?: string;
    attributes?: TalentAttributes;
    forceTalent: boolean;
    chooseCareerSkills?: ChooseCareerSkills;
    dieModifiers?: TalentDieModifier[];
    skillChoice?: SkillChoice;
    characteristicChoices?: CharacteristicChoice[];
    rosterMods?: RosterMods;
    damage?: Damage;
    modPercentDiscount?: number;
    juryRigged: boolean;
    itemChanges?: ItemChange[];
    addlHP?: number;
    skillChars?: SkillChar[];
    hpPerItem?: number;
    conflict?: number;
    rigger?: Rigger;
    addlCyber?: number;
}