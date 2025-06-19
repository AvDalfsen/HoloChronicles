import {
    useMemo,
    useRef,
    useLayoutEffect,
    useState,
    useCallback,
} from 'react';
import { Specialization } from '@/types/specialization';
import { storedTalent } from '@/types/character';
import { Talent } from '@/types/talent';
import { useCharacterStore } from '@/stores/characterStore';
import './TalentSheet.css';
import { FormattedDescription } from '@/lib/descriptionFormatter';

// Represents a connector line between two talent boxes
interface Line {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

interface TalentSheetProps {
    specialization: Specialization;
    talents: Talent[];
}

export default function TalentSheet({ specialization, talents }: TalentSheetProps) {
    const specKey = specialization.key;
    const rows = specialization.talentRows;
    const cols = useMemo(
        () => Math.max(...rows.map((r) => r.talents.length)),
        [rows]
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const cellRefs = useRef<Array<Array<HTMLDivElement | null>>>([]);
    const [lines, setLines] = useState<Line[]>([]);
    const { character, updateCharacter } = useCharacterStore();

    // Check if a talent at [row, col] has been purchased
    const hasPurchased = useCallback(
        (row: number, col: number) => {
            const specTalents = character.talents.find(
                (s) => s.specializationKey === specKey
            );
            return specTalents?.talents.some(
                (t) => t.row === row && t.col === col
            ) ?? false;
        },
        [character.talents, specKey]
    );

    // Check if a talent at [row, col] is unlocked (available to buy)
    const isAvailable = useCallback(
        (row: number, col: number) => {
            if (!character.specializations.includes(specialization.key)) {
                return false; // Selected specialization not purchased
            }

            if (row === 0) {
                return true;
            }

            // Use the Direction type for keys
            type DirectionKey = keyof typeof specialization.talentRows[number]['directions'][number];
            const neighbors: [number, number, DirectionKey][] = [
                [row - 1, col, 'down'],
                [row, col - 1, 'right'],
                [row, col + 1, 'left'],
                [row + 1, col, 'up'],
            ];

            return neighbors.some(([r, c, dir]) => {
                if (r < 0 || r >= rows.length) return false;
                const rowObj = rows[r];
                if (c < 0 || c >= rowObj.directions.length) return false;
                // Check directional flag
                if (!rowObj.directions[c][dir]) return false;
                return hasPurchased(r, c);
            });
        },
        [rows, hasPurchased, specialization]
    );

    // Purchase a talent: update character store and add XP cost
    const buyTalent = useCallback(
        (row: number, col: number) => {
            const talentKey = rows[row].talents[col];
            const newStored: storedTalent = { key: talentKey, row, col };
            const cost = (row + 1) * 5;

            // Clone and update the talents array
            const existing = [...character.talents];
            const idx = existing.findIndex(
                (s) => s.specializationKey === specKey
            );

            if (idx >= 0) {
                const bucket = existing[idx];
                existing[idx] = {
                    ...bucket,
                    talents: [...bucket.talents, newStored],
                };
            } else {
                existing.push({ specializationKey: specKey, talents: [newStored] });
            }

            // Update character with added talent and XP
            updateCharacter({
                talents: existing,
                experience: {
                    ...character.experience,
                    usedExperience: character.experience.usedExperience + cost,
                },
            });
        },
        [character, rows, specKey, updateCharacter]
    );

    // Sell a talent: remove from character store
    // Has some mind-fuckery logic, so extra comments
    const sellTalent = useCallback(
        (row: number, col: number) => {
            // Clone existing talents for this specialization
            const existing = [...character.talents];
            const specIndex = existing.findIndex(
                (s) => s.specializationKey === specKey
            );
            if (specIndex < 0) return;

            // Original purchased talents
            const bucket = existing[specIndex];
            const originalTalents = bucket.talents;

            // Remove the directly sold talent
            let updatedTalents = originalTalents.filter(
                (t) => !(t.row === row && t.col === col)
            );

            // Build a set of purchased coords for connectivity
            const purchasedSet = new Set(updatedTalents.map((t) => `${t.row},${t.col}`));

            // BFS from any talent in row 0
            const queue: [number, number][] = [];
            updatedTalents.forEach((t) => {
                if (t.row === 0) queue.push([t.row, t.col]);
            });

            const reachable = new Set<string>();
            while (queue.length > 0) {
                const [r, c] = queue.shift()!;
                const keyRC = `${r},${c}`;
                if (reachable.has(keyRC)) continue;
                reachable.add(keyRC);

                // Traverse connections
                const dirs = rows[r].directions[c];
                Object.entries(dirs).forEach(([dir, on]) => {
                    if (!on) return;
                    let nr = r, nc = c;
                    switch (dir) {
                        case 'down': nr++; break;
                        case 'up': nr--; break;
                        case 'left': nc--; break;
                        case 'right': nc++; break;
                    }
                    const neighKey = `${nr},${nc}`;
                    if (purchasedSet.has(neighKey) && !reachable.has(neighKey)) {
                        queue.push([nr, nc]);
                    }
                });
            }

            // Filter out orphaned talents (not reachable)
            const finalTalents = updatedTalents.filter((t) => reachable.has(`${t.row},${t.col}`));

            // Determine which talents were removed (either sold or orphaned)
            const finalKeys = new Set(finalTalents.map((t) => `${t.row},${t.col}`));
            const removedTalents = originalTalents.filter(
                (t) => !finalKeys.has(`${t.row},${t.col}`)
            );

            // Calculate total XP refund: cost = (row+1)*5
            const refund = removedTalents.reduce(
                (sum, t) => sum + (t.row + 1) * 5,
                0
            );

            // Update the bucket and character with refund
            if (finalTalents.length > 0) {
                existing[specIndex] = { ...bucket, talents: finalTalents };
            } else {
                // Remove the specialization entirely if no talents remain
                existing.splice(specIndex, 1);
            }

            updateCharacter({
                talents: existing,
                experience: {
                    ...character.experience,
                    usedExperience: character.experience.usedExperience - refund,
                },
            });
        },
        [character, specKey, rows, updateCharacter]
    );

    // TODO: fix how the lines are drawn. In Republic Representative (and others) they are all sorts of borked.
    // Compute connector lines after layout
    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const newLines: Line[] = [];
        const containerRect =
            containerRef.current.getBoundingClientRect();
        
        rows.forEach((row, rowIdx) => {
            row.directions.forEach((dirs, colIdx) => {
                const fromEl = cellRefs.current[rowIdx]?.[colIdx];
                if (!fromEl) return;

                const fromRect = fromEl.getBoundingClientRect();
                const fromX =
                    fromRect.left + fromRect.width / 2 - containerRect.left;
                const fromY =
                    fromRect.top + fromRect.height / 2 - containerRect.top;

                Object.entries(dirs).forEach(([dir, on]) => {
                    if (!on) return;

                    let toRow = rowIdx;
                    let toCol = colIdx;
                    switch (dir) {
                        case 'down':
                            toRow++;
                            break;
                        case 'up':
                            toRow--;
                            break;
                        case 'left':
                            toCol--;
                            break;
                        case 'right':
                            toCol++;
                            break;
                    }

                    const toEl = cellRefs.current[toRow]?.[toCol];
                    if (!toEl) return;

                    const toRect = toEl.getBoundingClientRect();
                    const toX =
                        toRect.left + toRect.width / 2 - containerRect.left;
                    const toY =
                        toRect.top + toRect.height / 2 - containerRect.top;

                    newLines.push({ x1: fromX, y1: fromY, x2: toX, y2: toY });
                });
            });
        });

        setLines(newLines);
    }, [rows, cols]);

    //Render
    return (
        <div className="talent-sheet" ref={containerRef}>
            <div
                className="grid"
                style={{
                    gridTemplateColumns: `repeat(${cols}, 300px)`,
                    gridAutoRows: 'minmax(100px, auto)',
                    gap: '16px',
                }}
            >
                {rows.map((row, rowIdx) => {
                    const cost = (rowIdx + 1) * 5;
                    cellRefs.current[rowIdx] =
                        cellRefs.current[rowIdx] || [];

                    return row.talents.map((talentKey, colIdx) => {
                        const talent =
                            talents.find((t) => t.key === talentKey);
                        if (!talent) return null;

                        const purchased = hasPurchased(rowIdx, colIdx);
                        const available = isAvailable(rowIdx, colIdx);

                        return (
                            <div
                                key={`${rowIdx}-${colIdx}`}
                                className="cell"
                                ref={(el: HTMLDivElement | null) => {
                                    cellRefs.current[rowIdx][colIdx] = el;
                                }}
                            >
                                <div
                                    className={`talent-box ${!available ? 'unavailable' : ''
                                        }`}
                                >
                                    <div className="talent-name">
                                        {talent.name}
                                    </div>
                                    <div className="talent-desc">
                                        <FormattedDescription
                                            description={
                                                talent.description
                                            }
                                        />
                                    </div>
                                    <br />
                                    <div className="talent-footer">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={purchased}
                                                disabled={!available}
                                                onChange={(e) =>
                                                    e.target.checked
                                                        ? buyTalent(rowIdx, colIdx)
                                                        : sellTalent(rowIdx, colIdx)
                                                }
                                            />{' '}
                                            Cost: {cost}
                                        </label>
                                    </div>
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