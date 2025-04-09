namespace HoloChronicles.Server.Dataclasses
{
    public class Career
    {
        public string? Key { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public List<string>? Sources { get; set; }
        public List<string>? CareerSkills { get; set; }
        public List<string>? Specializations { get; set; }
        public int? ForceRating { get; set; }
        public int? FreeRanks { get; set; }
        public Attributes? Attributes { get; set; }

        // Constructor
        public Career(string? key = null, string? name = null, string? description = null,
                      List<string>? sources = null, List<string>? careerSkills = null,
                      List<string>? specializations = null, int? forceRating = null, int? freeRanks = null,
                      Attributes? attributes = null)
        {
            Key = key;
            Name = name;
            Description = description;
            Sources = sources ?? new List<string>();
            CareerSkills = careerSkills ?? new List<string>();
            Specializations = specializations ?? new List<string>();
            ForceRating = forceRating;
            FreeRanks = freeRanks;
            Attributes = attributes;
        }
    }

    public class Attributes
    {
        public int? WoundThreshold { get; set; }
        public int? StrainThreshold { get; set; }
        public int? DefenseRanged { get; set; }
        public int? DefenseMelee { get; set; }
        public int? SoakValue { get; set; }
        public int? Experience { get; set; }
        public int? ForceRating { get; set; }
        public CareerRequirement? Requirement { get; set; } // Nested Requirement class

        // Constructor
        public Attributes(int? woundThreshold = null, int? strainThreshold = null, int? defenseRanged = null,
                          int? defenseMelee = null, int? soakValue = null, int? experience = null, int? forceRating = null,
                          CareerRequirement? requirement = null)
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

    public class CareerRequirement
    {
        public bool? WearingArmor { get; set; }
        public bool? Career { get; set; }
        public bool? Specialization { get; set; }
        public bool? NonCareer { get; set; }
        public int? SoakAtLeast { get; set; }

        // Constructor
        public CareerRequirement(bool? wearingArmor = null, bool? career = null, bool? specialization = null,
                           bool? nonCareer = null, int? soakAtLeast = null)
        {
            WearingArmor = wearingArmor;
            Career = career;
            Specialization = specialization;
            NonCareer = nonCareer;
            SoakAtLeast = soakAtLeast;
        }
    }
}