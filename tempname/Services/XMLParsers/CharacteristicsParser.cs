using System.Xml.Linq;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.Utils;

namespace HoloChronicles.Server.Services.XMLParsers
{
    public class CharacteristicsParser
    {
        public static List<Characteristic> ParseCharacteristicsFromFile(string filepath)
        {
            try
            {
                var doc = XDocument.Load(filepath);
                return doc.Descendants("Characteristic")
                    .Select(el => new Characteristic(
                        key: el.Get("Key"),
                        name: el.Get("Name"),
                        abbrev: el.Get("Abbrev"),
                        description: el.ParseDescription(),
                        sources: el.ParseSources()
                    ))
                    .ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error parsing Characteristics XML: " + ex.Message);
                return new List<Characteristic>();
            }
        }
    }
}