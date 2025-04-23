import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Character } from '@/types/character';
import { defaultCharacter } from '@/types/defaultCharacter';

interface CharacterState {
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
            updateCharacter: (updates) =>
                set((state) => ({
                    character: { ...state.character, ...updates },
                })),
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
