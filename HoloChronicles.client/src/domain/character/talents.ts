import type { Character, SpecializationTalents } from '@/types/character';
import { getExperienceSummary } from './experience';

/** The displayed price and affordability use the same authoritative XP balance. */
export function getTalentPurchaseQuote(character: Character, row: number) {
    const cost = (row + 1) * 5;
    const { total, spent, available } = getExperienceSummary(character);
    const canAfford = Number.isSafeInteger(row) && row >= 0 && cost > 0
        && [cost, total, spent].every(value => Number.isSafeInteger(value) && value >= 0)
        && available >= cost;
    return { cost, canAfford };
}

/** Count recorded purchases by talent key across every specialization tree. */
export function getTalentPurchaseCounts(talentSheets: readonly SpecializationTalents[]): ReadonlyMap<string, number> {
    const counts = new Map<string, number>();
    for (const sheet of talentSheets) {
        for (const talent of sheet.talents) {
            counts.set(talent.key, (counts.get(talent.key) ?? 0) + 1);
        }
    }
    return counts;
}
