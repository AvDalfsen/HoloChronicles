import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Character, CharacteristicKey } from '@/types/character';
import type { Species } from '@/types/species';
import { createDefaultCharacter } from '@/types/defaultCharacter';
import { applyDerivedStats } from '@/lib/derivedStats';
import { planCharacteristicPurchaseChange, type CharacteristicPurchaseResult } from '@/domain/character/characteristics';
import { getExperienceSummary } from '@/domain/character/experience';
import { planSkillPurchaseChange, type SkillPurchaseResult, type SkillDefinitions } from '@/domain/character/skills';

export interface CharacterState {
    character: Character;
    updateCharacter: (updates: Partial<Character>) => void;
    adjustCharacteristicPurchase: (key: CharacteristicKey, delta: 1 | -1, species: Species) => CharacteristicPurchaseResult;
    adjustSkillPurchase: (key: string, delta: 1 | -1, definitions: SkillDefinitions) => SkillPurchaseResult;
    resetCharacter: (name?: string) => void;
    saveToFile: () => void;
    importCharacter: (json: string) => void;
}

export const useCharacterStore = create<CharacterState>()(
    persist(
        (set, get) => ({
            character: createDefaultCharacter(),
            updateCharacter: (changes) =>
                set((state) => {
                    let updatedCharacter = { ...state.character, ...changes };

                    updatedCharacter = checkUpdates(state, changes, updatedCharacter, state.character);
                    updatedCharacter.xp = getExperienceSummary(updatedCharacter).available;

                    return { character: updatedCharacter };
                }),
            adjustCharacteristicPurchase: (key, delta, species) => {
                // Read at dispatch time, so consecutive clicks use the latest state.
                const result = planCharacteristicPurchaseChange(get().character, { key, delta }, species);
                if (result.ok) set({ character: result.character });
                return result;
            },
            adjustSkillPurchase: (key, delta, definitions) => {
                const result = planSkillPurchaseChange(get().character, { key, delta }, definitions);
                if (result.ok) set({ character: result.character });
                return result;
            },
            resetCharacter: (name) =>
                set(() => ({
                    character: createDefaultCharacter(name),
                })),
            saveToFile: () => {
                const character = get().character;
                const json = JSON.stringify(character, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${character.name || 'character'}.json`;
                a.click();
                URL.revokeObjectURL(url);
            },
            importCharacter: (json: string) => {
                try {
                    const parsed = JSON.parse(json) as Character;
                    set({ character: parsed });
                } catch (error) {
                    console.error("Invalid character file", error);
                }
            },
        }),
        {
            name: 'swrpg-character',
            partialize: (state) => ({ character: state.character }),
        }
    )
);

function checkUpdates(state: CharacterState, changes: Partial<Character>, updatedCharacter: Character, originalCharacter: Character): Character {
    if ('species' in changes && changes.species) {
        updatedCharacter = applyDerivedStats(state, changes, 'species', updatedCharacter, originalCharacter);
    }
    if ('characteristics' in changes && changes.characteristics) {
        updatedCharacter = applyDerivedStats(state, changes, 'characteristics', updatedCharacter, originalCharacter);
    }
    if ('talents' in changes && changes.talents) {
        updatedCharacter = applyDerivedStats(state, changes, 'talents', updatedCharacter, originalCharacter);
    }

    return updatedCharacter;
}
