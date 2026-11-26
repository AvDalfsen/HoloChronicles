import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import type { Skill } from '@/types/skill';
import type { Career } from '@/types/career';
import type { Specialization } from '@/types/specialization';
import * as diceIcons from '@/components/ui/diceIcons';
import { useCharacterStore } from '@/stores/characterStore';
import { getSkillDicePool, getSkillTotalRanks, planSkillPurchaseChange } from '@/domain/character/skills';
import {
    useCachedData,
    SKILLS_API_KEY, SKILLS_CACHE_KEY,
    CAREERS_API_KEY, CAREERS_CACHE_KEY,
    SPECIALIZATIONS_API_KEY, SPECIALIZATIONS_CACHE_KEY,
} from '@/pages/utils/fetcher';

export default function Skills() {
    const character = useCharacterStore(state => state.character);
    const adjustSkillPurchase = useCharacterStore(state => state.adjustSkillPurchase);
    const [actionError, setActionError] = useState<string | null>(null);
    const skills = useCachedData<Skill[]>(SKILLS_API_KEY, SKILLS_CACHE_KEY);
    const careers = useCachedData<Career[]>(CAREERS_API_KEY, CAREERS_CACHE_KEY);
    const specializations = useCachedData<Specialization[]>(SPECIALIZATIONS_API_KEY, SPECIALIZATIONS_CACHE_KEY);

    if (skills.loading || careers.loading || specializations.loading) return <p>Loading…</p>;
    if (skills.error || !skills.data) {
        return <p role="alert" className="text-destructive">{skills.error || 'Skill definitions are missing. No edits have been applied.'}</p>;
    }

    const definitions = {
        skills: skills.data,
        careers: careers.data ?? [],
        specializations: specializations.data ?? [],
    };
    const changePurchase = (key: string, delta: 1 | -1) => {
        const result = adjustSkillPurchase(key, delta, definitions);
        setActionError(result.ok ? null : result.message);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold">Skills</h1>
            <p className="text-muted-foreground">Buy trained ranks with XP. Undo returns the recorded purchase cost.</p>
            {(careers.error || specializations.error) && (
                <p role="alert" className="text-destructive">{careers.error || specializations.error}</p>
            )}
            {actionError && <p role="alert" className="text-destructive">{actionError}</p>}
            <table className="table table-striped" aria-label="Skills">
                <thead>
                    <tr><th>Name</th><th>Training</th><th>Dice pool</th></tr>
                </thead>
                <tbody>
                    {skills.data.map(skill => {
                        const increase = planSkillPurchaseChange(character, { key: skill.key, delta: 1 }, definitions);
                        const decrease = planSkillPurchaseChange(character, { key: skill.key, delta: -1 }, definitions);
                        const pool = getSkillDicePool(character, skill);
                        const saved = character.skills.find(item => item.key === skill.key);

                        return (
                            <tr key={skill.key}>
                                <th scope="row">{skill.name}</th>
                                <td>
                                    <div className="flex items-center space-x-4 mt-4">
                                        <Button
                                            size="icon"
                                            aria-label={'Undo ' + skill.name + ' purchase'}
                                            title={decrease.ok ? 'Refund ' + -decrease.xpChange + ' XP' : decrease.message}
                                            disabled={!decrease.ok}
                                            onClick={() => changePurchase(skill.key, -1)}
                                            variant="outline"
                                        ><Minus /></Button>
                                        <span aria-label={skill.name + ' total ranks'}>{getSkillTotalRanks(saved)}</span>
                                        <Button
                                            size="icon"
                                            aria-label={'Increase ' + skill.name}
                                            title={increase.ok ? 'Costs ' + increase.xpChange + ' XP' : increase.message}
                                            disabled={!increase.ok}
                                            onClick={() => changePurchase(skill.key, 1)}
                                            variant="outline"
                                        ><Plus /></Button>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {increase.ok ? 'Next increase: ' + increase.xpChange + ' XP' : increase.message}
                                    </p>
                                    {!decrease.ok && decrease.code !== 'no-purchase' && (
                                        <p className="text-sm text-muted-foreground mt-2">{decrease.message}</p>
                                    )}
                                </td>
                                <td>
                                    {pool.ok ? (
                                        <span
                                            className="flex"
                                            role="img"
                                            aria-label={`${skill.name} dice pool: ${pool.proficiency} proficiency, ${pool.ability} ability`}
                                        >
                                            {Array.from({ length: pool.proficiency }, (_, index) => <diceIcons.proficiencyIcon key={'p' + index} />)}
                                            {Array.from({ length: pool.ability }, (_, index) => <diceIcons.abilityIcon key={'a' + index} />)}
                                        </span>
                                    ) : <p role="alert">{pool.message}</p>}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
