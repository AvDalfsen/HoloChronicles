namespace HoloChronicles.Server.Dataclasses
{
    public class StartingChars
    {
        public string? Brawn { get; set; }
        public string? Agility { get; set; }
        public string? Intellect { get; set; }
        public string? Cunning { get; set; }
        public string? Willpower { get; set; }
        public string? Presence { get; set; }

        public StartingChars(string? brawn = null, string? agility = null, string? intellect = null, string? cunning = null, string? willpower = null, string? presence = null)
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
        public string? WoundThreshold { get; set; }
        public string? StrainThreshold { get; set; }
        public string? Experience { get; set; }
        public string? DefenseRanged { get; set; }
        public string? DefenseMelee { get; set; }
        public string? SoakValue { get; set; }
        public string? ForceRating { get; set; }
        public string? EncumbranceBonus { get; set; }

        public StartingAttrs(string? woundThreshold = null, string? strainThreshold = null, string? experience = null, string? defenseRanged = null, string? defenseMelee = null, string? soakValue = null, string? forceRating = null, string? encumbranceBonus = null)
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
        public string? RankStart { get; set; }
        public string? RankLimit { get; set; }
        public string? RankAdd { get; set; }
        public string? IsCareer { get; set; }
        public string? SkillType { get; set; }

        public SkillModifier(string? key = null, string? rankStart = null, string? rankLimit = null, string? rankAdd = null, string? isCareer = null, string? skillType = null)
        {
            Key = key;
            RankStart = rankStart;
            RankLimit = rankLimit;
            RankAdd = rankAdd;
            IsCareer = isCareer;
            SkillType = skillType;
        }
    }

    public class SkillModifiers
    {
        public List<SkillModifier>? SkillModifier { get; set; } = new();

        public SkillModifiers(List<SkillModifier>? skillModifier = null)
        {
            SkillModifier = skillModifier ?? new List<SkillModifier>();
        }
    }

    public class TalentModifier
    {
        public string? Key { get; set; }
        public string? RankAdd { get; set; }

        public TalentModifier(string? key = null, string? rankAdd = null)
        {
            Key = key;
            RankAdd = rankAdd;
        }
    }

    public class TalentModifiers
    {
        public List<TalentModifier>? TalentModifier { get; set; } = new();

        public TalentModifiers(List<TalentModifier>? talentModifier = null)
        {
            TalentModifier = talentModifier ?? new List<TalentModifier>();
        }
    }

    public class Option
    {
        public string? Key { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public SkillModifiers? SkillModifiers { get; set; }
        public DieModifiers? DieModifiers { get; set; }
        public StartingSkillTraining? StartingSkillTraining { get; set; }
        public StartingAttributes? StartingAttributes { get; set; }
        public TalentModifiers? TalentModifiers { get; set; }

        public Option(string? key = null, string? name = null, string? description = null, SkillModifiers? skillModifiers = null, DieModifiers? dieModifiers = null, StartingSkillTraining? startingSkillTraining = null, StartingAttributes? startingAttributes = null, TalentModifiers? talentModifiers = null)
        {
            Key = key;
            Name = name;
            Description = description;
            SkillModifiers = skillModifiers;
            DieModifiers = dieModifiers;
            StartingSkillTraining = startingSkillTraining;
            StartingAttributes = startingAttributes;
            TalentModifiers = talentModifiers;
        }
    }

    public class Options
    {
        public List<Option>? Option { get; set; } = new();

        public Options(List<Option>? option = null)
        {
            Option = option ?? new List<Option>();
        }
    }

    public class OptionChoice
    {
        public string? Key { get; set; }
        public string? Name { get; set; }
        public Options? Options { get; set; }

        public OptionChoice(string? key = null, string? name = null, Options? options = null)
        {
            Key = key;
            Name = name;
            Options = options;
        }
    }

    public class OptionChoices
    {
        public List<OptionChoice>? OptionChoice { get; set; } = new();

        public OptionChoices(List<OptionChoice>? optionChoice = null)
        {
            OptionChoice = optionChoice ?? new List<OptionChoice>();
        }
    }

    public class DieModifier
    {
        public string? SkillKey { get; set; }
        public string? AdvantageCount { get; set; }
        public string? SkillType { get; set; }
        public string? BoostCount { get; set; }
        public string? SetbackCount { get; set; }
        public string? SuccessCount { get; set; }
        public string? AddSetbackCount { get; set; }

        public DieModifier(string? skillKey = null, string? advantageCount = null, string? skillType = null, string? boostCount = null, string? setbackCount = null, string? successCount = null, string? addSetbackCount = null)
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

    public class DieModifiers
    {
        public List<DieModifier>? DieModifier { get; set; } = new();

        public DieModifiers(List<DieModifier>? dieModifier = null)
        {
            DieModifier = dieModifier ?? new List<DieModifier>();
        }
    }

    public class Requirement
    {
        public string? Career { get; set; }
        public string? Specialization { get; set; }
        public string? FromSkillType { get; set; }
        public string? SkillType { get; set; }
        public string? NonCareer { get; set; }

        public Requirement(string? career = null, string? specialization = null, string? fromSkillType = null, string? skillType = null, string? nonCareer = null)
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
        public string? SkillCount { get; set; }
        public Requirement? Requirement { get; set; }

        public SkillTraining(string? skillCount = null, Requirement? requirement = null)
        {
            SkillCount = skillCount;
            Requirement = requirement;
        }
    }

    public class StartingSkillTraining
    {
        public List<SkillTraining>? SkillTraining { get; set; } = new();

        public StartingSkillTraining(List<SkillTraining>? skillTraining = null)
        {
            SkillTraining = skillTraining ?? new List<SkillTraining>();
        }
    }

    public class WeaponModifier
    {
        public string? AllSkillKey { get; set; }
        public string? DamageAdd { get; set; }
        public string? Crit { get; set; }

        public WeaponModifier(string? allSkillKey = null, string? damageAdd = null, string? crit = null)
        {
            AllSkillKey = allSkillKey;
            DamageAdd = damageAdd;
            Crit = crit;
        }
    }

    public class WeaponModifiers
    {
        public List<WeaponModifier>? WeaponModifier { get; set; } = new();

        public WeaponModifiers(List<WeaponModifier>? weaponModifier = null)
        {
            WeaponModifier = weaponModifier ?? new List<WeaponModifier>();
        }
    }

    public class SubSpecies
    {
        public string? Key { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public StartingChars? StartingChars { get; set; }
        public StartingAttrs? StartingAttrs { get; set; }
        public SkillModifiers? SkillModifiers { get; set; }
        public OptionChoices? OptionChoices { get; set; }
        public string? CyberneticsAdjust { get; set; }
        public WeaponModifiers? WeaponModifiers { get; set; }
        public TalentModifiers? TalentModifiers { get; set; }

        public SubSpecies(string? key = null, string? name = null, string? description = null, StartingChars? startingChars = null, StartingAttrs? startingAttrs = null, SkillModifiers? skillModifiers = null, OptionChoices? optionChoices = null, string? cyberneticsAdjust = null, WeaponModifiers? weaponModifiers = null, TalentModifiers? talentModifiers = null)
        {
            Key = key;
            Name = name;
            Description = description;
            StartingChars = startingChars;
            StartingAttrs = startingAttrs;
            SkillModifiers = skillModifiers;
            OptionChoices = optionChoices;
            CyberneticsAdjust = cyberneticsAdjust;
            WeaponModifiers = weaponModifiers;
            TalentModifiers = talentModifiers;
        }
    }

    public class SubSpeciesList
    {
        public List<SubSpecies>? SubSpecies { get; set; } = new();

        public SubSpeciesList(List<SubSpecies>? subSpecies = null)
        {
            SubSpecies = subSpecies ?? new List<SubSpecies>();
        }
    }

    public class Species
    {
        public string? Key { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Source { get; set; }
        public string? Custom { get; set; }
        public StartingChars? StartingChars { get; set; }
        public StartingAttrs? StartingAttrs { get; set; }
        public SkillModifiers? SkillModifiers { get; set; }
        public TalentModifiers? TalentModifiers { get; set; }
        public OptionChoices? OptionChoices { get; set; }
        public SubSpeciesList? SubSpeciesList { get; set; }
        public WeaponModifiers? WeaponModifiers { get; set; }
        public List<string>? Sources { get; set; } = new();
        public string? NoForceAbilities { get; set; }
        public string? CyberneticsAdjust { get; set; }

        public Species(string? key = null, string? name = null, string? description = null, string? source = null, string? custom = null, StartingChars? startingChars = null, StartingAttrs? startingAttrs = null, SkillModifiers? skillModifiers = null, TalentModifiers? talentModifiers = null, OptionChoices? optionChoices = null, SubSpeciesList? subSpeciesList = null, WeaponModifiers? weaponModifiers = null, List<string>? sources = null, string? noForceAbilities = null, string? cyberneticsAdjust = null)
        {
            Key = key;
            Name = name;
            Description = description;
            Source = source;
            Custom = custom;
            StartingChars = startingChars;
            StartingAttrs = startingAttrs;
            SkillModifiers = skillModifiers;
            TalentModifiers = talentModifiers;
            OptionChoices = optionChoices;
            SubSpeciesList = subSpeciesList;
            WeaponModifiers = weaponModifiers;
            Sources = sources ?? new List<string>();
            NoForceAbilities = noForceAbilities;
            CyberneticsAdjust = cyberneticsAdjust;
        }
    }


    public class StartingAttributes
    {
        public string? Experience { get; set; }

        public StartingAttributes(string? experience = null)
        {
            Experience = experience;
        }
    }

    public class Quality
    {
        public string? Key { get; set; }
        public string? Count { get; set; }

        public Quality(string? key = null, string? count = null)
        {
            Key = key;
            Count = count;
        }
    }

    public class Qualities
    {
        public List<Quality>? Quality { get; set; }

        public Qualities(List<Quality>? quality = null)
        {
            Quality = quality ?? new List<Quality>();
        }
    }
}