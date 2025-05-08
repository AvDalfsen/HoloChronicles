namespace HoloChronicles.Server.Dataclasses
{
    public class Talent
    {
        public string? Key { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public List<string>? Sources { get; set; }
        public string? Custom { get; set; }
        public bool Ranked { get; set; }
        public string? ActivationValue { get; set; }
        public TalentAttributes? Attributes { get; set; }
        public bool ForceTalent { get; set; }
        public ChooseCareerSkills? ChooseCareerSkills { get; set; }
        public List<TalentDieModifier>? DieModifiers { get; set; }
        public SkillChoice? SkillChoice { get; set; }
        public List<CharacteristicChoice>? CharacteristicChoices { get; set; }
        public RosterMods? RosterMods { get; set; }
        public Damage? Damage { get; set; }
        public int? ModPercentDiscount { get; set; }
        public bool JuryRigged { get; set; }
        public List<ItemChange>? ItemChanges { get; set; }
        public int? AddlHP { get; set; }
        public List<SkillChar>? SkillChars { get; set; }
        public int? HPPerItem { get; set; }
        public int? Conflict { get; set; }
        public Rigger? Rigger { get; set; }
        public int? AddlCyber { get; set; }

        public Talent(
            string? key = null,
            string? name = null,
            string? description = null,
            List<string>? sources = null,
            string? custom = null,
            bool ranked = false,
            string? activationValue = null,
            TalentAttributes? attributes = null,
            bool forceTalent = false,
            ChooseCareerSkills? chooseCareerSkills = null,
            List<TalentDieModifier>? dieModifiers = null,
            SkillChoice? skillChoice = null,
            List<CharacteristicChoice>? characteristicChoices = null,
            RosterMods? rosterMods = null,
            Damage? damage = null,
            int? modPercentDiscount = null,
            bool juryRigged = false,
            List<ItemChange>? itemChanges = null,
            int? addlHP = null,
            List<SkillChar>? skillChars = null,
            int? hpPerItem = null,
            int? conflict = null,
            Rigger? rigger = null,
            int? addlCyber = null
        )
        {
            Key = key;
            Name = name;
            Description = description;
            Sources = sources;
            Custom = custom;
            Ranked = ranked;
            ActivationValue = activationValue;
            Attributes = attributes;
            ForceTalent = forceTalent;
            ChooseCareerSkills = chooseCareerSkills;
            DieModifiers = dieModifiers;
            SkillChoice = skillChoice;
            CharacteristicChoices = characteristicChoices;
            RosterMods = rosterMods;
            Damage = damage;
            ModPercentDiscount = modPercentDiscount;
            JuryRigged = juryRigged;
            ItemChanges = itemChanges;
            AddlHP = addlHP;
            SkillChars = skillChars;
            HPPerItem = hpPerItem;
            Conflict = conflict;
            Rigger = rigger;
            AddlCyber = addlCyber;
        }
    }

    public class TalentRequirement
    {
        public bool? WearingArmor { get; set; }
        public int? SoakAtLeast { get; set; }

        public TalentRequirement(bool? wearingArmor = null, int? soakAtLeast = null)
        {
            WearingArmor = wearingArmor;
            SoakAtLeast = soakAtLeast;
        }
    }

    public class TalentAttributes
    {
        public int? SoakValue { get; set; }
        public TalentRequirement? Requirement { get; set; }
        public int? DefenseRanged { get; set; }
        public int? DefenseMelee { get; set; }
        public int? ForceRating { get; set; }
        public int? StrainThreshold { get; set; }
        public int? WoundThreshold { get; set; }

        public TalentAttributes(
            int? soakValue = null,
            TalentRequirement? requirement = null,
            int? defenseRanged = null,
            int? defenseMelee = null,
            int? forceRating = null,
            int? strainThreshold = null,
            int? woundThreshold = null
        )
        {
            SoakValue = soakValue;
            Requirement = requirement;
            DefenseRanged = defenseRanged;
            DefenseMelee = defenseMelee;
            ForceRating = forceRating;
            StrainThreshold = strainThreshold;
            WoundThreshold = woundThreshold;
        }
    }

    public class ChooseCareerSkills
    {
        public int? SkillCount { get; set; }
        public List<string>? NewSkills { get; set; }
        public bool? ChooseByType { get; set; }
        public string? TypeValue { get; set; }
        public string? Type { get; set; }

        public ChooseCareerSkills(
            int? skillCount = null,
            List<string>? newSkills = null,
            bool? chooseByType = null,
            string? typeValue = null,
            string? type = null
        )
        {
            SkillCount = skillCount;
            NewSkills = newSkills;
            ChooseByType = chooseByType;
            TypeValue = typeValue;
            Type = type;
        }
    }

    public class TalentDieModifier
    {
        public string? SkillKey { get; set; }
        public int? BoostCount { get; set; }
        public int? SetbackCount { get; set; }
        public int? ForceCount { get; set; }
        public string? SkillType { get; set; }
        public int? DecreaseDifficultyCount { get; set; }
        public bool? ApplyOnce { get; set; }
        public int? AdvantageCount { get; set; }

        public TalentDieModifier(
            string? skillKey = null,
            int? boostCount = null,
            int? setbackCount = null,
            int? forceCount = null,
            string? skillType = null,
            int? decreaseDifficultyCount = null,
            bool? applyOnce = null,
            int? advantageCount = null
        )
        {
            SkillKey = skillKey;
            BoostCount = boostCount;
            SetbackCount = setbackCount;
            ForceCount = forceCount;
            SkillType = skillType;
            DecreaseDifficultyCount = decreaseDifficultyCount;
            ApplyOnce = applyOnce;
            AdvantageCount = advantageCount;
        }
    }

    public class SkillChoice
    {
        public string? TypeValue { get; set; }
        public int? SkillCount { get; set; }
        public bool? AddDamagePerSkillRank { get; set; }
        public bool? AddSkillsPerRank { get; set; }
        public List<string>? SkillList { get; set; }

        public SkillChoice(
            string? typeValue = null,
            int? skillCount = null,
            bool? addDamagePerSkillRank = null,
            bool? addSkillsPerRank = null,
            List<string>? skillList = null
        )
        {
            TypeValue = typeValue;
            SkillCount = skillCount;
            AddDamagePerSkillRank = addDamagePerSkillRank;
            AddSkillsPerRank = addSkillsPerRank;
            SkillList = skillList;
        }
    }

    public class CharacteristicChoice
    {
        public string? Bonus { get; set; }

        public CharacteristicChoice(string? bonus = null)
        {
            Bonus = bonus;
        }
    }

    public class RosterMods
    {
        public bool? PilotOnly { get; set; }
        public int? DefAll { get; set; }

        public RosterMods(bool? pilotOnly = null, int? defAll = null)
        {
            PilotOnly = pilotOnly;
            DefAll = defAll;
        }
    }

    public class Damage
    {
        public int? Bonus { get; set; }
        public List<string>? Skills { get; set; }

        public Damage(int? bonus = null, List<string>? skills = null)
        {
            Bonus = bonus;
            Skills = skills;
        }
    }

    public class TalentQuality
    {
        public string? Key { get; set; }
        public int? Count { get; set; }
        public bool? UseForceRating { get; set; }

        public TalentQuality(string? key = null, int? count = null, bool? useForceRating = null)
        {
            Key = key;
            Count = count;
            UseForceRating = useForceRating;
        }
    }

    public class ItemChange
    {
        public string? ItemType { get; set; }
        public List<TalentQuality>? QualityChanges { get; set; }
        public int? DamageChange { get; set; }
        public List<string>? SkillKeys { get; set; }
        public int? EncumChange { get; set; }
        public bool? AddNewQualities { get; set; }
        public bool? UnarmedOnly { get; set; }
        public int? CritChange { get; set; }
        public bool? UpdateQualities { get; set; }

        public ItemChange(
            string? itemType = null,
            List<TalentQuality>? qualityChanges = null,
            int? damageChange = null,
            List<string>? skillKeys = null,
            int? encumChange = null,
            bool? addNewQualities = null,
            bool? unarmedOnly = null,
            int? critChange = null,
            bool? updateQualities = null
        )
        {
            ItemType = itemType;
            QualityChanges = qualityChanges;
            DamageChange = damageChange;
            SkillKeys = skillKeys;
            EncumChange = encumChange;
            AddNewQualities = addNewQualities;
            UnarmedOnly = unarmedOnly;
            CritChange = critChange;
            UpdateQualities = updateQualities;
        }
    }

    public class SkillChar
    {
        public string? SkillKey { get; set; }
        public string? CharKey { get; set; }

        public SkillChar(string? skillKey = null, string? charKey = null)
        {
            SkillKey = skillKey;
            CharKey = charKey;
        }
    }

    public class Mod
    {
        public string? Key { get; set; }
        public int? Count { get; set; }

        public Mod(string? key = null, int? count = null)
        {
            Key = key;
            Count = count;
        }
    }

    public class Rigger
    {
        public List<Mod>? BaseMods { get; set; }
        public int? SilhouetteAdd { get; set; }
        public bool? ChooseWeapon { get; set; }
        public List<Mod>? WeaponMods { get; set; }
        public bool? ChooseVehicle { get; set; }
        public int? SilhouetteBase { get; set; }

        public Rigger(
            List<Mod>? baseMods = null,
            int? silhouetteAdd = null,
            bool? chooseWeapon = null,
            List<Mod>? weaponMods = null,
            bool? chooseVehicle = null,
            int? silhouetteBase = null
        )
        {
            BaseMods = baseMods;
            SilhouetteAdd = silhouetteAdd;
            ChooseWeapon = chooseWeapon;
            WeaponMods = weaponMods;
            ChooseVehicle = chooseVehicle;
            SilhouetteBase = silhouetteBase;
        }
    }
}