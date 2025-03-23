using System.Xml;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.Utils;

namespace HoloChronicles.Server.Services.XMLParsers
{
    public class SpeciesParser
    {
        public static List<Species> ParseSpeciesFromFiles(string folderpath)
        {
            var speciesList = new List<Species>();

            try
            {
                var xmlFiles = Directory.GetFiles(folderpath, "*.xml");

                foreach (var filePath in xmlFiles)
                {
                    XmlDocument doc = new XmlDocument();
                    doc.Load(filePath);

                    XmlElement? rootElement = doc.DocumentElement;
                    if (rootElement == null || rootElement.Name != "Species")
                    {
                        Console.WriteLine($"Skipping file: {filePath}. Root element is not <Species> or is missing.");
                        continue;
                    }

                    var species = ParseSpecies(rootElement);
                    speciesList.Add(species);
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine("Error parsing XML file: " + ex.Message);
            }

            return speciesList;
        }

        private static Species ParseSpecies(XmlElement speciesElement)
        {
            string key = speciesElement.SelectSingleNode("Key")?.InnerText ?? "";
            string name = speciesElement.SelectSingleNode("Name")?.InnerText ?? "";
            string description = DescriptionParser.ParseDescription(speciesElement);
            var sources = SourceParser.ParseSources(speciesElement);
            string custom = speciesElement.SelectSingleNode("Custom")?.InnerText ?? "";
            StartingChars? startingChars = ParseStartingChars(speciesElement);
            StartingAttrs? startingAttrs = ParseStartingAttrs(speciesElement);
            List<SkillModifier>? skillModifiers = ParseSkillModifiers(speciesElement);

            return new Species(key, name, description, sources, custom, startingChars, startingAttrs,
                               skillModifiers);
        }

        private static StartingChars? ParseStartingChars(XmlElement speciesElement)
        {
            XmlNode? startingCharsNode = speciesElement.SelectSingleNode("StartingChars");

            if (startingCharsNode == null)
            {
                return null;
            }

            return new StartingChars
            {
                Brawn = Converters.GetIntFromNode(startingCharsNode, "Brawn"),
                Agility = Converters.GetIntFromNode(startingCharsNode, "Agility"),
                Intellect = Converters.GetIntFromNode(startingCharsNode, "Intellect"),
                Cunning = Converters.GetIntFromNode(startingCharsNode, "Cunning"),
                Willpower = Converters.GetIntFromNode(startingCharsNode, "Willpower"),
                Presence = Converters.GetIntFromNode(startingCharsNode, "Presence")
            };
        }


        private static StartingAttrs? ParseStartingAttrs(XmlElement speciesElement)
        {
            XmlNode? startingAttrsNode = speciesElement.SelectSingleNode("StartingAttrs");

            if (startingAttrsNode == null)
            {
                return null;
            }

            return new StartingAttrs
            {
                WoundThreshold = Converters.GetIntFromNode(startingAttrsNode, "WoundThreshold"),
                StrainThreshold = Converters.GetIntFromNode(startingAttrsNode, "StrainThreshold"),
                Experience = Converters.GetIntFromNode(startingAttrsNode, "Experience"),
                DefenseRanged = Converters.GetIntFromNode(startingAttrsNode, "DefenseRanged"),
                DefenseMelee = Converters.GetIntFromNode(startingAttrsNode, "DefenseMelee"),
                SoakValue = Converters.GetIntFromNode(startingAttrsNode, "SoakValue"),
                ForceRating = Converters.GetIntFromNode(startingAttrsNode, "ForceRating"),
                EncumbranceBonus = Converters.GetIntFromNode(startingAttrsNode, "EncumbranceBonus")
            };
        }


        private static List<SkillModifier>? ParseSkillModifiers(XmlElement speciesElement)
        {
            List<SkillModifier> skillModifiers = new List<SkillModifier>();

            XmlNodeList? skillModifiersNodeList = speciesElement.GetElementsByTagName("SkillModifiers");
            if (skillModifiersNodeList.Count > 0)
            {
                XmlElement? skillModifiersNode = skillModifiersNodeList[0] as XmlElement;

                if (skillModifiersNode != null)
                {
                    XmlNodeList skillModifierNodeList = skillModifiersNode.GetElementsByTagName("SkillModifier");

                    foreach (XmlNode skillModifierNode in skillModifierNodeList)
                    {
                        SkillModifier skillModifier = new SkillModifier();

                        if (skillModifierNode is XmlElement sourceElement)
                        {
                            skillModifier.Key = sourceElement.SelectSingleNode("Key")?.InnerText ?? "";
                            skillModifier.RankStart = Converters.GetIntFromNode(sourceElement, "RankStart");
                            skillModifier.RankLimit = Converters.GetIntFromNode(sourceElement, "RankLimit");
                            skillModifier.RankAdd = Converters.GetIntFromNode(sourceElement, "RankAdd");
                            skillModifier.IsCareer = Converters.GetBoolFromNode(sourceElement, "IsCareer");
                            skillModifier.SkillType = sourceElement.SelectSingleNode("SkillType")?.InnerText ?? "";
                        }

                        skillModifiers.Add(skillModifier);
                    }
                }
            }

            return skillModifiers;
        }
    }
}
