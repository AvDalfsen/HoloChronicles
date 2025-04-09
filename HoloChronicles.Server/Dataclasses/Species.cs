using HoloChronicles.Server.Dataclasses;

namespace HoloChronicles.Server.Dataclasses
{
    public class StartingChars
    {
        public int? Brawn { get; set; }
        public int? Agility { get; set; }
        public int? Intellect { get; set; }
        public int? Cunning { get; set; }
        public int? Willpower { get; set; }
        public int? Presence { get; set; }

        public StartingChars(int? brawn = null, int? agility = null, int? intellect = null, int? cunning = null, int? willpower = null, 
                             int? presence = null)
        {
            Brawn = brawn;
            Agility = agility;
            Intellect = intellect;
            Cunning = cunning;
            Willpower = willpower;
            Presence = presence;
        }
    }

    public class StartingAttrs
    {
        public int? WoundThreshold { get; set; }
        public int? StrainThreshold { get; set; }
        public int? Experience { get; set; }
        public int? DefenseRanged { get; set; }
        public int? DefenseMelee { get; set; }
        public int? SoakValue { get; set; }
        public int? ForceRating { get; set; }
        public int? EncumbranceBonus { get; set; }

        public StartingAttrs(int? woundThreshold = null, int? strainThreshold = null, int? experience = null, int? defenseRanged = null, 
                             int? defenseMelee = null, int? soakValue = null, int? forceRating = null, int? encumbranceBonus = null)
        {
            WoundThreshold = woundThreshold;
            StrainThreshold = strainThreshold;
            Experience = experience;
            DefenseRanged = defenseRanged;
            DefenseMelee = defenseMelee;
            SoakValue = soakValue;
            ForceRating = forceRating;
            EncumbranceBonus = encumbranceBonus;
        }
    }

    public class SkillModifier
    {
        public string? Key { get; set; }
        public int? RankStart { get; set; }
        public int? RankLimit { get; set; }
        public int? RankAdd { get; set; }
        public bool? IsCareer { get; set; }
        public string? SkillType { get; set; }

        public SkillModifier(string? key = null, int? rankStart = null, int? rankLimit = null, int? rankAdd = null, 
                             bool? isCareer = null, string? skillType = null)
        {
            Key = key;
            RankStart = rankStart;
            RankLimit = rankLimit;
            RankAdd = rankAdd;
            IsCareer = isCareer;
            SkillType = skillType;
        }
    }

    public class TalentModifier
    {
        public string? Key { get; set; }
        public int? RankAdd { get; set; }

        public TalentModifier(string? key = null, int? rankAdd = null)
        {
            Key = key;
            RankAdd = rankAdd;
        }
    }

    public class Option
    {
        public string? Key { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public List<SkillModifier>? SkillModifiers { get; set; }
        public List<DieModifier>? DieModifiers { get; set; }
        public List<SkillTraining>? StartingSkillTraining { get; set; }
        public int? Experience { get; set; }
        public List<TalentModifier>? TalentModifiers { get; set; }

        public Option(string? key = null, string? name = null, string? description = null, List<SkillModifier>? skillModifiers = null,
                      List<DieModifier>? dieModifiers = null, List<SkillTraining>? startingSkillTraining = null, 
                      int? experience = null, List<TalentModifier>? talentModifiers = null)
        {
            Key = key;
            Name = name;
            Description = description;
            SkillModifiers = skillModifiers;
            DieModifiers = dieModifiers ?? new List<DieModifier>();
            StartingSkillTraining = startingSkillTraining ?? new List<SkillTraining>();
            Experience = experience;
            TalentModifiers = talentModifiers ?? new List<TalentModifier>();
        }
    }

    public class OptionChoice
    {
        public string? Key { get; set; }
        public string? Name { get; set; }
        public List<Option>? Options { get; set; }

        public OptionChoice(string? key = null, string? name = null, List<Option>? options = null)
        {
            Key = key;
            Name = name;
            Options = options ?? new List<Option>();
        }
    }
    public class DieModifier
    {
        public string? SkillKey { get; set; }
        public int? AdvantageCount { get; set; }
        public string? SkillType { get; set; }
        public int? BoostCount { get; set; }
        public int? SetbackCount { get; set; }
        public int? SuccessCount { get; set; }
        public int? AddSetbackCount { get; set; }

        public DieModifier(string? skillKey = null, int? advantageCount = null, string? skillType = null, int? boostCount = null,
                           int? setbackCount = null, int? successCount = null, int? addSetbackCount = null)
        {
            SkillKey = skillKey;
            AdvantageCount = advantageCount;
            SkillType = skillType;
            BoostCount = boostCount;
            SetbackCount = setbackCount;
            SuccessCount = successCount;
            AddSetbackCount = addSetbackCount;
        }
    }

    public class SpeciesRequirement
    {
        public string? Career { get; set; }
        public string? Specialization { get; set; }
        public string? FromSkillType { get; set; }
        public string? SkillType { get; set; }
        public string? NonCareer { get; set; }

        public SpeciesRequirement(string? career = null, string? specialization = null, string? fromSkillType = null, 
                           string? skillType = null, string? nonCareer = null)
        {
            Career = career;
            Specialization = specialization;
            FromSkillType = fromSkillType;
            SkillType = skillType;
            NonCareer = nonCareer;
        }
    }

    public class SkillTraining
    {
        public int? SkillCount { get; set; }
        public SpeciesRequirement? Requirement { get; set; }

        public SkillTraining(int? skillCount = null, SpeciesRequirement? requirement = null)
        {
            SkillCount = skillCount;
            Requirement = requirement;
        }
    }

    public class WeaponModifier
    {
        public string? AllSkillKey { get; set; }
        public int? DamageAdd { get; set; }
        public int? Crit { get; set; }
        public string? Range { get; set; }
        public string? UnarmedName { get; set; }
        public string? SkillKey { get; set; }
        public int? Damage { get; set; }
        public List<Quality>? Qualities { get; set; }
        public string? RangeValue { get; set; }

        public WeaponModifier(string? allSkillKey = null, int? damageAdd = null, int? crit = null, string? range = null, string? unarmedName = null,
                              string? skillKey = null, int? damage = null, List<Quality>? qualities = null, string? rangeValue = null)
        {
            AllSkillKey = allSkillKey;
            DamageAdd = damageAdd;
            Crit = crit;
            Range = range;
            UnarmedName = unarmedName;
            SkillKey = skillKey;
            Damage = damage;
            Qualities = qualities ?? new List<Quality>();
            RangeValue = rangeValue;
        }
    }

    public class SubSpecies
    {
        public string? Key { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public StartingChars? StartingChars { get; set; }
        public StartingAttrs? StartingAttrs { get; set; }
        public List<SkillModifier>? SkillModifiers { get; set; }
        public List<OptionChoice>? OptionChoices { get; set; }
        public int? CyberneticsAdjust { get; set; }
        public List<WeaponModifier>? WeaponModifiers { get; set; }
        public List<TalentModifier>? TalentModifiers { get; set; }

        public SubSpecies(string? key = null, string? name = null, string? description = null, StartingChars? startingChars = null, 
                          StartingAttrs? startingAttrs = null, List<SkillModifier>? skillModifiers = null, List<OptionChoice>? optionChoices = null,
                          int? cyberneticsAdjust = null, List<WeaponModifier>? weaponModifiers = null, List<TalentModifier>? talentModifiers = null)
        {
            Key = key;
            Name = name;
            Description = description;
            StartingChars = startingChars;
            StartingAttrs = startingAttrs;
            SkillModifiers = skillModifiers ?? new List<SkillModifier>();
            TalentModifiers = talentModifiers ?? new List<TalentModifier>();
            OptionChoices = optionChoices ?? new List<OptionChoice>();
            WeaponModifiers = weaponModifiers ?? new List<WeaponModifier>();
            CyberneticsAdjust = cyberneticsAdjust;
        }
    }

    public class Species
    {
        public string? Key { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public List<string>? Sources { get; set; } = new();
        public string? Custom { get; set; }
        public StartingChars? StartingChars { get; set; }
        public StartingAttrs? StartingAttrs { get; set; }
        public List<SkillModifier>? SkillModifiers { get; set; }
        public List<TalentModifier>? TalentModifiers { get; set; }
        public List<OptionChoice>? OptionChoices { get; set; }
        public List<SubSpecies>? SubSpeciesList { get; set; }
        public List<WeaponModifier>? WeaponModifiers { get; set; }
        public bool? NoForceAbilities { get; set; }
        public int? CyberneticsAdjust { get; set; }

        public Species(string? key = null, string? name = null, string? description = null, List<string>? sources = null, 
                       string? custom = null, StartingChars? startingChars = null, StartingAttrs? startingAttrs = null, 
                       List<SkillModifier>? skillModifiers = null, List<TalentModifier>? talentModifiers = null, List<OptionChoice>? optionChoices = null, 
                       List<SubSpecies>? subSpeciesList = null, List<WeaponModifier>? weaponModifiers = null, bool? noForceAbilities = null, 
                       int? cyberneticsAdjust = null)
        {
            Key = key;
            Name = name;
            Description = description;
            Sources = sources ?? new List<string>();
            Custom = custom;
            StartingChars = startingChars;
            StartingAttrs = startingAttrs;
            SkillModifiers = skillModifiers ?? new List<SkillModifier>();
            TalentModifiers = talentModifiers ?? new List<TalentModifier>();
            OptionChoices = optionChoices ?? new List<OptionChoice>();
            SubSpeciesList = subSpeciesList ?? new List<SubSpecies>();
            WeaponModifiers = weaponModifiers ?? new List<WeaponModifier>();
            NoForceAbilities = noForceAbilities;
            CyberneticsAdjust = cyberneticsAdjust;
        }
    }

    public class Quality
    {
        public string? Key { get; set; }
        public int? Count { get; set; }

        public Quality(string? key = null, int? count = null)
        {
            Key = key;
            Count = count;
        }
    }
}