using System.Xml.Linq;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.Utils;

namespace HoloChronicles.Server.Services.XMLParsers
{
    public class SpecificMotivationsParser
    {
        public static List<SpecificMotivation> ParseSpecificMotivationsFromFile(string filepath)
        {
            var specificMotivations = new List<SpecificMotivation>();

            try
            {
                var doc = XDocument.Load(filepath);
                return doc.Descendants("SpecificMotivation")
                    .Select(el => new SpecificMotivation(
                        key: el.Get("Key"),
                        name: el.Get("Name"),
                        description: el.ParseDescription(),
                        source: el.ParseSources(),
                        custom: el.Get("Custom")
                    ))
                    .ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error parsing Specific Motivations XML: {ex.Message}");
            }

            return specificMotivations;
        }
    }
}