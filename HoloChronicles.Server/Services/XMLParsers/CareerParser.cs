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
            List<string>? careerSkills = ParseList(careerElement, "CareerSkills/Key");
            List<string>? specializations = ParseList(careerElement, "Specializations/Key");
            int? forceRating = Converters.GetIntFromNode(careerElement, "ForceRating");
            int? freeRanks = Converters.GetIntFromNode(careerElement, "FreeRanks");
            Attributes? attributes = ParseAttributes(careerElement.SelectSingleNode("Attributes") as XmlElement);

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

        private static Attributes? ParseAttributes(XmlElement? attributesElement)
        {
            if (attributesElement == null) return null;

            int? woundThreshold = Converters.GetIntFromNode(attributesElement, "WoundThreshold");
            int? strainThreshold = Converters.GetIntFromNode(attributesElement, "StrainThreshold");
            int? defenseRanged = Converters.GetIntFromNode(attributesElement, "DefenseRanged");
            int? defenseMelee = Converters.GetIntFromNode(attributesElement, "DefenseMelee");
            int? soakValue = Converters.GetIntFromNode(attributesElement, "SoakValue");
            int? experience = Converters.GetIntFromNode(attributesElement, "Experience");
            int? forceRating = Converters.GetIntFromNode(attributesElement, "ForceRating");

            var requirement = ParseRequirement(attributesElement.SelectSingleNode("Requirement") as XmlElement);

            return new Attributes(woundThreshold, strainThreshold, defenseRanged, defenseMelee, soakValue, experience, forceRating, requirement);
        }

        private static CareerRequirement? ParseRequirement(XmlElement? requirementElement)
        {
            if (requirementElement == null) return null;

            bool? wearingArmor = Converters.GetBoolFromNode(requirementElement, "WearingArmor");
            bool? career = Converters.GetBoolFromNode(requirementElement, "Career");
            bool? specialization = Converters.GetBoolFromNode(requirementElement, "Specialization");
            bool? nonCareer = Converters.GetBoolFromNode(requirementElement, "NonCareer");
            int? soakAtLeast = Converters.GetIntFromNode(requirementElement, "SoakAtLeast");

            return new CareerRequirement(wearingArmor, career, specialization, nonCareer, soakAtLeast);
        }
    }
}
