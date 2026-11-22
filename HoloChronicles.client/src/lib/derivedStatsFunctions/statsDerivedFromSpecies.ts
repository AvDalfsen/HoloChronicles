import { Character } from '@/types/character';
import { Species } from '@/types/species';
import { deriveCharacteristicStats } from '@/domain/character/derivedStats';

export function deriveStatsFromSpecies(character: Character, species?: Species): Character {
    const startingCharacteristics = species?.startingChars;

    if (!species || !startingCharacteristics) {
        return character;
    }

    character = ({
        ...character,
        species: species?.key ?? '',
        experience: {
            ...character.experience,
            experienceRanks: {
                ...character.experience.experienceRanks,
                speciesRanks: species?.startingAttrs?.experience ?? 0
            },
        },
        characteristics: {
            ...character.characteristics,
            brawn: {
                ...character.characteristics.brawn,
                species: startingCharacteristics.brawn || 0,
            },
            agility: {
                ...character.characteristics.agility,
                species: startingCharacteristics.agility || 0,
            },
            intellect: {
                ...character.characteristics.intellect,
                species: startingCharacteristics.intellect || 0,
            },
            cunning: {
                ...character.characteristics.cunning,
                species: startingCharacteristics.cunning || 0,
            },
            willpower: {
                ...character.characteristics.willpower,
                species: startingCharacteristics.willpower || 0,
            },
            presence: {
                ...character.characteristics.presence,
                species: startingCharacteristics.presence || 0,
            },
        },
    });

    character = deriveCharacteristicStats(character, species);

    return character;
}
