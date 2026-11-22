import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import type { Characteristic } from '@/types/characteristic';
import type { CharacteristicKey } from '@/types/character';
import type { Species } from '@/types/species';
import { useCharacterStore } from '@/stores/characterStore';
import { planCharacteristicChange } from '@/domain/character/characteristics';
import { deriveCharacteristicStats, getCharacteristicKey } from '@/domain/character/derivedStats';
import {
    useCachedData,
    CHARACTERISTICS_API, CHARACTERISTICS_CACHE_KEY,
    SPECIES_API_KEY, SPECIES_CACHE_KEY,
} from '@/pages/utils/fetcher';

export default function Characteristics() {
    const character = useCharacterStore(state => state.character);
    const adjustCharacteristic = useCharacterStore(state => state.adjustCharacteristic);
    const [actionError, setActionError] = useState<string | null>(null);
    const definitions = useCachedData<Characteristic[]>(CHARACTERISTICS_API, CHARACTERISTICS_CACHE_KEY);
    const speciesData = useCachedData<Species[]>(SPECIES_API_KEY, SPECIES_CACHE_KEY);

    if (definitions.loading || speciesData.loading) return <p>Loading…</p>;
    if (definitions.error || speciesData.error) {
        return <p role="alert" className="text-destructive">{definitions.error || speciesData.error}</p>;
    }
    const species = speciesData.data?.find(item => item.key === character.species);
    if (!definitions.data || !species) {
        return <p role="alert">The characteristic or selected species definitions are missing. No edits have been applied.</p>;
    }

    const view = deriveCharacteristicStats(character, species);
    const adjustValue = (key: CharacteristicKey, delta: 1 | -1) => {
        const result = adjustCharacteristic(key, delta, species);
        setActionError(result.ok ? null : result.message);
    };

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-3xl font-bold">Characteristics</h1>
            <p className="text-muted-foreground mb-6">Spend starting XP to increase characteristics. Undo returns the recorded purchase cost.</p>
            {actionError && <p role="alert" className="text-destructive">{actionError}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {definitions.data.map(definition => {
                    const key = getCharacteristicKey(definition.key);
                    if (!key) {
                        return <p role="alert" key={definition.key ?? definition.name}>Unknown characteristic: {definition.key ?? definition.name}</p>;
                    }
                    const increase = planCharacteristicChange(character, { key, delta: 1 }, species);
                    const decrease = planCharacteristicChange(character, { key, delta: -1 }, species);

                    return (
                        <div key={definition.key} className="bg-card text-card-foreground shadow-md rounded-2xl p-4 flex flex-col items-center text-center border">
                            <h2 className="text-xl font-semibold mb-2">{definition.name}</h2>
                            {definition.abbrev && <p className="text-muted-foreground text-sm mb-2">({definition.abbrev})</p>}
                            <div className="flex items-center space-x-4 mt-4">
                                <Button
                                    size="icon"
                                    aria-label={'Undo ' + definition.name + ' purchase'}
                                    title={decrease.ok ? 'Refund ' + -decrease.xpChange + ' XP' : decrease.message}
                                    disabled={!decrease.ok}
                                    onClick={() => adjustValue(key, -1)}
                                    variant="outline"
                                >
                                    <Minus />
                                </Button>
                                <span className="text-2xl w-10 text-center" aria-label={definition.name + ' total'}>{view.characteristics[key].total}</span>
                                <Button
                                    size="icon"
                                    aria-label={'Increase ' + definition.name}
                                    title={increase.ok ? 'Costs ' + increase.xpChange + ' XP' : increase.message}
                                    disabled={!increase.ok}
                                    onClick={() => adjustValue(key, 1)}
                                    variant="outline"
                                >
                                    <Plus />
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                {increase.ok ? 'Next increase: ' + increase.xpChange + ' XP' : increase.message}
                            </p>
                            {!decrease.ok && decrease.code === 'unknown-purchase-cost' && (
                                <p className="text-sm text-muted-foreground mt-2">{decrease.message}</p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
