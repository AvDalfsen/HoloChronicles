import React from 'react';
import * as dI from '@/components/ui/diceIcons';
import { JSX } from 'react/jsx-runtime';

interface FormattedDescriptionProps {
    description: string;
}

//TODO: Add tooltips to icons.
export function FormattedDescription({ description }: FormattedDescriptionProps) {
    // Map token to icon component
    const iconMap: Record<string, () => JSX.Element> = {
        DI: dI.difficultyIcon,
        AB: dI.abilityIcon,
        PR: dI.proficiencyIcon,
        SE: dI.setbackIcon,
        BO: dI.boostIcon,
        SU: dI.successIcon,
        FA: dI.failureIcon,
        AD: dI.advantageIcon,
        TH: dI.threatIcon,
        TR: dI.triumphIcon,
        DE: dI.despairIcon,
    };

    // Split text into pieces interleaving icons
    const parseInlineTokens = (text: string): React.ReactNode[] => {
        const tokenRegex = /\[([A-Z]{2})\]/g;
        const elements: React.ReactNode[] = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = tokenRegex.exec(text)) !== null) {
            const [full, token] = match;
            if (match.index > lastIndex) {
                elements.push(text.slice(lastIndex, match.index));
            }
            const IconFn = iconMap[token];
            if (IconFn) {
                elements.push(<span key={`icon-${match.index}`}>{IconFn()}</span>);
            } else {
                elements.push(full); // Unknown token, keep as-is
            }
            lastIndex = match.index + full.length;
        }

        if (lastIndex < text.length) {
            elements.push(text.slice(lastIndex));
        }

        return elements;
    };

    const paragraphs = description
        .split(/\[P\]/)
        .map(p => p.trim())
        .filter(p => p.length > 0);

    return (
        <>
            {paragraphs.map((para, pi) => {
                const elements: React.ReactNode[] = [];
                const boldRegex = /\[B\](.+?)\[b\]/g;
                let lastIndex = 0;
                let match: RegExpExecArray | null;

                while ((match = boldRegex.exec(para)) !== null) {
                    if (match.index > lastIndex) {
                        const before = para.slice(lastIndex, match.index);
                        elements.push(...parseInlineTokens(before));
                    }
                    const boldContent = match[1];
                    elements.push(
                        <strong key={`${pi}-b-${match.index}`}>
                            {parseInlineTokens(boldContent)}
                        </strong>
                    );
                    lastIndex = match.index + match[0].length;
                }

                if (lastIndex < para.length) {
                    const rest = para.slice(lastIndex);
                    elements.push(...parseInlineTokens(rest));
                }

                return <p key={pi}>{elements}</p>;
            })}
        </>
    );
}