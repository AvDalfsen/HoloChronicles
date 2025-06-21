using System.Xml.Linq;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.Utils;

namespace HoloChronicles.Server.Services.XMLParsers
{
    public class AttitudesParser
    {
        public static List<Attitude> ParseAttitudesFromFile(string filepath)
        {
            var attitudes = new List<Attitude>();

            try
            {
                var doc = XDocument.Load(filepath);
                return doc.Descendants("Attitude")
                    .Select(el => new Attitude(
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
                Console.WriteLine($"Error parsing Attitudes XML: {ex.Message}");
            }

            return attitudes;
        }
    }
}