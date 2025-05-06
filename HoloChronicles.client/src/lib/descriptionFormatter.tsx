import React from 'react';

interface FormattedDescriptionProps {
    description: string;
}

export function FormattedDescription({ description }: FormattedDescriptionProps) {
    // Split into paragraphs on [P]
    const paragraphs = description
        .split(/\[P\]/)
        .map(p => p.trim())
        .filter(p => p.length > 0);

    return (
        <>
        {
            paragraphs.map((para, pi) => {
                // Collect pieces of text and <strong> wraps
                const elements: React.ReactNode[] = [];
                let lastIndex = 0;
                const regex = /\[B\](.+?)\[b\]/g;
                let match: RegExpExecArray | null = null;

                while ((match = regex.exec(para)) !== null) {
                    // Text before the bold
                    if (match.index > lastIndex) {
                        elements.push(para.slice(lastIndex, match.index));
                    }
                    // Bold text
                    elements.push(
                        <strong key={`${pi}-${match.index}`}>
                            { match[1]}
                            </strong>
          );
            lastIndex = match.index + match[0].length;
        }

        // Remaining text after last match
        if (lastIndex < para.length) {
        elements.push(para.slice(lastIndex));
    }

    return <p key={ pi }> { elements } </p>;
})}
</>
  );
}