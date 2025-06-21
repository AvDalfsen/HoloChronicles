using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.Utils;
using System.Security.Claims;
using System.Xml.Linq;

namespace HoloChronicles.Server.Services.XMLParsers
{
    public class ClassesParser
    {
        public static List<Class> ParseClassesFromFile(string filepath)
        {
            var classes = new List<Class>();

            try
            {
                var doc = XDocument.Load(filepath);
                return doc.Descendants("Class")
                    .Select(el => new Class(
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
                Console.WriteLine($"Error parsing Classes XML: {ex.Message}");
            }

            return classes;
        }
    }
}