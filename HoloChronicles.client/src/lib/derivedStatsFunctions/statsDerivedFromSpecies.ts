import { Character } from '@/types/character';
import { CharacterState } from '@/stores/characterStore';
import { Species } from '@/types/species';
import { deriveStatsFromCharacteristics } from '@/lib/derivedStatsFunctions/statsDerivedFromCharacteristics'

export function deriveStatsFromSpecies(state: CharacterState, character: Character, species?: Species): Character {
    const startingCharacteristics = species?.startingChars;

    if (!startingCharacteristics) {
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

    character = deriveStatsFromCharacteristics(state, character, character, species);

    return character;
}