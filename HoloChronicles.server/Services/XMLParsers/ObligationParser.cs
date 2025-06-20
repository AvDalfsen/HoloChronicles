using System.Xml.Linq;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.Utils;

namespace HoloChronicles.Server.Services.XMLParsers
{
    public class ObligationsParser
    {
        public static List<Obligation> ParseObligationsFromFile(string filepath)
        {
            var obligations = new List<Obligation>();

            try
            {
                var doc = XDocument.Load(filepath);
                return doc.Descendants("Obligation")
                    .Select(el => new Obligation(
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
                Console.WriteLine($"Error parsing Obligations XML: {ex.Message}");
            }

            return obligations;
        }
    }
}