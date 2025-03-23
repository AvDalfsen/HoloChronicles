namespace HoloChronicles.Server.Dataclasses
{
    public class Characteristic
    {
        public string? Key { get; set; }
        public string? Name { get; set; }
        public string? Abbrev { get; set; }
        public string? Description { get; set; }
        public List<string>? Sources { get; set; }

        public Characteristic(string? key = null, string? name = null, string? abbrev = null, string? description = null, List<string>? sources = null)
        {
            Key = key;
            Name = name;
            Abbrev = abbrev;
            Description = description;
            Sources = sources ?? new List<string>();
        }
    }
}