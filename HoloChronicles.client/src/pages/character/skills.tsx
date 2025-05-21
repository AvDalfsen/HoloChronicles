import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { Skill } from '@/types/skill';
import * as diceIcons from '@/components/ui/diceIcons';
import { JSX } from 'react/jsx-runtime';
import { useCharacterStore } from '@/stores/characterStore';
import { CHAR_ORDER } from '@/pages/character/species';
import {
    useCachedData,
    SKILLS_API_KEY, SKILLS_CACHE_KEY
} from '@/pages/utils/fetcher'

export default function Skills() {
    const { character, updateCharacter } = useCharacterStore();

    const { data: skills, loading: loadingSkills, error: errorSkills } =
        useCachedData<Skill[]>(SKILLS_API_KEY, SKILLS_CACHE_KEY);

    if (loadingSkills) {
        return <p>Loading…</p>;
    }

    if ( errorSkills) {
        return (
            <p className="text-red-500">
                {errorSkills}
            </p>
        );
    }

    if (!skills) {
        return <p className="text-red-500">Data missing.</p>;
    }

    function deriveAndDisplaySkillIcons(skillKey: string, skillCharKey: string): JSX.Element {
        let proficiencyCount = 0;
        let abilityCount = 0;

        const skill = character.skills.find(s => s.key === skillKey);

        const currentPurchasedRanks = skill?.rank.purchasedRanks ?? 0;
        const currentCareerRanks = skill?.rank.careerRanks ?? 0;
        const currentSpecializationRanks = skill?.rank.specializationRanks ?? 0;
        const currentCyberRanks = skill?.rank.cyberRanks ?? 0;
        const currentSpeciesRanks = skill?.rank.speciesRanks ?? 0;

        const currentSkillRankTotal = currentCareerRanks + currentSpecializationRanks + currentCyberRanks + currentPurchasedRanks + currentSpeciesRanks;

        let characteristicTotal = 0;

        const shortToLongCharMap = Object.fromEntries(
            CHAR_ORDER.map(([long, short]) => [short.toUpperCase(), long])
        );

        const characteristicKey = shortToLongCharMap[skillCharKey];
              characteristicTotal = characteristicKey
            ? character.characteristics[characteristicKey].total
            : 0;
        
        proficiencyCount = Math.min(characteristicTotal, currentSkillRankTotal);
        abilityCount = Math.max(characteristicTotal, currentSkillRankTotal) - proficiencyCount;

        return (
            <span style={{ display: 'flex' }}>
                {Array.from({ length: proficiencyCount }, (_, index) => (
                    <diceIcons.proficiencyIcon key={index} />
                ))}
                {Array.from({ length: abilityCount }, (_, index) => (
                    <diceIcons.abilityIcon key={index} />
                ))}
            </span>
        );
    }

    const adjustValue = (skillKey: string, delta: number) => {
        const skill = character.skills.find(s => s.key === skillKey);

        const currentPurchasedRanks = skill?.rank.purchasedRanks ?? 0;
        const currentCareerRanks = skill?.rank.careerRanks ?? 0;
        const currentSpecializationRanks = skill?.rank.specializationRanks ?? 0;
        const currentCyberRanks = skill?.rank.cyberRanks ?? 0;
        const currentSpeciesRanks = skill?.rank.speciesRanks ?? 0;

        const currentSkillRankTotal = currentCareerRanks + currentSpecializationRanks + currentCyberRanks + currentPurchasedRanks + currentSpeciesRanks;

        //Do nothing if user tries to go past the minimum or maximum number of trained ranks
        if ((currentSkillRankTotal === 0 && delta === -1) || (currentSkillRankTotal === 5 && delta === 1)) return;

        const isCareer = skill?.isCareer;
        const currentUsedXP = character.experience.usedExperience;
        const newBought = Math.max(0, currentSkillRankTotal + delta);

        let xpChange = 0;

        if (Math.sign(delta) == 1) {
            xpChange = ((currentSkillRankTotal + delta) * 5);
            if (!isCareer) {
                xpChange += 5;
            }
        }
        else {
            xpChange = ((currentSkillRankTotal) * -5);
            if (!isCareer) {
                xpChange -= 5;
            }
        }

        const xp = currentUsedXP + xpChange;

        console.log('XP change:', xpChange, 'XP:', xp, 'previously used total:', character.experience.usedExperience, 'new used total:', (character.experience.usedExperience + xpChange));

        const updatedSkills = character.skills.map(s => {
            if (s.key === skillKey) {
                return {
                    ...s,
                    rank: {
                        ...s.rank,
                        purchasedRanks: newBought,
                    },
                };
            }
            return s;
        });

        // If the skill wasn't found, add it
        if (!skill) {
            updatedSkills.push({
                key: skillKey,
                rank: {
                    purchasedRanks: newBought,
                },
            });
        }

        updateCharacter({
            ...character,
            experience: {
                ...character.experience,
                usedExperience: currentUsedXP + xpChange,
            },
            skills: updatedSkills,
        });
    };

    return (
        <div>
            <table className="table table-striped" aria-labelledby="tableLabel">
                <thead>
                    <tr>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    {skills.map(skill => (
                        <tr key={skill.name}>
                            <td>{skill.name}</td>
                            <td>
                                <div className="flex items-center space-x-4 mt-4">
                                    <Button
                                        size="icon"
                                        onClick={() => adjustValue(skill.key, -1)}
                                        variant="outline"
                                    >
                                        <Minus />
                                    </Button>
                                    <Button
                                        size="icon"
                                        onClick={() => adjustValue(skill.key, 1)}
                                        variant="outline"
                                    >
                                        <Plus />
                                    </Button>
                                </div>
                            </td>
                            <td>
                                {deriveAndDisplaySkillIcons(skill.key, skill.charKey)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}