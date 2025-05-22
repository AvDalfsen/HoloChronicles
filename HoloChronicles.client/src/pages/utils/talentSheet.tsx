import React, { useMemo, useRef, useLayoutEffect, useState } from 'react';
import { Specialization } from '@/types/specialization';
import { Talent } from '@/types/talent';
import './TalentSheet.css';
import { FormattedDescription } from '@/lib/descriptionFormatter';

type Line = { x1: number; y1: number; x2: number; y2: number };

interface TalentSheetProps {
    specialization: Specialization;
    talents: Talent[];
}

// Calculate intersection point of line from 'from' to 'to' with rect edges
function getEdgeIntersection(
    from: { x: number; y: number },
    to: { x: number; y: number },
    rect: DOMRect
) {
    // Center of rect
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Direction vector
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    // Half-sizes
    const hw = rect.width / 2;
    const hh = rect.height / 2;

    // Calculate scale factors to reach each edge
    const scaleX = dx !== 0 ? hw / Math.abs(dx) : Infinity;
    const scaleY = dy !== 0 ? hh / Math.abs(dy) : Infinity;

    // Use the smaller scale so the line intersects the nearest edge
    const scale = Math.min(scaleX, scaleY);

    return {
        x: cx + dx * scale,
        y: cy + dy * scale,
    };
}

export default function TalentSheet({ specialization, talents }: TalentSheetProps) {
    const rows = specialization.talentRows;
    const cols = useMemo(() => Math.max(...rows.map(r => r.talents.length)), [rows]);

    const containerRef = useRef<HTMLDivElement>(null);
    const cellRefs = useRef<(HTMLDivElement | null)[][]>([]);
    const [lines, setLines] = useState<Line[]>([]);

    useLayoutEffect(() => {
        const newLines: Line[] = [];
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;

        rows.forEach((row, rowIdx) => {
            row.directions.forEach((dirs, colIdx) => {
                const fromEl = cellRefs.current[rowIdx]?.[colIdx];
                if (!fromEl) return;
                const fromRect = fromEl.getBoundingClientRect();
                const fromCenter = {
                    x: fromRect.left + fromRect.width / 2,
                    y: fromRect.top + fromRect.height / 2,
                };

                Object.entries(dirs).forEach(([dir, on]) => {
                    if (!on) return;
                    // Determine target cell indices
                    let toRow = rowIdx;
                    let toCol = colIdx;
                    switch (dir) {
                        case 'down': toRow++; break;
                        case 'up': toRow--; break;
                        case 'left': toCol--; break;
                        case 'right': toCol++; break;
                    }
                    const toEl = cellRefs.current[toRow]?.[toCol];
                    if (!toEl) return;
                    const toRect = toEl.getBoundingClientRect();
                    const toCenter = {
                        x: toRect.left + toRect.width / 2,
                        y: toRect.top + toRect.height / 2,
                    };

                    // Compute edge intersections
                    const start = getEdgeIntersection(fromCenter, toCenter, fromRect);
                    const end = getEdgeIntersection(toCenter, fromCenter, toRect);

                    // Adjust relative to container
                    newLines.push({
                        x1: start.x - containerRect.left,
                        y1: start.y - containerRect.top,
                        x2: end.x - containerRect.left,
                        y2: end.y - containerRect.top,
                    });
                });
            });
        });

        setLines(newLines);
    }, [rows, cols]);

    return (
        <div className="talent-sheet" ref={containerRef}>
            <div
                className="grid"
                style={{
                    gridTemplateColumns: `repeat(${cols}, 250px)`,
                    gridAutoRows: 'minmax(100px, auto)',
                    gap: '16px',
                }}
            >
                {rows.map((row, rowIdx) => {
                    const cost = (rowIdx + 1) * 5;
                    cellRefs.current[rowIdx] = cellRefs.current[rowIdx] || [];
                    return row.talents.map((talentKey, colIdx) => {
                        const talent = talents.find(t => t.key === talentKey);
                        if (!talent) return null;
                        return (
                            <div
                                key={`${rowIdx}-${colIdx}`}
                                className="cell"
                                data-row={rowIdx}
                                data-col={colIdx}
                                ref={(el: HTMLDivElement | null) => {
                                    cellRefs.current[rowIdx][colIdx] = el;
                                }}
                            >
                                <div className="talent-box">
                                    <div className="talent-name">{talent.name}</div>
                                    <div className="talent-desc">
                                        <FormattedDescription description={talent.description} />
                                    </div>
                                    <div className="talent-cost">Cost: {cost}</div>
                                </div>
                            </div>
                        );
                    });
                })}
            </div>

            <svg className="connectors">
                {lines.map((line, idx) => (
                    <line
                        key={idx}
                        x1={line.x1}
                        y1={line.y1}
                        x2={line.x2}
                        y2={line.y2}
                        stroke="#444"
                        strokeWidth={2}
                    />
                ))}
            </svg>
        </div>
    );
}
