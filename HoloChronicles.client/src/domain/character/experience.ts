import type { Character } from '@/types/character';

export function getExperienceSummary(character: Character) {
    const { experienceRanks, usedExperience } = character.experience;
    const total = experienceRanks.speciesRanks
        + experienceRanks.startingRanks
        + experienceRanks.purchasedRanks;

    return { total, spent: usedExperience, available: total - usedExperience };
}
