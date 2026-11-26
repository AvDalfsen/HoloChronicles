const standardRankLimits = { characteristic: 6, skill: 5 } as const;

/** Effective-rank ceilings: EotE Core Rulebook pp.30, 92 and 173.
 * Cybernetics permit one rank above the normal maximum. Purchase checks use
 * their separate training bases; saved contributions are never truncated. */
export function capEffectiveRank(
    kind: keyof typeof standardRankLimits,
    total: number,
    cyberneticRanks: number,
): number {
    // Preserve invalid imported values so validation can still detect them.
    if (!Number.isSafeInteger(total)) return total;
    const maximum = standardRankLimits[kind] + (cyberneticRanks > 0 ? 1 : 0);
    return Math.min(total, maximum);
}
