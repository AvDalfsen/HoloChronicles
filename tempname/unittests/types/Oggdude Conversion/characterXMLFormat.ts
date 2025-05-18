export interface Character {
    id: string;

    description: {
        charName: string;
        playerName: string;
        gender: string;
        genderValue: string;
        age: string;
        height: string;
        build: string;
        hair: string;
        eyes: string;
        otherFeatures: string;
        campaign: string;
    };

    species: {
        speciesKey: string;
        subSpeciesKey?: string;
        selectedOptions: {
            choiceKey: string;
            optionKey: string;
            skillModifiers?: {
                key: string;
                rankStart: number;
            }[];
        }[];
    };

    career: {
        careerKey: string;
        startingSpecKey?: string;
        careerSkills: string[];
        careerSpecSkills?: string[];
    };

    characteristics: Record<
        'brawn' | 'agility' | 'intellect' | 'cunning' | 'willpower' | 'presence',
        {
            speciesRanks?: number;
            attachRanks?: number;
            cyberRanks?: number;
            purchasedRanks: number;
        }
    >;

    motivations: {
        key: string;
        name: string;
        motiveKey: string;
        specMotiveKey: string;
        notes?: string;
    }[];

    specializations: {
        key: string;
        name: string;
        isStartingSpec: boolean;
        isCareerSpec: boolean;
        talents: {
            key: string;
            col: number;
            row: number;
            purchased: boolean;
        }[];
    }[];

    skills: {
        key: string;
        speciesRanks?: number;
        careerRanks?: number;
        purchasedRanks?: number;
        nonCareerRanks?: number;
        cyberRanks?: number;
        isCareer?: boolean;
        charKeyOverride?: string;
    }[];

    forcePowers: {
        key: string;
        name: string;
        mentorDiscount?: boolean;
        abilities: {
            key: string;
            col: number;
            row: number;
            span: number;
            cost: number;
            purchased?: boolean;
        }[];
    }[];

    obligations?: {
        startingSize: number;
        plus5XP: boolean;
        list: {
            key: string;
            name: string;
            size: number;
            obKey: string;
        }[];
    };

    duties?: {
        startingSize: number;
        plus5XP: boolean;
        list: {
            key: string;
            name: string;
            size: number;
            dutKey: string;
        }[];
    };

    attributes: {
        soakValue: {
            startingRanks?: number;
            purchasedRanks?: number;
            itemRanks?: number;
            charRanks?: number;
        };
        woundThreshold: {
            startingRanks?: number;
            purchasedRanks?: number;
            speciesRanks?: number;
            charRanks?: number;
        };
        strainThreshold: {
            startingRanks?: number;
            purchasedRanks?: number;
            speciesRanks?: number;
            charRanks?: number;
        };
        defenseRanged?: {
            purchasedRanks?: number;
        };
        defenseMelee?: {
            purchasedRanks?: number;
        };
        forceRating?: {
            purchasedRanks?: number;
            talentRanks?: number;
        };
    };

    experience: {
        startingRanks: number;
        speciesRanks: number;
        purchasedRanks: number;
        usedExperience: number;
    };

    morality?: {
        moralityValue: number;
    };

    story?: string;

    gear: {
        itemKey?: string;
        key: string;
        equipped?: boolean;
        held?: boolean;
        count: number;
        customGear?: {
            name: string;
            description: string;
            type: string;
            encumbrance: number;
            price: number;
            rarity: number;
            baseMods?: {
                miscDesc: string;
            }[];
        };
    }[];

    weapons: {
        itemKey?: string;
        key: string;
        equipped?: boolean;
        held?: boolean;
        count: number;
        innate?: boolean;
    }[];

    armor: {
        itemKey?: string;
        key: string;
        equipped?: boolean;
        held?: boolean;
        count: number;
        purchasedAttachments?: {
            attachKey: string;
            allMods: {
                key: string;
                count: number;
                id: string;
            }[];
        }[];
    }[];

    vehicles: {
        itemKey?: string;
        key: string;
        count: number;
        customVehicle?: {
            name: string;
            description: string;
            type: string;
            categories: string[];
            sensorRangeValue?: string;
            passengers?: number;
            silhouette?: number;
            armor?: number;
            fortification?: boolean;
            vehicleType?: string;
            defRanged?: number;
            sensorRange?: string;
        };
    }[];

    npcs: {
        name: string;
        key: string;
        description: string;
        category: string;
        type: string;
        silhouette: number;
        isMount: boolean;
        characteristics: Record<
            'brawn' | 'agility' | 'intellect' | 'cunning' | 'willpower' | 'presence',
            {
                startingRanks?: number;
                cyberRanks?: number;
            }
        >;
        weapons: {
            itemKey: string;
            key: string;
            equipped?: boolean;
            count: number;
        }[];
        armor: {
            itemKey: string;
            key: string;
            equipped?: boolean;
            count: number;
        }[];
        gear: {
            itemKey: string;
            key: string;
            equipped?: boolean;
            count: number;
        }[];
    }[];

    schematics: {
        templateKey: string;
        level: number;
        refTemplate: {
            key: string;
            name: string;
            description: string;
            source: string;
            tempType: string;
            materialCost: number;
            materialRarity: number;
            timeHours: number;
            timePerSilhouette: boolean;
            checkSkills: string[];
            checkDifficulty: number;
        };
    }[];

    rewards: {
        rewardKey: string;
        notes?: string;
        titleText?: string;
        selectedOptions?: {
            choiceKey: string;
            optionKey: string;
            startingAttribs?: {
                experience?: number;
            };
        }[];
    }[];

    summaryPriorities?: unknown;
    grants?: unknown;
}