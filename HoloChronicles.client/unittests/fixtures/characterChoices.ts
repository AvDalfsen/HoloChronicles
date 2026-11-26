import { skillDefinitions } from './character';
import type { SkillDefinitions } from '@/domain/character/skills';
import { createDefaultCharacter } from '@/types/defaultCharacter';

export function choiceDefinitions(): SkillDefinitions {
    const base = structuredClone(skillDefinitions);
    return { ...base,
        skills: [...base.skills, ...['COOL', 'VIGIL', 'PILOT'].map(key => ({ ...base.skills[0], key, name: key }))],
        careers: [
            { ...base.careers[0], careerSkills: ['ATHL', 'STEALTH', 'COOL', 'VIGIL'], freeRanks: 3 },
            base.careers[1],
            { ...base.careers[0], key: 'SHARED', name: 'Shared career', freeRanks: 0, attributes: { forceRating: 1 } },
        ],
        specializations: [...base.specializations,
            { ...base.specializations[0], key: 'EXTRA', name: 'Additional specialization', universal: true, careerSkills: ['PILOT'] },
        ],
    };
}

export function choiceCharacter() {
    return { ...createDefaultCharacter(), career: 'CAREER', specializations: ['SPEC'] };
}
