import { useState } from 'react';
import type { Character } from '@/types/character';
import { useCharacterStore } from '@/stores/characterStore';
import { planCharacterChoice, type CharacterChoice, type CharacterChoiceResult } from '@/domain/character/careerChoices';
import type { SkillDefinitions } from '@/domain/character/skills';

interface PendingChoice {
    choice: CharacterChoice;
    before: Character;
    definitions: SkillDefinitions;
    plan: Extract<CharacterChoiceResult, { ok: true }>;
}

/** Temporary preview state belongs to the editor, never to the saved character. */
export function useCharacterChoiceAction(definitions: SkillDefinitions) {
    const [pending, setPending] = useState<PendingChoice | null>(null);
    const [error, setError] = useState<string | null>(null);

    const commit = (choice: CharacterChoice, before: Character) => {
        const store = useCharacterStore.getState();
        const result = choice.type === 'career' ? store.changeCareer(choice.key, definitions, before)
            : choice.type === 'starting-specialization' ? store.setStartingSpecialization(choice.key, definitions, before)
                : store.setFreeSkillChoice(choice, definitions, before);
        setPending(null);
        setError(result.ok ? null : result.message);
    };
    const request = (choice: CharacterChoice) => {
        const before = useCharacterStore.getState().character;
        const plan = planCharacterChoice(before, choice, definitions);
        setError(null);
        if (!plan.ok) {
            setPending(null);
            setError(plan.message);
        } else if (plan.requiresConfirmation) {
            setPending({ choice, before, definitions, plan });
        } else commit(choice, before);
    };
    const confirm = () => {
        if (!pending) return;
        if (pending.definitions.skills !== definitions.skills || pending.definitions.careers !== definitions.careers
            || pending.definitions.specializations !== definitions.specializations) {
            setPending(null);
            setError('The definitions changed while this confirmation was open. Review the change again.');
            return;
        }
        commit(pending.choice, pending.before);
    };
    return { request, pending, error, confirm, cancel: () => setPending(null) };
}

export type CharacterChoiceAction = ReturnType<typeof useCharacterChoiceAction>;
