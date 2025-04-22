import { useCharacterStore, defaultCharacter } from '@/stores/characterStore';
import isEqual from 'fast-deep-equal';

function ImportCharacterButton() {
    const importCharacter = useCharacterStore((state) => state.importCharacter);
    const currentCharacter = useCharacterStore((state) => state.character);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const json = event.target?.result;
            if (typeof json !== 'string') return;

            const confirmImport = isEqual(currentCharacter, defaultCharacter)
                || window.confirm('This will overwrite your current character. Proceed?');

            if (confirmImport) {
                importCharacter(json);
            }
        };
        reader.readAsText(file);

        // Reset the input so the same file can be selected again later
        e.target.value = '';
    };

    return (
        <label className="cursor-pointer text-blue-600 underline">
            Import Character
            <input type="file" accept="application/json" onChange={handleFileChange} className="hidden" />
        </label>
    );
}
