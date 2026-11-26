import type { Character, CharacteristicKey } from '@/types/character';
import type { Species } from '@/types/species';
import { CHARACTERISTIC_KEYS, deriveCharacteristicStats } from './derivedStats';
import { getExperienceSummary } from './experience';

/** Buy one paid rank (+1), or undo the latest known purchase (-1). */
export interface CharacteristicPurchaseChange {
    key: CharacteristicKey;
    delta: 1 | -1;
}

type RejectionCode = 'invalid-character' | 'species-mismatch' | 'rank-limit'
    | 'insufficient-xp' | 'no-purchase' | 'unknown-purchase-cost';

export type CharacteristicPurchaseResult =
    | { ok: true; character: Character; xpChange: number }
    | { ok: false; code: RejectionCode; message: string };

/** Plan one creation purchase/undo. This function never mutates its inputs. */
export function planCharacteristicPurchaseChange(
    character: Character,
    change: CharacteristicPurchaseChange,
    species: Species,
): CharacteristicPurchaseResult {
    const reject = (code: RejectionCode, message: string): CharacteristicPurchaseResult =>
        ({ ok: false, code, message });

    if (species.key !== character.species) {
        return reject('species-mismatch', 'The species definition does not match this character.');
    }

    const value = character.characteristics[change.key];
    const costs = value?.purchaseCosts ?? [];
    const xp = getExperienceSummary(character);
    if (!CHARACTERISTIC_KEYS.includes(change.key) || !value
        || (change.delta !== 1 && change.delta !== -1)
        || ![value.species, value.bought, value.gear, value.cybernetics,
            xp.total, xp.spent].every(Number.isInteger)
        || [value.species, value.bought, xp.total, xp.spent].some(n => n < 0)
        || !Array.isArray(costs) || costs.length > value.bought
        || !costs.every(cost => Number.isInteger(cost) && cost > 0)) {
        return reject('invalid-character', 'This character has inconsistent ranks or XP and needs correction before editing.');
    }

    // Gear/cybernetic bonuses affect the displayed total, not creation prices.
    const trainingRank = value.species + value.bought;
    let xpChange: number;
    let purchaseCosts: number[];
    if (change.delta === 1) {
        if (trainingRank >= 5) {
            return reject('rank-limit', 'Direct XP purchases cannot raise a characteristic above 5.');
        }
        xpChange = (trainingRank + 1) * 10;
        if (xp.available < xpChange) {
            return reject('insufficient-xp', `This increase costs ${xpChange} XP; ${xp.available} XP is available.`);
        }
        purchaseCosts = [...costs, xpChange];
    } else {
        if (value.bought === 0) {
            return reject('no-purchase', 'There is no purchased rank to undo.');
        }
        const paid = costs[costs.length - 1];
        if (paid === undefined) {
            return reject('unknown-purchase-cost', 'This saved rank has no recorded XP cost and cannot be refunded automatically.');
        }
        if (xp.spent < paid) {
            return reject('invalid-character', 'The recorded purchase exceeds spent XP; correct the character before refunding it.');
        }
        xpChange = -paid;
        purchaseCosts = costs.slice(0, -1);
    }

    const characteristic = { ...value, bought: value.bought + change.delta };
    if (purchaseCosts.length) characteristic.purchaseCosts = purchaseCosts;
    else delete characteristic.purchaseCosts;

    const updated: Character = {
        ...character,
        characteristics: { ...character.characteristics, [change.key]: characteristic },
        experience: { ...character.experience, usedExperience: xp.spent + xpChange },
    };

    return { ok: true, character: deriveCharacteristicStats(updated, species), xpChange };
}
