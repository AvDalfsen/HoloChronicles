import { Character } from '@/types/character';
import { Species } from '@/types/species';
import { CharacterState } from '@/stores/characterStore';
import { deriveStatsFromCharacteristics } from '@/lib/derivedStatsFunctions/statsDerivedFromCharacteristics'
import { deriveStatsFromSpecies } from '@/lib/derivedStatsFunctions/statsDerivedFromSpecies'
import { SPECIES_CACHE_KEY } from '@/pages/character/species';

export function applyDerivedStats(state: CharacterState, changes: Partial<Character>, changedBaseStat: String, character: Character): Character {
    const selectedSpecies = getSelectedSpeciesFromCache(character)

    if (!selectedSpecies) {
        console.error('No Species found in cache with key from Character.');
        return character;
    }

    if (changedBaseStat === 'species') {
        character = deriveStatsFromSpecies(state, character, selectedSpecies)
    }
    else if (changedBaseStat === 'characteristics') {
        character = deriveStatsFromCharacteristics(state, changes, character, selectedSpecies)
    }

    return character;
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