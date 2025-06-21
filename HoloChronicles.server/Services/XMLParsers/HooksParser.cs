using System.Xml.Linq;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.Utils;

namespace HoloChronicles.Server.Services.XMLParsers
{
    public class HooksParser
    {
        public static List<Hook> ParseHooksFromFile(string filepath)
        {
            var hooks = new List<Hook>();

            try
            {
                var doc = XDocument.Load(filepath);
                return doc.Descendants("Hook")
                    .Select(el => new Hook(
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
                Console.WriteLine($"Error parsing Hook XML: {ex.Message}");
            }

            return hooks;
        }
    }
}