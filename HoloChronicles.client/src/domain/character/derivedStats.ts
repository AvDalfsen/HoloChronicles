import type { Character, CharacteristicKey } from '@/types/character';
import type { Species } from '@/types/species';
import { getExperienceSummary } from './experience';

export const CHARACTERISTIC_KEYS: readonly CharacteristicKey[] = [
    'brawn', 'agility', 'intellect', 'cunning', 'willpower', 'presence',
];

// These are dataset keys, so changing a display name cannot change its meaning.
const definitionKeys = new Map<string, CharacteristicKey>([
    ['BR', 'brawn'], ['AG', 'agility'], ['INT', 'intellect'], ['CUN', 'cunning'],
    ['WIL', 'willpower'], ['PR', 'presence'],
]);

export function getCharacteristicKey(definitionKey: string | undefined) {
    return definitionKey ? definitionKeys.get(definitionKey) : undefined;
}

export function recalculateTotalCharacteristic(character: Character, key: CharacteristicKey): number {
    const value = character.characteristics[key];
    return (value.species ?? 0) + (value.bought ?? 0) + (value.gear ?? 0) + (value.cybernetics ?? 0);
}

export function recalculateSoak(character: Character, species?: Species): number {
    return recalculateTotalCharacteristic(character, 'brawn') + (species?.startingAttrs.soakValue ?? 0);
}

// Keep the existing threshold rules during this structural slice. Finalized
// creation bases and talent/equipment effects need their own model and tests.
export function recalculateWoundThreshold(character: Character, species?: Species): number {
    return recalculateTotalCharacteristic(character, 'brawn') + (species?.startingAttrs.woundThreshold ?? 0);
}

export function recalculateStrainThreshold(character: Character, species?: Species): number {
    return recalculateTotalCharacteristic(character, 'willpower') + (species?.startingAttrs.strainThreshold ?? 0);
}

export function deriveCharacteristicStats(character: Character, species: Species): Character {
    const characteristics = { ...character.characteristics };
    for (const key of CHARACTERISTIC_KEYS) {
        characteristics[key] = {
            ...character.characteristics[key],
            total: recalculateTotalCharacteristic(character, key),
        };
    }

    return {
        ...character,
        characteristics,
        soak: recalculateSoak(character, species),
        wounds: { ...character.wounds, threshold: recalculateWoundThreshold(character, species) },
        strain: { ...character.strain, threshold: recalculateStrainThreshold(character, species) },
        xp: getExperienceSummary(character).available,
    };
}
