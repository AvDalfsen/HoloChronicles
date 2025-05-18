import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCharacterStore } from '../../src/stores/characterStore';
import { defaultCharacter } from '../../src/types/defaultCharacter';

beforeEach(() => {
    useCharacterStore.getState().resetCharacter();
});

describe('characterStore', () => {
    it('should initialize with the default character', () => {
        const character = useCharacterStore.getState().character;
        expect(character).toEqual(defaultCharacter);
    });

    it('should update the character with new values', () => {
        useCharacterStore.getState().updateCharacter({ name: 'Obi-Wan' });
        const character = useCharacterStore.getState().character;
        expect(character.name).toBe('Obi-Wan');
    });

    it('should reset to the default character', () => {
        useCharacterStore.getState().updateCharacter({ name: 'Anakin' });
        useCharacterStore.getState().resetCharacter();
        const character = useCharacterStore.getState().character;
        expect(character).toEqual(defaultCharacter);
    });

    it('should save the character to a file (via download)', () => {
        const mockClick = vi.fn();
        const mockCreateElement = vi.spyOn(document, 'createElement').mockImplementation(() => ({
            click: mockClick,
            href: '',
            download: '',
        } as any));

        const mockCreateObjectURL = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => 'blob:url');
        const mockRevokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => { });

        useCharacterStore.getState().updateCharacter({ name: 'Rey' });
        useCharacterStore.getState().saveToFile();

        expect(mockCreateElement).toHaveBeenCalledWith('a');
        expect(mockClick).toHaveBeenCalled();
        expect(mockCreateObjectURL).toHaveBeenCalled();
        expect(mockRevokeObjectURL).toHaveBeenCalled();

        mockCreateElement.mockRestore();
        mockCreateObjectURL.mockRestore();
        mockRevokeObjectURL.mockRestore();
    });

    it('should import character from valid JSON', () => {
        const imported = JSON.stringify({ ...defaultCharacter, name: 'Ahsoka' });
        useCharacterStore.getState().importCharacter(imported);
        const character = useCharacterStore.getState().character;
        expect(character.name).toBe('Ahsoka');
    });

    it('should not crash on invalid JSON import', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { });
        useCharacterStore.getState().importCharacter('{ invalid json }');
        const character = useCharacterStore.getState().character;
        expect(character).toEqual(defaultCharacter);
        expect(consoleError).toHaveBeenCalled();

        consoleError.mockRestore();
    });
});