import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Character } from '@/types/character';
import { defaultCharacter } from '@/types/defaultCharacter';
import { applyDerivedStats } from '@/lib/derivedStats';

export interface CharacterState {
    [x: string]: any;
    character: Character;
    updateCharacter: (updates: Partial<Character>) => void;
    resetCharacter: () => void;
    saveToFile: () => void;
}

export const useCharacterStore = create<CharacterState>()(
    persist(
        (set, get) => ({
            character: defaultCharacter,
            updateCharacter: (changes) =>
                set((state) => {
                    let updatedCharacter = { ...state.character, ...changes };

                    updatedCharacter = checkUpdates(state, changes, updatedCharacter);

                    return { character: updatedCharacter };
                }),
            resetCharacter: () =>
                set(() => ({
                    character: defaultCharacter,
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

function checkUpdates(state: CharacterState, changes: Partial<Character>, updatedCharacter: Character): Character {
    console.log(changes);

    if ('species' in changes && changes.species) {
        updatedCharacter = applyDerivedStats(state, changes, 'species', updatedCharacter);
    }
    if ('characteristics' in changes && changes.characteristics) {
        updatedCharacter = applyDerivedStats(state, changes, 'characteristics', updatedCharacter);
    }
    if ('talents' in changes && changes.talents) {
        console.log('Applying derived stats for talents');
        console.log(JSON.stringify(changes))
        //updatedCharacter = applyDerivedStats(state, changes, 'talents', updatedCharacter);
    }

    return updatedCharacter;
}