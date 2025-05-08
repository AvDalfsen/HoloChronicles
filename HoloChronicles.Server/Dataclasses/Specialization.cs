using System.Text.Json.Serialization;

namespace HoloChronicles.Server.Dataclasses
{
    public class Direction
    {
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public bool Down { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public bool Up { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public bool Right { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public bool Left { get; set; }

        public Direction(bool down = false, bool up = false, bool right = false, bool left = false)
        {
            Down = down;
            Up = up;
            Right = right;
            Left = left;
        }
    }

    public class TalentRow
    {
        public int? Cost { get; set; }
        public List<string>? Talents { get; set; }
        public List<Direction>? Directions { get; set; }

        public TalentRow(int? cost = null, List<string>? talents = null, List<Direction>? directions = null)
        {
            Cost = cost;
            Talents = talents;
            Directions = directions;
        }
    }

    public class Requirement
    {
        public bool? WearingArmor { get; set; }
        public bool? Career { get; set; }
        public bool? Specialization { get; set; }
        public bool? NonCareer { get; set; }
        public int? SoakAtLeast { get; set; }
        public bool? WieldingMelee { get; set; }
        public bool? WieldingBrawl { get; set; }
        public bool? WieldingLightsaber { get; set; }
        public bool? MinForceRating { get; set; }

        public Requirement(
            bool? wearingArmor = null, bool? career = null, bool? specialization = null,
            bool? nonCareer = null, int? soakAtLeast = null, bool? wieldingMelee = null,
            bool? wieldingBrawl = null, bool? wieldingLightsaber = null, bool? minForceRating = null)
        {
            WearingArmor = wearingArmor;
            Career = career;
            Specialization = specialization;
            NonCareer = nonCareer;
            SoakAtLeast = soakAtLeast;
            WieldingMelee = wieldingMelee;
            WieldingBrawl = wieldingBrawl;
            WieldingLightsaber = wieldingLightsaber;
            MinForceRating = minForceRating;
        }
    }

    public class SpecializationAttributes
    {
        public int? WoundThreshold { get; set; }
        public int? StrainThreshold { get; set; }
        public int? DefenseRanged { get; set; }
        public int? DefenseMelee { get; set; }
        public int? SoakValue { get; set; }
        public int? Experience { get; set; }
        public int? ForceRating { get; set; }
        public Requirement? Requirement { get; set; }

        public SpecializationAttributes(
            int? woundThreshold = null, int? strainThreshold = null, int? defenseRanged = null,
            int? defenseMelee = null, int? soakValue = null, int? experience = null,
            int? forceRating = null, Requirement? requirement = null)
        {
            WoundThreshold = woundThreshold;
            StrainThreshold = strainThreshold;
            DefenseRanged = defenseRanged;
            DefenseMelee = defenseMelee;
            SoakValue = soakValue;
            Experience = experience;
            ForceRating = forceRating;
            Requirement = requirement;
        }
    }

    public class Requirements
    {
        public int? WoundThreshold { get; set; }
        public int? StrainThreshold { get; set; }
        public int? DefenseRanged { get; set; }
        public int? DefenseMelee { get; set; }
        public int? SoakValue { get; set; }
        public int? Experience { get; set; }
        public int? ForceRating { get; set; }

        public Requirements(
            int? woundThreshold = null, int? strainThreshold = null, int? defenseRanged = null,
            int? defenseMelee = null, int? soakValue = null, int? experience = null, int? forceRating = null)
        {
            WoundThreshold = woundThreshold;
            StrainThreshold = strainThreshold;
            DefenseRanged = defenseRanged;
            DefenseMelee = defenseMelee;
            SoakValue = soakValue;
            Experience = experience;
            ForceRating = forceRating;
        }
    }

    public class AddlCareerSkills
    {
        public int? SkillCount { get; set; }
        public bool? ChooseByType { get; set; }
        public string? TypeValue { get; set; }

        public AddlCareerSkills(
            int? skillCount = null, bool? chooseByType = null, string? typeValue = null)
        {
            SkillCount = skillCount;
            ChooseByType = chooseByType;
            TypeValue = typeValue;
        }
    }

    public class Specialization
    {
        public string? Key { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public List<string>? Sources { get; set; }
        public string? Custom { get; set; }
        public List<string>? CareerSkills { get; set; }
        public List<TalentRow>? TalentRows { get; set; }
        public bool? Universal { get; set; }
        public SpecializationAttributes? Attributes { get; set; }
        public Requirements? Requirements { get; set; }
        public List<AddlCareerSkills>? AddlCareerSkills { get; set; }

        public Specialization(
            string? key = null, string? name = null, string? description = null, List<string>? sources = null,
            string? custom = null, List<string>? careerSkills = null, List<TalentRow>? talentRows = null,
            bool? universal = null, SpecializationAttributes? attributes = null, Requirements? requirements = null,
            List<AddlCareerSkills>? addlCareerSkills = null)
        {
            Key = key;
            Name = name;
            Description = description;
            Sources = sources;
            Custom = custom;
            CareerSkills = careerSkills;
            TalentRows = talentRows;
            Universal = universal;
            Attributes = attributes;
            Requirements = requirements;
            AddlCareerSkills = addlCareerSkills;
        }
    }
}