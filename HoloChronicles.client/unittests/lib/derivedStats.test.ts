import { describe, it, expect, beforeEach } from 'vitest';
import { useCharacterStore } from '../../src/stores/characterStore';
import { SPECIES_API, SPECIES_CACHE_KEY } from '../../src/pages/character/species';
import { fetchDataWithRetryAndCache } from '../../src/api/fetcher';
import { Species } from '../../src/types/species';

let store: ReturnType<typeof useCharacterStore.getState>;
let currentSpecies: Species | null | undefined = null;
let data: Species[] | null | undefined = null;

beforeEach(async () => {
    localStorage.setItem(SPECIES_CACHE_KEY, JSON.stringify(mockSpecies));

    store = useCharacterStore.getState();
    store.resetCharacter();

    data = await fetchDataWithRetryAndCache<Species[]>(
        SPECIES_API,
        SPECIES_CACHE_KEY
    );

    currentSpecies = data?.find((speciesItem) => speciesItem.key === store.character.species);
});

describe('Brawn updates', () => {
    const newBrawn = 4;
    let expectedTotal = 0;

    beforeEach(() => {
        store.updateCharacter({
            characteristics: {
                ...store.character.characteristics,
                brawn: {
                    ...store.character.characteristics.brawn,
                    bought: newBrawn,
                },
            },
        });

        expectedTotal = newBrawn + (currentSpecies?.startingChars?.brawn ?? 0);
    });

    it('should recalculate total brawn correctly', () => {
        const updated = useCharacterStore.getState().character;

        expect(updated.characteristics.brawn.total).toEqual(expectedTotal);
    });

    it('should recalculate soak correctly', () => {
        const updated = useCharacterStore.getState().character;
        const expectedSoak = expectedTotal + (currentSpecies?.startingAttrs?.soakValue ?? 0);

        expect(updated.soak).toEqual(expectedSoak);
    });

    it('should recalculate wound threshold correctly', () => {
        const updated = useCharacterStore.getState().character;
        const expectedWounds = expectedTotal + (currentSpecies?.startingAttrs?.woundThreshold ?? 0);

        expect(updated.wounds.threshold).toEqual(expectedWounds);
    });
});

describe('Willpower updates', () => {
    const newWillpower = 2;
    let expectedTotal = 0;
    beforeEach(() => {
        store.updateCharacter({
            characteristics: {
                ...store.character.characteristics,
                willpower: {
                    ...store.character.characteristics.willpower,
                    bought: newWillpower,
                },
            },
        });

        expectedTotal = newWillpower + (currentSpecies?.startingChars?.willpower ?? 0);
    });

    it('should recalculate total willpower correctly', () => {
        const updated = useCharacterStore.getState().character;
        
        expect(updated.characteristics.willpower.total).toEqual(expectedTotal);
    });

    it('should recalculate strain threshold correctly', () => {
        const updated = useCharacterStore.getState().character;
        const expectedStrainThreshold = expectedTotal + (currentSpecies?.startingAttrs?.strainThreshold ?? 0);

        expect(updated.strain.threshold).toEqual(expectedStrainThreshold);
    });
});

describe('Species updates', () => {
    beforeEach(() => {
        const newSpecies = 'ALEENA';

        store.updateCharacter({
            species: newSpecies,
        });

        currentSpecies = data?.find((speciesItem) => speciesItem.key === newSpecies);
    });

    it('should update species key correctly', () => {
        const updated = useCharacterStore.getState().character;

        expect(updated.species).toEqual(currentSpecies?.key);
    });

    it('should update brawn species correctly', () => {
        const updated = useCharacterStore.getState().character;

        expect(updated.characteristics.brawn.species).toEqual(currentSpecies?.startingChars?.brawn);
        expect(updated.characteristics.brawn.bought).toEqual(0); //On reset, should be 0 by default
        expect(updated.characteristics.brawn.total).toEqual(
            (currentSpecies?.startingChars?.brawn ?? 0)
        );
    });

    it('should update soak correctly', () => {
        const updated = useCharacterStore.getState().character;
        const actualSoak = updated.characteristics.brawn.total + (currentSpecies?.startingAttrs?.soakValue);
        const expectedSoak = (currentSpecies?.startingChars.brawn ?? 0) + (currentSpecies?.startingAttrs?.soakValue ?? 0);

        expect(actualSoak).toEqual(expectedSoak);
    });

    it('should update wounds correctly', () => {
        const updated = useCharacterStore.getState().character;
        const actualWoundsThreshold = updated.characteristics.brawn.total + (currentSpecies?.startingAttrs?.woundThreshold);
        const expectedWoundsThreshold = (currentSpecies?.startingChars.brawn ?? 0) + (currentSpecies?.startingAttrs?.woundThreshold ?? 0);

        expect(actualWoundsThreshold).toEqual(expectedWoundsThreshold);
    });

    it('should update species experience correctly', () => {
        const updated = useCharacterStore.getState().character;
        const actualExperience = updated.experience.experienceRanks.speciesRanks;
        const expectedExperience = (currentSpecies?.startingAttrs.experience ?? 0);

        expect(actualExperience).toEqual(expectedExperience);
    });

    it('should update total experience correctly', () => {
        const updated = useCharacterStore.getState().character;
        const actualExperience = updated.xp;
        const expectedExperience = (currentSpecies?.startingAttrs.experience ?? 0);

        expect(actualExperience).toEqual(expectedExperience);
    });
});

const mockSpecies = [
{
    "key": "ALEENA",
    "name": "Aleena",
    "description": "Please see page 98 of the Nexus of Power Sourcebook for details.",
    "sources": [
        "Nexus of Power - p. 98"
    ],
    "custom": "",
    "startingChars": {
        "brawn": 1,
        "agility": 3,
        "intellect": 2,
        "cunning": 2,
        "willpower": 2,
        "presence": 2
    },
    "startingAttrs": {
        "woundThreshold": 8,
        "strainThreshold": 10,
        "experience": 95,
        "defenseRanged": null,
        "defenseMelee": null,
        "soakValue": null,
        "forceRating": null,
        "encumbranceBonus": null
    },
    "skillModifiers": [
        {
            "key": "COORD",
            "rankStart": 1,
            "rankLimit": 2,
            "rankAdd": null,
            "isCareer": null,
            "skillType": ""
        }
    ],
    "talentModifiers": [
        {
            "key": "DURA",
            "rankAdd": 1
        }
    ],
    "optionChoices": [
        {
            "key": "ALEENAAB1",
            "name": "Size",
            "options": [
                {
                    "key": "ALEENAAB1OP1",
                    "name": "Silhouette",
                    "description": "Aleena are smaller than average and count as silhouette 0.",
                    "skillModifiers": null,
                    "dieModifiers": null,
                    "startingSkillTraining": null,
                    "experience": null,
                    "talentModifiers": null
                }
            ]
        }
    ],
    "subSpeciesList": [],
    "weaponModifiers": [],
    "noForceAbilities": null,
    "cyberneticsAdjust": null
},
{
    "key": "HUMAN",
    "name": "Human",
    "description": "Please see page 48 of the Edge of the Empire Core Rulebook, page 57 of the Age of Rebellion Core Rulebook, or page 55 of the Force and Destiny Core Rulebook, for details.",
    "sources": [
        "Edge of the Empire Core Rulebook - p. 48",
        "Age of Rebellion Core Rulebook - p. 57",
        "Force and Destiny Core Rulebook - p. 55"
    ],
    "custom": "",
    "startingChars": {
        "brawn": 2,
        "agility": 2,
        "intellect": 2,
        "cunning": 2,
        "willpower": 2,
        "presence": 2
    },
    "startingAttrs": {
        "woundThreshold": 10,
        "strainThreshold": 10,
        "experience": 110,
        "defenseRanged": null,
        "defenseMelee": null,
        "soakValue": null,
        "forceRating": null,
        "encumbranceBonus": null
    },
    "skillModifiers": [],
    "talentModifiers": [],
    "optionChoices": [
        {
            "key": "HUMANAB",
            "name": "Skills",
            "options": [
                {
                    "key": "HUMANABSK",
                    "name": "Additional Non-Career Skills",
                    "description": "Humans start the game with one rank in two different non-career skills of their choice.",
                    "skillModifiers": null,
                    "dieModifiers": null,
                    "startingSkillTraining": [
                        {
                            "skillCount": 2,
                            "requirement": {
                                "career": "",
                                "specialization": "",
                                "fromSkillType": "",
                                "skillType": "",
                                "nonCareer": "true"
                            }
                        }
                    ],
                    "experience": null,
                    "talentModifiers": null
                }
            ]
        }
    ],
    "subSpeciesList": [],
    "weaponModifiers": [],
    "noForceAbilities": null,
    "cyberneticsAdjust": null
}];