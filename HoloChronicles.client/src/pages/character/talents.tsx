import { useCharacterStore } from '@/stores/characterStore';
import { Talent } from '@/types/talent';
import { Specialization } from '@/types/specialization';
import TalentSheet from '@/pages/utils/talentSheet';
import {
    useCachedData,
    TALENTS_API_KEY, TALENTS_CACHE_KEY,
    SPECIALIZATIONS_API_KEY, SPECIALIZATIONS_CACHE_KEY
} from '@/pages/utils/fetcher'

export default function Talents() {
    const { character, updateCharacter } = useCharacterStore();

    const { data: talents, loading: loadingTalents, error: errorTalents } =
        useCachedData<Talent[]>(TALENTS_API_KEY, TALENTS_CACHE_KEY);

    const { data: specializations, loading: loadingSpecs, error: errorSpecs } =
        useCachedData<Specialization[]>(SPECIALIZATIONS_API_KEY, SPECIALIZATIONS_CACHE_KEY);

    if (loadingSpecs || loadingTalents) {
        return <p>Loading…</p>;
    }

    if (errorSpecs || errorTalents) {
        return (
            <p className="text-red-500">
                {errorSpecs || errorTalents}
            </p>
        );
    }

    if (!specializations || !talents) {
        return <p className="text-red-500">Data missing.</p>;
    }

    function RenderTalentTree(specializations: Specialization[]) {
        const spec = specializations.find(s => s.key === 'CHARMER');

        return (
            <table>
                <tbody>
                    {spec ? (
                        <tr>
                            <td colSpan={100}>
                                <TalentSheet specialization={spec} />
                            </td>
                        </tr>
                    ) : (
                        <tr>
                            <td>Specialization not found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        );
    }

    return (
        <div>
            <table className="table table-striped" aria-labelledby="tableLabel">
                <thead>
                    <tr>
                        <th>Name</th>
                    </tr>
                </thead>
                {RenderTalentTree(specializations)}
            </table>
        </div>
    );
}