import { useMemo } from 'react';
import { Specialization } from '@/types/specialization';
import './TalentSheet.css';

export default function TalentSheet({ specialization }: { specialization: Specialization }) {
    const rows = specialization.talentRows;
    // determine number of columns (max talents in any row)
    const cols = useMemo(() => {
        return Math.max(...rows.map(r => r.talents.length));
    }, [rows]);

    // helper to compute cell center positions
    const getCellPosition = (rowIdx: number, colIdx: number) => {
        // each cell is 100px square plus 16px gap
        const size = 100;
        const gap = 16;
        return {
            x: colIdx * (size + gap) + size / 2,
            y: rowIdx * (size + gap) + size / 2,
        };
    };

    return (
        <div className="talent-sheet">
            <div
                className="grid"
                style={{
                    gridTemplateColumns: `repeat(${cols}, 100px)`,
                    gridTemplateRows: `repeat(${rows.length}, 100px)`,
                    gap: '16px',
                }}
            >
                {rows.map((row, rowIdx) =>
                    row.talents.map((talentKey, colIdx) => (
                        <div
                            key={`${rowIdx}-${colIdx}`}
                            className="cell"
                            data-row={rowIdx}
                            data-col={colIdx}
                        >
                            <div className="talent-box">
                                {talentKey}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* SVG overlay for connectors */}
            <svg className="connectors">
                {rows.map((row, rowIdx) =>
                    row.directions.map((dirs, colIdx) => {
                        const from = getCellPosition(rowIdx, colIdx);
                        return Object.entries(dirs).map(([dir, on]) => {
                            if (!on) return null;
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
                            if (
                                toRow < 0 || toRow >= rows.length ||
                                toCol < 0 || toCol >= rows[toRow].talents.length
                            ) return null;
                            const to = getCellPosition(toRow, toCol);
                            return (
                                <line
                                    key={`${rowIdx}-${colIdx}-${dir}`}
                                    x1={from.x}
                                    y1={from.y}
                                    x2={to.x}
                                    y2={to.y}
                                    stroke="#444"
                                    strokeWidth={2}
                                />
                            );
                        });
                    })
                )}
            </svg>
        </div>
    );
}