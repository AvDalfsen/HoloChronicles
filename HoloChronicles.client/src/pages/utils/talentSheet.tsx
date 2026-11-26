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
import './talentSheet.css';
import { FormattedDescription } from '@/lib/descriptionFormatter';
import { getTalentPurchaseCounts, getTalentPurchaseQuote } from '@/domain/character/talents';

function formatRomanRank(rank: number): string {
    const numerals: [number, string][] = [
        [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
        [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
        [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
    ];
    let result = '';
    for (const [value, numeral] of numerals) {
        result += numeral.repeat(Math.floor(rank / value));
        rank %= value;
    }
    return result;
}

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
    const boxRefs = useRef<Array<Array<HTMLDivElement | null>>>([]);
    const [lines, setLines] = useState<Line[]>([]);
    const { character, updateCharacter } = useCharacterStore();
    const purchaseCounts = useMemo(() => getTalentPurchaseCounts(character.talents), [character.talents]);

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
            // A click can arrive before another XP update has rendered.
            const current = useCharacterStore.getState().character;
            const { cost, canAfford } = getTalentPurchaseQuote(current, row);
            if (!canAfford || !current.specializations.includes(specKey)
                || current.talents.some(sheet => sheet.specializationKey === specKey
                    && sheet.talents.some(talent => talent.row === row && talent.col === col))) return;
            const talentKey = rows[row].talents[col];
            const newStored: storedTalent = { key: talentKey, row, col, purchaseCost: cost };

            // Clone and update the talents array
            const existing = [...current.talents];
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
                    ...current.experience,
                    usedExperience: current.experience.usedExperience + cost,
                },
            });
        },
        [rows, specKey, updateCharacter]
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
                (sum, t) => sum + (t.purchaseCost ?? (t.row + 1) * 5),
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

    // Measure visible cards, not the grid cells stretched to the tallest card.
    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const newLines: Line[] = [];
        const containerRect = containerRef.current.getBoundingClientRect();
        const boxRects = rows.map((row, rowIdx) => row.talents.map((_, colIdx) =>
            boxRefs.current[rowIdx]?.[colIdx]?.getBoundingClientRect()
        ));
        const rowConnectionYs = boxRects.map(rects => {
            const visible = rects.filter(rect => rect !== undefined);
            if (!visible.length) return undefined;
            const shortest = visible.reduce((shortest, rect) => rect.height < shortest.height ? rect : shortest);
            // Top-aligned cards all contain the shortest card's centre height.
            return shortest.top + shortest.height / 2 - containerRect.top;
        });

        rows.forEach((row, rowIdx) => {
            row.directions.forEach((dirs, colIdx) => {
                const fromRect = boxRects[rowIdx]?.[colIdx];
                if (!fromRect) return;

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
                        default:
                            return;
                    }

                    const toRect = boxRects[toRow]?.[toCol];
                    if (!toRect) return;

                    if (dir === 'left' || dir === 'right') {
                        const y = rowConnectionYs[rowIdx]!;
                        newLines.push({
                            x1: (dir === 'right' ? fromRect.right : fromRect.left) - containerRect.left,
                            y1: y,
                            x2: (dir === 'right' ? toRect.left : toRect.right) - containerRect.left,
                            y2: y,
                        });
                    } else {
                        newLines.push({
                            x1: fromRect.left + fromRect.width / 2 - containerRect.left,
                            y1: (dir === 'down' ? fromRect.bottom : fromRect.top) - containerRect.top,
                            x2: toRect.left + toRect.width / 2 - containerRect.left,
                            y2: (dir === 'down' ? toRect.top : toRect.bottom) - containerRect.top,
                        });
                    }
                });
            });
        });

        setLines(newLines);
    }, [rows, cols, talents]);

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
                    const { cost, canAfford } = getTalentPurchaseQuote(character, rowIdx);
                    boxRefs.current[rowIdx] = boxRefs.current[rowIdx] || [];

                    return row.talents.map((talentKey, colIdx) => {
                        const talent =
                            talents.find((t) => t.key === talentKey);
                        // Keep the grid slot when a dataset omits a talent definition.
                        if (!talent) return <div key={`${rowIdx}-${colIdx}`} className="cell" />;

                        const purchased = hasPurchased(rowIdx, colIdx);
                        const available = isAvailable(rowIdx, colIdx);
                        const unaffordable = !purchased && !canAfford;
                        const disabled = !available || unaffordable;
                        const ranks = talent.ranked ? purchaseCounts.get(talent.key) ?? 0 : 0;
                        const rankSummary = ranks > 0 ? `${ranks} ${ranks === 1 ? 'rank' : 'ranks'} purchased across all specializations` : undefined;
                        const accessibleDescription = [rankSummary, unaffordable ? 'Not enough XP' : undefined].filter(Boolean).join('. ') || undefined;

                        return (
                            <div
                                key={`${rowIdx}-${colIdx}`}
                                className="cell"
                            >
                                <div
                                    ref={(el: HTMLDivElement | null) => {
                                        boxRefs.current[rowIdx][colIdx] = el;
                                    }}
                                    className={`talent-box ${!available ? 'unavailable' : ''} ${unaffordable ? 'unaffordable' : ''} ${purchased ? 'purchased' : ''}`}
                                >
                                    {/* Cover the card with a native toggle; formatted paragraphs stay outside the button. */}
                                    <button
                                        type="button"
                                        className="talent-toggle"
                                        aria-label={`${talent.name} (${cost} XP, row ${rowIdx + 1}, column ${colIdx + 1})`}
                                        aria-pressed={purchased}
                                        aria-description={accessibleDescription}
                                        disabled={disabled}
                                        title={purchased ? `Sell ${talent.name}` : unaffordable ? undefined : !available ? `${talent.name} is not unlocked` : `Purchase ${talent.name} for ${cost} XP`}
                                        onClick={() => purchased ? sellTalent(rowIdx, colIdx) : buyTalent(rowIdx, colIdx)}
                                    >
                                        {ranks > 0 && <span className="talent-rank" title={rankSummary} aria-hidden="true">
                                            {formatRomanRank(ranks)}
                                        </span>}
                                    </button>
                                    <div className={`talent-name ${talent.ranked ? 'ranked' : ''}`}>
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
                                        Cost: {cost}
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
