import type { Character } from '@/types/character';
import type { Career } from '@/types/career';
import type { Specialization } from '@/types/specialization';

/** Version-0 saves reserve slot zero for the free starting specialization.
 * An empty slot must not count as an owned specialization. */
export function getStartingSpecializationKey(character: Character): string | null {
    return character.specializations[0] || null;
}

export function getOwnedSpecializationKeys(character: Character): string[] {
    return character.specializations.filter(Boolean);
}

export function replaceStartingSpecialization(character: Character, key: string | null): string[] {
    const additional = character.specializations.slice(1).filter(Boolean);
    return key || additional.length ? [key ?? '', ...additional] : [];
}

export function getSpecializationPurchaseCost(character: Character, specialization: Specialization, career?: Career): number {
    return (getOwnedSpecializationKeys(character).length + 1) * 10
        + (career?.specializations.includes(specialization.key) || specialization.universal ? 0 : 10);
}

export function getSpecializationGroups(character: Character, specializations: readonly Specialization[], career?: Career) {
    const startingKey = getStartingSpecializationKey(character);
    const owned = new Set(getOwnedSpecializationKeys(character));
    return [
        { label: 'Starting Specialization', specs: specializations.filter(spec => spec.key === startingKey) },
        { label: 'Purchased Specializations', specs: specializations.filter(spec => owned.has(spec.key) && spec.key !== startingKey) },
        { label: 'Career Specializations', specs: specializations.filter(spec => career?.specializations.includes(spec.key) && !owned.has(spec.key)) },
        { label: 'Universal Specializations', specs: specializations.filter(spec => spec.universal && !career?.specializations.includes(spec.key) && !owned.has(spec.key)) },
        { label: 'Non-Career Specializations', specs: specializations.filter(spec => !spec.universal && !career?.specializations.includes(spec.key) && !owned.has(spec.key)) },
    ];
}
