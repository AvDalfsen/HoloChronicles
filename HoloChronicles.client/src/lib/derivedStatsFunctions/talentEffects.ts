import { Character, SpecializationTalents, storedTalent } from '@/types/character';
import { CharacterState } from '@/stores/characterStore';
import { Species } from '@/types/species';
import * as helperFunctions from '@/lib/derivedStatsFunctions/helperFunctions'

export function deriveEffectsFromTalents(
    state: CharacterState,
    changes: Partial<Character>,   // contains the *updated* sheet
    updatedCharacter: Character,            // clone you will mutate & return
    originalCharacter: Character,            // pristine reference
    species?: Species
): Character {

    // Bail out only when the client sent no talent information at all
    if (changes.talents == null) return updatedCharacter;

    // TODO: Force talents only apply if character has a Force rating greater than 0.
    // TODO: Talents like Tinkerer, Jury Rigged, etc. need to be removed from items when the talent is sold.

    const {
        addedSpecs,
        removedSpecs,
        modifiedSpecs,
    } = diffTalentSheets(originalCharacter.talents, changes.talents);

    // --- react to each bucket however your game rules demand ---------
    for (const spec of addedSpecs) {
        console.log(`Entire specialization "${spec.specializationKey}" was picked up`, spec.talents);
        // e.g. grant default bonuses for a new spec, etc.
    }

    for (const spec of removedSpecs) {
        console.log(`Entire specialization "${spec.specializationKey}" was dropped`);
        // e.g. revoke spec-wide bonuses, refund XP, etc.
    }

    for (const { specializationKey, talentDiff } of modifiedSpecs) {
        console.log(
            `Within "${specializationKey}" player ${talentDiff.action}:`,
            JSON.stringify(talentDiff.change)
        );
        // e.g. recalc derived stats based on individual talents
    }
    // -----------------------------------------------------------------

    // Finally, *sync* the clone so callers have the fresh state.
    updatedCharacter.talents = changes.talents;

    return updatedCharacter;
}

export function diffSpecializationTalents(
    original: SpecializationTalents | undefined,
    updated: SpecializationTalents
): { change: storedTalent[]; action: 'bought' | 'sold' | 'none' } {

    const toId = (t: storedTalent) => `${t.key}:${t.row}:${t.col}`;

    const originalIds = new Set((original?.talents ?? []).map(toId));
    const updatedIds = new Set(updated.talents.map(toId));

    const added = updated.talents.filter(t => !originalIds.has(toId(t)));
    const removed = (original?.talents ?? []).filter(t => !updatedIds.has(toId(t)));

    if (added.length) return { change: added, action: 'bought' };
    if (removed.length) return { change: removed, action: 'sold' };
    return { change: [], action: 'none' };
}


export interface TalentSheetDiff {
    removedSpecs: SpecializationTalents[];
    addedSpecs: SpecializationTalents[];
    modifiedSpecs: {
        specializationKey: string;
        talentDiff: {
            change: storedTalent[];
            action: 'bought' | 'sold' | 'none';   // from the helper below
        };
    }[];
}

function diffTalentSheets(
    original: SpecializationTalents[],
    updated: SpecializationTalents[]
): TalentSheetDiff {

    const origMap = new Map(original.map(s => [s.specializationKey, s]));
    const updMap = new Map(updated.map(s => [s.specializationKey, s]));

    const addedSpecs: SpecializationTalents[] = [];
    const removedSpecs: SpecializationTalents[] = [];
    const modifiedSpecs: TalentSheetDiff['modifiedSpecs'] = [];

    // look at everything that *was* in the original sheet
    for (const [key, origSpec] of origMap) {
        const updSpec = updMap.get(key);

        if (!updSpec) {
            removedSpecs.push(origSpec);                // spec disappeared entirely
        } else {
            const talentDiff = diffSpecializationTalents(origSpec, updSpec);
            if (talentDiff.action !== 'none') {
                modifiedSpecs.push({ specializationKey: key, talentDiff });
            }
            updMap.delete(key);  // mark as handled
        }
    }

    // leftovers in updMap are truly new specializations
    addedSpecs.push(...updMap.values());

    return { addedSpecs, removedSpecs, modifiedSpecs };
}
