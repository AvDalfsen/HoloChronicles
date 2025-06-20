using System.Xml.Linq;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.Utils;

namespace HoloChronicles.Server.Services.XMLParsers
{
    public class MotivationsParser
    {
        public static List<Motivation> ParseMotivationsFromFile(string filepath)
        {
            var motivations = new List<Motivation>();

            try
            {
                var doc = XDocument.Load(filepath);
                return doc.Descendants("Motivation")
                    .Select(el => new Motivation(
                        key: el.Get("Key"),
                        name: el.Get("Name"),
                        description: el.ParseDescription(),
                        source: el.ParseSources(),
                        custom: el.Get("Custom"),
                        specificMotivations: el.Element("SpecificMotivations")?
                                  .Elements("Key")
                                  .Select(k => k.Value)
                                  .ToList()
                               ?? new List<string>()
                    ))
                    .ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error parsing Motivations XML: {ex.Message}");
            }

            return motivations;
        }
    }
}