import { useCharacterStore } from '@/stores/characterStore';

function ImportCharacterButton() {
    const importCharacter = useCharacterStore((state) => state.importCharacter);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const json = event.target?.result;
            if (typeof json === 'string') {
                importCharacter(json);
            }
        };
        reader.readAsText(file);
    };

    return (
        <label className="cursor-pointer text-blue-600 underline">
            Import Character
            <input type="file" accept="application/json" onChange={handleFileChange} className="hidden" />
        </label>
    );
}
