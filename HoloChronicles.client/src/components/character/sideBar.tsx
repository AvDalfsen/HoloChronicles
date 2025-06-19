import { Link } from 'react-router-dom';
import { useCharacterStore } from '@/stores/characterStore';

export default function Sidebar() {
    const character = useCharacterStore(state => state.character);

    const links = [
        {
            label: 'Species',
            to: '/character/build/species',
            enabled: true,
        },
        {
            label: 'Careers',
            to: '/character/build/careers',
            enabled: true,
        },
        {
            label: 'Specializations',
            to: '/character/build/specializations',
            enabled: Boolean(character?.career),
            reason: 'Please choose a career first',
        },
        {
            label: 'Characteristics',
            to: '/character/build/characteristics',
            enabled: (character?.specializations?.length ?? 0) > 0,
            reason: 'Please choose a career and specialization first',
        },
        {
            label: 'Skills',
            to: '/character/build/skills',
            enabled: (character?.specializations?.length ?? 0) > 0,
            reason: 'Please choose a career and specialization first',
        },
        {
            label: 'Talents',
            to: '/character/build/talents',
            enabled: (character?.specializations?.length ?? 0) > 0,
            reason: 'Please choose a career and specialization first',
        },
    ];

    // Shamelessly AI-generated UI stuff
    return (
        <aside className="w-52 bg-sidebar text-sidebar-foreground p-4 shadow-md h-full flex flex-col justify-between">
            <ul className="space-y-4">
                {links.map(link =>
                    link.enabled ? (
                        /* –– enabled: regular <Link> –– */
                        <li key={link.to}>
                            <Link
                                to={link.to}
                                className="block hover:underline hover:text-sidebar-accent-foreground transition"
                            >
                                {link.label}
                            </Link>
                        </li>
                    ) : (
                        /* –– disabled: styled <span> with tooltip –– */
                        <li key={link.to}>
                            <span
                                /* visual */
                                className="block opacity-40 cursor-not-allowed relative group"
                                /* a11y – make it unfocusable & let screen-readers know */
                                tabIndex={-1}
                                aria-disabled="true"
                                /* simple tooltip (fallback) */
                                title={link.reason}
                            >
                                {link.label}
                            </span>
                        </li>
                    )
                )}
            </ul>
            {character && (
                <div className="mt-8 rounded border border-sidebar-accent/30 bg-sidebar/40 p-3 
                        text-xs leading-relaxed space-y-1">
                    <div className="font-semibold text-sm">{character.name}</div>

                    <div>
                        <span className="font-medium">XP&nbsp;</span>
                        {character.xp} &nbsp;
                        <span className="opacity-70">(rem&nbsp;{character.xp - character.experience.usedExperience})</span>
                    </div>

                    <div>
                        <span className="font-medium">Wounds&nbsp;</span>
                        {character.wounds.current}/{character.wounds.threshold}
                    </div>

                    <div>
                        <span className="font-medium">Strain&nbsp;</span>
                        {character.strain.current}/{character.strain.threshold}
                    </div>

                    <div>
                        <span className="font-medium">Soak&nbsp;</span>
                        {character.soak}
                    </div>

                    <div>
                        <span className="font-medium">Defense&nbsp;</span>
                        melee&nbsp;{character.defense.melee}&nbsp;/&nbsp;ranged&nbsp;
                        {character.defense.ranged}
                    </div>
                </div>
            )}
        </aside>
    );
}