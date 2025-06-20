namespace HoloChronicles.Server.Dataclasses
{
    public class Duty
    {
        public string? Key { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public List<string>? Source { get; set; }
        public string? Custom { get; set; }

        public Duty(string? key = null, string? name = null, string? description = null, List<string>? source = null, string? custom = null)
        {
            Key = key;
            Name = name;
            Description = description;
            Source = source ?? new List<string>();
            Custom = custom;
        }
    }
}