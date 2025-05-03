import { describe, it, expect, beforeEach } from 'vitest';
import { useCharacterStore } from '../../src/stores/characterStore';
import { SPECIES_API, SPECIES_CACHE_KEY } from '../../src/pages/character/species';
import { fetchDataWithRetryAndCache } from '../../src/api/fetcher';
import { Species } from '../../src/types/species';

let store: ReturnType<typeof useCharacterStore.getState>;

let currentSpecies: Species | null | undefined = null;

beforeEach(async () => {
    localStorage.setItem(SPECIES_CACHE_KEY, JSON.stringify([
        {
            "key": "HUMAN",
            "name": "Human",
            "description": "...",
            "sources": ["..."],
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
            }
        }
    ]));

    store = useCharacterStore.getState();
    store.resetCharacter();

    const data = await fetchDataWithRetryAndCache<Species[]>(
        SPECIES_API,
        SPECIES_CACHE_KEY
    );

    currentSpecies = data?.find((speciesItem) => speciesItem.key === store.character.species);
});

describe('derivedstats', () => {
    it('should recalculate soak, wounds, and total brawn when the brawn characteristic is changed', () => {
        const newBrawn = 4;

        store.updateCharacter({
            characteristics: {
                ...store.character.characteristics,
                brawn: {
                    ...store.character.characteristics.brawn,
                    bought: newBrawn,
                },
            },
        });

        const updatedCharacter = useCharacterStore.getState().character;

        const expectedTotal = newBrawn + (currentSpecies?.startingChars?.brawn ?? 0);
        const expectedNewSoak = expectedTotal + (currentSpecies?.startingAttrs?.soakValue ?? 0);
        const expectedNewWoundThreshold = expectedTotal + (currentSpecies?.startingAttrs?.woundThreshold ?? 0);

        expect(updatedCharacter.characteristics.brawn.total).toEqual(expectedTotal);
        expect(updatedCharacter.soak).toEqual(expectedNewSoak);
        expect(updatedCharacter.wounds.threshold).toEqual(expectedNewWoundThreshold);
    });

    it('should recalculate strain and total willpower when the brawn characteristic is changed', () => {
        const newWillpower = 2;

        store.updateCharacter({
            characteristics: {
                ...store.character.characteristics,
                willpower: {
                    ...store.character.characteristics.willpower,
                    bought: newWillpower,
                },
            },
        });

        const updatedCharacter = useCharacterStore.getState().character;

        const expectedTotal = newWillpower + (currentSpecies?.startingChars?.willpower ?? 0);
        const expectedStrainThreshold = expectedTotal + (currentSpecies?.startingAttrs?.strainThreshold ?? 0);

        expect(updatedCharacter.characteristics.willpower.total).toEqual(expectedTotal);
        expect(updatedCharacter.strain.threshold).toEqual(expectedStrainThreshold);
    });
});
