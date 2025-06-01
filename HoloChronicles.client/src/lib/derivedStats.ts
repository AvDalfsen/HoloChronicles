import { Character } from '@/types/character';
import { Species } from '@/types/species';
import { CharacterState } from '@/stores/characterStore';
import { deriveStatsFromCharacteristics } from '@/lib/derivedStatsFunctions/statsDerivedFromCharacteristics'
import { deriveStatsFromSpecies } from '@/lib/derivedStatsFunctions/statsDerivedFromSpecies'
import { deriveEffectsFromTalents } from '@/lib/derivedStatsFunctions/talentEffects'
import { SPECIES_CACHE_KEY } from '@/pages/utils/fetcher';

export function applyDerivedStats(state: CharacterState, changes: Partial<Character>, changedBaseStat: String, updatedCharacter: Character, originalCharacter: Character): Character {
    const selectedSpecies = getSelectedSpeciesFromCache(updatedCharacter)

    if (!selectedSpecies) {
        console.error('No Species found in cache with key from Character.');
        return updatedCharacter;
    }

    if (changedBaseStat === 'species') {
        updatedCharacter = deriveStatsFromSpecies(state, updatedCharacter, selectedSpecies)
    }
    else if (changedBaseStat === 'characteristics') {
        updatedCharacter = deriveStatsFromCharacteristics(state, changes, updatedCharacter, selectedSpecies)
    }
    else if (changedBaseStat === 'talents') {
        updatedCharacter = deriveEffectsFromTalents(state, changes, updatedCharacter, originalCharacter, selectedSpecies)
    }

    return updatedCharacter;
}

export function getSelectedSpeciesFromCache(character: Character): Species | null {
    const cached = localStorage.getItem(SPECIES_CACHE_KEY);
    if (!cached) return null;

    try {
        const speciesArray: Species[] = JSON.parse(cached);
        return speciesArray.find(species => species.key === character.species) ?? null;
    } catch (error) {
        console.error('Invalid species cache:', error);
        return null;
    }
}