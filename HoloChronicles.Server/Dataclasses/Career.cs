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

        // Constructor
        public Career(string? key = null, string? name = null, string? description = null,
                      List<string>? sources = null, List<string>? careerSkills = null,
                      List<string>? specializations = null, int? forceRating = null, int? freeRanks = null)
        {
            Key = key;
            Name = name;
            Description = description;
            Sources = sources ?? new List<string>();
            CareerSkills = careerSkills ?? new List<string>();
            Specializations = specializations ?? new List<string>();
            ForceRating = forceRating;
            FreeRanks = freeRanks;
        }
    }

}
