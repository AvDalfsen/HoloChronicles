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
            var careerSkills = ParseList(careerElement, "CareerSkills/Key");
            var specializations = ParseList(careerElement, "Specializations/Key");
            int? forceRating = ParseNullableInt(careerElement.SelectSingleNode("ForceRating")?.InnerText);
            int? freeRanks = ParseNullableInt(careerElement.SelectSingleNode("FreeRanks")?.InnerText);
            var attributes = ParseAttributes(careerElement.SelectSingleNode("Attributes") as XmlElement);

            return new Career(key, name, description, sources, careerSkills, specializations, forceRating, freeRanks, attributes);
        }

        private static List<string> ParseList(XmlElement parentElement, string xpath)
        {
            var list = new List<string>();
            var nodes = parentElement.SelectNodes(xpath);
            if (nodes != null)
            {
                foreach (XmlNode node in nodes)
                {
                    if (node.InnerText != null)
                    {
                        list.Add(node.InnerText);
                    }
                }
            }
            return list;
        }

        private static int? ParseNullableInt(string? value)
        {
            if (int.TryParse(value, out int result))
            {
                return result;
            }
            return null;
        }

        private static Attributes? ParseAttributes(XmlElement? attributesElement)
        {
            if (attributesElement == null) return null;

            int woundThreshold = ParseNullableInt(attributesElement.SelectSingleNode("WoundThreshold")?.InnerText) ?? 0;
            int strainThreshold = ParseNullableInt(attributesElement.SelectSingleNode("StrainThreshold")?.InnerText) ?? 0;
            int defenseRanged = ParseNullableInt(attributesElement.SelectSingleNode("DefenseRanged")?.InnerText) ?? 0;
            int defenseMelee = ParseNullableInt(attributesElement.SelectSingleNode("DefenseMelee")?.InnerText) ?? 0;
            int soakValue = ParseNullableInt(attributesElement.SelectSingleNode("SoakValue")?.InnerText) ?? 0;
            int experience = ParseNullableInt(attributesElement.SelectSingleNode("Experience")?.InnerText) ?? 0;
            int forceRating = ParseNullableInt(attributesElement.SelectSingleNode("ForceRating")?.InnerText) ?? 0;

            var requirement = ParseRequirement(attributesElement.SelectSingleNode("Requirement") as XmlElement);

            return new Attributes(woundThreshold, strainThreshold, defenseRanged, defenseMelee, soakValue, experience, forceRating, requirement);
        }

        private static CareerRequirement? ParseRequirement(XmlElement? requirementElement)
        {
            if (requirementElement == null) return null;

            bool wearingArmor = bool.TryParse(requirementElement.SelectSingleNode("WearingArmor")?.InnerText, out bool armor) && armor;
            bool career = bool.TryParse(requirementElement.SelectSingleNode("Career")?.InnerText, out bool isCareer) && isCareer;
            bool specialization = bool.TryParse(requirementElement.SelectSingleNode("Specialization")?.InnerText, out bool isSpecialization) && isSpecialization;
            bool nonCareer = bool.TryParse(requirementElement.SelectSingleNode("NonCareer")?.InnerText, out bool isNonCareer) && isNonCareer;
            int soakAtLeast = ParseNullableInt(requirementElement.SelectSingleNode("SoakAtLeast")?.InnerText) ?? 0;

            return new CareerRequirement(wearingArmor, career, specialization, nonCareer, soakAtLeast);
        }
    }
}
