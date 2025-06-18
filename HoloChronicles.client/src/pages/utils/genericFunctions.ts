import { Character } from '@/types/character';
import { Career } from '@/types/career';
import { Specialization } from '@/types/specialization';

export function calculateTotalSkillLevel(skillKey: string, character: Character): number {
    const skill = character.skills.find(s => s.key === skillKey);

    const currentPurchasedRanks = skill?.rank.purchasedRanks ?? 0;
    const currentCareerRanks = skill?.rank.careerRanks ?? 0;
    const currentSpecializationRanks = skill?.rank.specializationRanks ?? 0;
    const currentCyberRanks = skill?.rank.cyberRanks ?? 0;
    const currentSpeciesRanks = skill?.rank.speciesRanks ?? 0;

    const currentSkillRankTotal = currentCareerRanks + currentSpecializationRanks + currentCyberRanks + currentPurchasedRanks + currentSpeciesRanks;

    return currentSkillRankTotal;
}

export function calculateSkillXPRefund(currentCareer: Career, character: Character, specializations: Specialization[]): number {
    let skillXPBalance = 0;

    for (const skill of character.skills) {
        const numberOfPurchasedRanks = skill.rank.purchasedRanks ?? 0;
        if (numberOfPurchasedRanks === 0) continue;

        if (numberOfPurchasedRanks > 0) {
            const isCareerSkill = currentCareer?.careerSkills?.includes(skill.key) ?? false;
            let isSpecializationCareerSkill = false;

            // Check if skill is contained in the purchased specializations
            for (const spec of character.specializations) {
                const specialization = specializations.find(s => s.key === spec);

                isSpecializationCareerSkill = specialization?.careerSkills.includes(skill.key) ?? false;

                if (isSpecializationCareerSkill) continue;
            }

            const cost = isCareerSkill || isSpecializationCareerSkill ? 5 : 10; // Career skills cost 5 XP, non-career cost 10 XP

            const currentSkillRankTotal = calculateTotalSkillLevel(skill.key, character);

            const xpForSkill = cost * numberOfPurchasedRanks * (2 * currentSkillRankTotal - numberOfPurchasedRanks + 1) / 2;

            console.log("cost:", cost, "skillranktotal:", currentSkillRankTotal, "xpforskill:", xpForSkill);

            skillXPBalance -= xpForSkill; // Refund XP for the total rank; purchased ranks will come after species, career, and specialization ranks.
                                          // Note: this doesn't take into account that the cybernetics may be purchased after skill ranks had been purchased.
                                          // As a result, the user may end up getting too much XP back. 
                                          // But someone switching starting Spec after getting cybernetics is a niche case I'm just going to ignore.
                                          // Solution would be to keep track of the order of skill increases, but fuck that noise.
        }
    }

    return skillXPBalance;
}