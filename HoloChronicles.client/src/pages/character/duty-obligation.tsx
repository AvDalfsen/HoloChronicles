import { Characteristic } from '@/types/characteristic';
import { useCharacterStore } from '@/stores/characterStore';
import {
    useCachedData,
    CHARACTERISTICS_API, CHARACTERISTICS_CACHE_KEY,
} from '@/pages/utils/fetcher';

export default function DutyObligation() {
    const { character, updateCharacter } = useCharacterStore();

    const { data: characteristics, loading: loadingChars, error: errorChars } =
        useCachedData<Characteristic[]>(CHARACTERISTICS_API, CHARACTERISTICS_CACHE_KEY);

    if (loadingChars) {
        return <p>Loading…</p>;
    }

    if (errorChars) {
        return (
            <p className="text-red-500">
                {errorChars}
            </p>
        );
    }

    if (!characteristics) {
        return <p className="text-red-500">Data missing.</p>;
    }

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-3xl font-bold">DutyObligation</h1>
        </div>
    );
}