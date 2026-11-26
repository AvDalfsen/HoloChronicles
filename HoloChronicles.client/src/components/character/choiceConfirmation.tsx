import type { CharacterChoiceAction } from '@/features/character/useCharacterChoiceAction';

export function CharacterChoiceFeedback({ action }: { action: CharacterChoiceAction }) {
    const pending = action.pending;
    const effects = pending?.plan.consequences;
    const skillName = (key: string) => pending?.definitions.skills.find(skill => skill.key === key)?.name ?? key;
    const specName = (key: string) => pending?.definitions.specializations.find(spec => spec.key === key)?.name ?? key;
    const choice = pending?.choice;
    const title = choice?.type === 'career'
        ? `Change career to ${pending?.definitions.careers.find(career => career.key === choice.key)?.name ?? choice.key}?`
        : choice?.type === 'starting-specialization' ? 'Change starting specialization?' : 'Change free skill choice?';

    return <>
        {action.error && <p role="alert" className="text-destructive">{action.error}</p>}
        {pending && effects && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50" onClick={action.cancel}>
                <div role="dialog" aria-modal="true" aria-label={title}
                    className="bg-background p-6 rounded shadow-md max-w-lg w-full space-y-4"
                    onClick={event => event.stopPropagation()}>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p>This change will:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        {choice?.type === 'free-skill' && choice.selected && <li>Add the free rank in {skillName(choice.skillKey)}.</li>}
                        {effects.specializationsRemoved.map(key => <li key={key}>Remove the starting specialization {specName(key)}.</li>)}
                        {effects.freeRanksRemoved.map(item => <li key={item.source + item.skillKey}>
                            Remove the free {item.source === 'career' ? 'career' : 'starting-specialization'} rank in {skillName(item.skillKey)}.
                        </li>)}
                        {effects.skillsRefunded.map(item => <li key={item.skillKey}>
                            Undo {item.ranks} purchased {skillName(item.skillKey)} {item.ranks === 1 ? 'rank' : 'ranks'} and refund {item.xp} XP.
                        </li>)}
                        {effects.talentsRefunded.length > 0 && <li>Remove {effects.talentsRefunded.length} talent {effects.talentsRefunded.length === 1 ? 'purchase' : 'purchases'} and refund {effects.talentsRefunded.reduce((sum, item) => sum + item.xp, 0)} XP.</li>}
                    </ul>
                    <p>Total XP refund: {-pending.plan.xpChange}.</p>
                    <div className="flex justify-end gap-4">
                        <button className="btn btn-outline" onClick={action.cancel}>Cancel</button>
                        <button className="btn" onClick={action.confirm}>Apply change</button>
                    </div>
                </div>
            </div>
        )}
    </>;
}
