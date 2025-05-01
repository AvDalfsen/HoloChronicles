import { Character } from '@/types/character';
import { CharacterState } from '@/stores/characterStore';


export function applyDerivedStats(state: CharacterState, updates: Partial<Character>, changedBaseStat: String, character: Character): Character {
    if (changedBaseStat == 'characteristics') {

        const changedCharacteristics = checkCharacteristicsUpdate(state, updates);

        for (const key of changedCharacteristics) {
            const typedKey = key as keyof typeof character.characteristics;
            const total = recalculateTotalCharacteristic(character, typedKey);

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

            if (key == 'brawn') {
                const soak = recalculateSoak(character);
                const woundsThreshold = recalculateWoundThreshold(character);

                character = {
                    ...character,
                    soak,
                    wounds: {
                        ...character.wounds,
                        threshold: woundsThreshold,
                    } 
                }
            }

            console.log('Changed characteristic', typedKey, 'total', total);
        }
    }

    return character;
}

function checkCharacteristicsUpdate(state: CharacterState, updates: Partial<Character>): string[] {
    const oldChars = state.character.characteristics;
    const newChars = updates.characteristics;

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

function recalculateTotalCharacteristic(character: Character, changedCharacteristics: string): number {
    const characteristics = character.characteristics;

    const k = changedCharacteristics as keyof typeof characteristics;

    const species = characteristics[k].species ?? 0;
    const bought = characteristics[k].bought ?? 0;
    const gear = characteristics[k].gear ?? 0;
    const cybernetics = characteristics[k].cybernetics ?? 0;

    const total = species + bought + gear + cybernetics;

    return total
}

function recalculateSoak(character: Character): number {
    const brawn = character.characteristics.brawn.total ?? 0;
    //const gearSoakBonus = character.gear?.reduce((total, g) => total + (g.soakBonus || 0), 0) ?? 0;

    return brawn
}

function recalculateWoundThreshold(character: Character): number {
    const brawn = character.characteristics.brawn.total ?? 0;
    //const speciesWoundBase = character.species?.woundThreshold ?? 0;

    return brawn
}