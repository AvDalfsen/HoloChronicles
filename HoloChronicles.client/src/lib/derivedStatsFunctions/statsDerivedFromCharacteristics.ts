import { Character } from '@/types/character';
import { CharacterState } from '@/stores/characterStore';
import { Species } from '@/types/species';
import * as helperFunctions from '@/lib/derivedStatsFunctions/helperFunctions'

export function deriveStatsFromCharacteristics(state: CharacterState, changes: Partial<Character>, character: Character, species?: Species): Character {
    const changedCharacteristics = checkCharacteristicsUpdate(state, changes);

    for (const key of changedCharacteristics) {
        const typedKey = key as keyof typeof character.characteristics;
        const total = helperFunctions.recalculateTotalCharacteristic(character, typedKey);

        character = {
            ...character,
            characteristics: {
                ...character.characteristics,
                [typedKey]: {
                    ...character.characteristics[typedKey],
                    total: total,
                },
            },
        };

        console.log('New total', key, ':', total);

        if (key === 'brawn') {
            const newSoakTotal = helperFunctions.recalculateSoak(character, species);
            const newWoundsThreshold = helperFunctions.recalculateWoundThreshold(character, species);

            character = {
                ...character,
                soak: newSoakTotal,
                wounds: {
                    ...character.wounds,
                    threshold: newWoundsThreshold,
                }
            }

            console.log('New soak total:', newSoakTotal);
            console.log('New wounds threshold:', newWoundsThreshold);
        };

        if (key === 'willpower') {
            const newStrainTotal = helperFunctions.recalculateStrainThreshold(character, species);

            character = {
                ...character,
                strain: {
                    ...character.strain,
                    threshold: newStrainTotal,
                }
            }

            console.log('New strain threshold:', newStrainTotal);
        };
    }

    const xp = helperFunctions.recalculateAvailableXP(character);

    character = {
        ...character,
        xp: xp,
    }

    console.log('New available XP: ', xp);

    return character;
}

function checkCharacteristicsUpdate(state: CharacterState, changes: Partial<Character>): string[] {
    const oldChars = state.character.characteristics;
    const newChars = changes.characteristics;

    if (!newChars) return [];

    const changedCharacteristics = Object.keys(newChars).filter((name) => {
        const n = name as keyof typeof oldChars;
        const oldChar = oldChars[n];
        const newChar = newChars[n];

        return (
            oldChar.total !== newChar.total ||
            oldChar.species !== newChar.species ||
            oldChar.bought !== newChar.bought ||
            oldChar.gear !== newChar.gear ||
            oldChar.cybernetics !== newChar.cybernetics
        );
    });

    return changedCharacteristics;
}