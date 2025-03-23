namespace HoloChronicles.Server.Dataclasses
{
    public class Skill
    {
        public string? Key { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? CharKey { get; set; }
        public string? TypeValue { get; set; }
        public List<string>? Source { get; set; }

        public Skill(string? key = null, string? name = null, string? description = null, string? charKey = null, string? typeValue = null, List<string>? source = null)
        {
            Key = key;
            Name = name;
            Description = description;
            CharKey = charKey;
            TypeValue = typeValue;
            Source = source ?? new List<string>();
        }
    }
}
