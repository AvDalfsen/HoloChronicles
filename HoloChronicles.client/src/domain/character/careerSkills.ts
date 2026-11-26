import type { Character } from '@/types/character';
import type { Career } from '@/types/career';
import type { Specialization } from '@/types/specialization';
import { getOwnedSpecializationKeys } from './specializationSelections';

export function resolveCareerSkillKeys(
    character: Character,
    definitions: { careers: readonly Career[]; specializations: readonly Specialization[] },
) {
    const career = definitions.careers.find(item => item.key === character.career);
    if (character.career && !career) {
        return { ok: false as const, message: 'The selected career definition is missing. Restore it before changing character choices.' };
    }
    const keys = new Set(career?.careerSkills ?? []);
    for (const key of getOwnedSpecializationKeys(character)) {
        const specialization = definitions.specializations.find(item => item.key === key);
        if (!specialization) {
            return { ok: false as const, message: 'A selected specialization definition is missing. Restore it before changing character choices.' };
        }
        specialization.careerSkills.forEach(skill => keys.add(skill));
    }
    return { ok: true as const, keys };
}
