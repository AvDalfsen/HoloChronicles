import { Character } from '@/types/character';
import { Species } from '@/types/species';

export function recalculateTotalCharacteristic(character: Character, changedCharacteristic: string): number {
    const characteristics = character.characteristics;

    const k = changedCharacteristic as keyof typeof characteristics;

    const species = characteristics[k].species ?? 0;
    const bought = characteristics[k].bought ?? 0;
    const gear = characteristics[k].gear ?? 0;
    const cybernetics = characteristics[k].cybernetics ?? 0;

    const total = species + bought + gear + cybernetics;

    return total
}

export function recalculateSoak(character: Character, species?: Species): number {
    const brawn = character.characteristics.brawn.total ?? 1;
    const speciesSoak = species?.startingAttrs?.soakValue ?? 0;
    //TODO const gearSoakBonus = character.gear?.reduce((total, g) => total + (g.soakBonus || 0), 0) ?? 0;

    return (brawn + speciesSoak);
}

export function recalculateWoundThreshold(character: Character, species?: Species): number {
    const brawn = character.characteristics.brawn.total ?? 1;
    const speciesWoundThreshold = species?.startingAttrs?.woundThreshold ?? 0;
    //TODO: gear and other items

    return (speciesWoundThreshold + brawn)
}

export function recalculateStrainThreshold(character: Character, species?: Species): number {
    const willpower = character.characteristics.willpower.total ?? 1;
    const speciesStrainThreshold = species?.startingAttrs?.strainThreshold ?? 0;
    //TODO: gear and other items

    return (speciesStrainThreshold + willpower)
}

export function recalculateAvailableXP(character: Character): number {
    const experienceValues = character.experience ?? 0;

    const speciesXP = experienceValues.experienceRanks.speciesRanks;
    const purchasedXP = experienceValues.experienceRanks.purchasedRanks;
    const startingXP = experienceValues.experienceRanks.startingRanks;

    const usedXP = experienceValues.usedExperience;

    return ((speciesXP + purchasedXP + startingXP) - usedXP);
}