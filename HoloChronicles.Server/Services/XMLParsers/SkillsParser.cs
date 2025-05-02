using System.Xml.Linq;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.Utils;

namespace HoloChronicles.Server.Services.XMLParsers
{
    public class SkillsParser
    {
        public static List<Skill> ParseSkillsFromFile(string filepath)
        {
            var skills = new List<Skill>();

            try
            {
                var doc = XDocument.Load(filepath);
                return doc.Descendants("Skill")
                    .Select(el => new Skill(
                        key: el.Get("Key"),
                        name: el.Get("Name"),
                        description: el.ParseDescription(),
                        charKey: el.Get("CharKey"),
                        typeValue: el.Get("TypeValue"),
                        source: el.ParseSources()
                    ))
                    .ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error parsing Skills XML: {ex.Message}");
            }

            return skills;
        }
    }
}