using System.Xml;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.Utils;

namespace HoloChronicles.Server.Services.XMLParsers
{
    public class CareerParser
    {
        public static List<Career> ParseCareersFromFiles(string folderpath)
        {
            var careerList = new List<Career>();

            try
            {
                var xmlFiles = Directory.GetFiles(folderpath, "*.xml");

                foreach (var filePath in xmlFiles)
                {
                    XmlDocument doc = new XmlDocument();
                    doc.Load(filePath);

                    XmlElement? rootElement = doc.DocumentElement;
                    if (rootElement == null || rootElement.Name != "Career")
                    {
                        Console.WriteLine($"Skipping file: {filePath}. Root element is not <Career> or is missing.");
                        continue;
                    }

                    Career career = ParseCareer(rootElement);
                    careerList.Add(career);
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine("Error parsing XML file: " + ex.Message);
            }

            return careerList;
        }

        private static Career ParseCareer(XmlElement careerElement)
        {
            string? key = careerElement.SelectSingleNode("Key")?.InnerText;
            string? name = careerElement.SelectSingleNode("Name")?.InnerText;
            string? description = DescriptionParser.ParseDescription(careerElement);
            var sources = SourceParser.ParseSources(careerElement);
            string? custom = careerElement.SelectSingleNode("Custom")?.InnerText;
            bool? noForceAbilities = Converters.GetBoolFromNode(careerElement, "NoForceAbilities");
            int? cyberneticsAdjust = Converters.GetIntFromNode(careerElement, "CyberneticsAdjust");

            return new Career(key, name, description, sources);
        }
    }
}
