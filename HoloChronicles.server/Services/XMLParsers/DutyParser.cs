using System.Xml.Linq;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.Utils;

namespace HoloChronicles.Server.Services.XMLParsers
{
    public class DutiesParser
    {
        public static List<Duty> ParseDutiesFromFile(string filepath)
        {
            var duties = new List<Duty>();

            try
            {
                var doc = XDocument.Load(filepath);
                return doc.Descendants("Duty")
                    .Select(el => new Duty(
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
                Console.WriteLine($"Error parsing Duties XML: {ex.Message}");
            }

            return duties;
        }
    }
}