namespace HoloChronicles.Server.Dataclasses
{
    public class Class
    {
        public string? Key { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public List<string>? Source { get; set; }
        public string? Custom { get; set; }

        public Class(string? key = null, string? name = null, string? description = null, List<string>? source = null, string? custom = null)
        {
            Key = key;
            Name = name;
            Description = description;
            Source = source ?? new List<string>();
            Custom = custom;
        }
    }
}