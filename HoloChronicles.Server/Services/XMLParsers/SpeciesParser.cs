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
                    try
                    {
                        XmlDocument doc = new XmlDocument();
                        doc.Load(filePath);

                        XmlElement? rootElement = doc.DocumentElement;
                        if (rootElement == null || rootElement.Name != "Species")
                        {
                            Console.WriteLine($"Skipping file: {filePath}. Root element is not <Species> or is missing.");
                            continue;
                        }

                        Species species = ParseSpecies(rootElement);
                        speciesList.Add(species);
                    }
                    catch (XmlException ex)
                    {
                        Console.WriteLine($"Error parsing XML file {filePath}: {ex.Message}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Unexpected error processing file {filePath}: {ex.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error accessing folder {folderpath}: {ex.Message}");
            }

            return speciesList;
        }

        private static Species ParseSpecies(XmlElement speciesElement)
        {
            string? key = speciesElement.SelectSingleNode("Key")?.InnerText;
            string? name = speciesElement.SelectSingleNode("Name")?.InnerText;
            string? description = DescriptionParser.ParseDescription(speciesElement);
            var sources = SourceParser.ParseSources(speciesElement);
            string? custom = speciesElement.SelectSingleNode("Custom")?.InnerText;
            StartingChars? startingChars = ParseStartingChars(speciesElement);
            StartingAttrs? startingAttrs = ParseStartingAttrs(speciesElement);
            List<SkillModifier>? skillModifiers = ParseSkillModifiers(speciesElement);
            List<TalentModifier>? talentModifiers = ParseTalentModifiers(speciesElement);
            List<OptionChoice>? optionChoices = ParseOptionChoices(speciesElement);
            List<SubSpecies>? subSpecies = ParseSubSpecies(speciesElement);
            List<WeaponModifier>? weaponModifiers = ParseWeaponModifiers(speciesElement);
            bool? noForceAbilities = Converters.GetBoolFromNode(speciesElement,"NoForceAbilities");
            int? cyberneticsAdjust = Converters.GetIntFromNode(speciesElement, "CyberneticsAdjust");

            return new Species(key, name, description, sources, custom, startingChars, startingAttrs,
                               skillModifiers, talentModifiers, optionChoices, subSpecies, weaponModifiers, 
                               noForceAbilities, cyberneticsAdjust);
        }

        private static List<SkillModifier>? ParseSkillModifiers(XmlElement speciesElement)
        {
            var skillModifiers = new List<SkillModifier>();

            try
            {
                XmlNodeList? skillModifiersNodeList = speciesElement.GetElementsByTagName("SkillModifiers");
                if (skillModifiersNodeList.Count > 0)
                {
                    XmlElement? skillModifiersNode = skillModifiersNodeList[0] as XmlElement;

                    if (skillModifiersNode != null)
                    {
                        XmlNodeList skillModifierNodeList = skillModifiersNode.GetElementsByTagName("SkillModifier");

                        foreach (XmlNode skillModifierNode in skillModifierNodeList)
                        {
                            if (skillModifierNode is XmlElement skillModifierElement)
                            {
                                try
                                {
                                    string? key = skillModifierElement.SelectSingleNode("Key")?.InnerText;
                                    int? rankStart = Converters.GetIntFromNode(skillModifierElement, "RankStart");
                                    int? rankLimit = Converters.GetIntFromNode(skillModifierElement, "RankLimit");
                                    int? rankAdd = Converters.GetIntFromNode(skillModifierElement, "RankAdd");
                                    bool? isCareer = Converters.GetBoolFromNode(skillModifierElement, "IsCareer");
                                    string? skillType = skillModifierElement.SelectSingleNode("SkillType")?.InnerText;

                                    skillModifiers.Add(new SkillModifier(key, rankStart, rankLimit, rankAdd, isCareer, skillType));
                                }
                                catch (Exception ex)
                                {
                                    Console.WriteLine($"Error parsing SkillModifier: {ex.Message}");
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error parsing SkillModifiers: {ex.Message}");
            }

            return skillModifiers;
        }

        private static List<SubSpecies>? ParseSubSpecies(XmlElement speciesElement)
        {
            List<SubSpecies>? subSpeciesList = new List<SubSpecies>();

            XmlNodeList? subSpeciesListNodeList = speciesElement.GetElementsByTagName("SubSpeciesList");
            if (subSpeciesListNodeList.Count > 0)
            {
                XmlElement? subSpeciesListNode = subSpeciesListNodeList[0] as XmlElement;

                if (subSpeciesListNode != null)
                {
                    XmlNodeList subSpeciesNodeList = subSpeciesListNode.GetElementsByTagName("SubSpecies");

                    foreach (XmlNode subSpeciesNode in subSpeciesNodeList)
                    {
                        SubSpecies subSpecies = new SubSpecies();

                        if (subSpeciesNode is XmlElement subSpeciesElement)
                        {
                            subSpecies.Key = subSpeciesElement.SelectSingleNode("Key")?.InnerText;
                            subSpecies.Name = subSpeciesElement.SelectSingleNode("Name")?.InnerText;
                            subSpecies.Description = DescriptionParser.ParseDescription(subSpeciesElement);
                            subSpecies.StartingChars = ParseStartingChars(subSpeciesElement);
                            subSpecies.StartingAttrs = ParseStartingAttrs(subSpeciesElement);
                            subSpecies.SkillModifiers = ParseSkillModifiers(subSpeciesElement);
                            subSpecies.OptionChoices = ParseOptionChoices(subSpeciesElement);
                            subSpecies.CyberneticsAdjust = Converters.GetIntFromNode(subSpeciesElement, "CyberneticsAdjust");
                            subSpecies.WeaponModifiers = ParseWeaponModifiers(speciesElement);
                            subSpecies.TalentModifiers = ParseTalentModifiers(subSpeciesElement);
                        }

                        subSpeciesList.Add(subSpecies);
                    }
                }
            }

            return subSpeciesList;
        }

        private static List<TalentModifier>? ParseTalentModifiers(XmlElement speciesElement)
        {
            List<TalentModifier>? talentModifierList = new List<TalentModifier>();

            XmlNodeList? talentModifiersNodeList = speciesElement.GetElementsByTagName("TalentModifiers");
            if (talentModifiersNodeList.Count > 0)
            {
                XmlElement? talentModifiersNode = talentModifiersNodeList[0] as XmlElement;

                if (talentModifiersNode != null)
                {
                    XmlNodeList talentModifierNodeList = talentModifiersNode.GetElementsByTagName("TalentModifier");

                    foreach (XmlNode talentModifierNode in talentModifierNodeList)
                    {
                        TalentModifier talentModifier = new TalentModifier();

                        if (talentModifierNode is XmlElement talentModifierElement)
                        {
                            talentModifier.Key = talentModifierElement.SelectSingleNode("Key")?.InnerText;
                            talentModifier.RankAdd = Converters.GetIntFromNode(talentModifierElement, "RankAdd");
                        }

                        talentModifierList.Add(talentModifier);
                    }
                }
            }

            return talentModifierList;
        }

        private static List<OptionChoice>? ParseOptionChoices(XmlElement speciesElement)
        {
            List<OptionChoice>? optionChoiceList = new List<OptionChoice>();

            XmlNodeList? optionChoicseNodeList = speciesElement.GetElementsByTagName("OptionChoices");
            if (optionChoicseNodeList.Count > 0)
            {
                XmlElement? optionChoicesNode = optionChoicseNodeList[0] as XmlElement;

                if (optionChoicesNode != null)
                {
                    XmlNodeList optionChoiceNodeList = optionChoicesNode.GetElementsByTagName("OptionChoice");

                    foreach (XmlNode optionChoiceNode in optionChoiceNodeList)
                    {
                        OptionChoice optionChoice = new OptionChoice();

                        if (optionChoiceNode is XmlElement optionChoiceElement)
                        {
                            optionChoice.Key = optionChoiceElement.SelectSingleNode("Key")?.InnerText;
                            optionChoice.Name = optionChoiceElement.SelectSingleNode("Name")?.InnerText;
                            optionChoice.Options = ParseOptions(optionChoiceElement);
                        }

                        optionChoiceList.Add(optionChoice);
                    }
                }
            }

            return optionChoiceList;
        }

        private static List<Option>? ParseOptions(XmlElement speciesElement)
        {
            List<Option>? optionList = new List<Option>();

            XmlNodeList? optionsNodeList = speciesElement.GetElementsByTagName("Options");
            if (optionsNodeList.Count > 0)
            {
                XmlElement? optionsNode = optionsNodeList[0] as XmlElement;

                if (optionsNode != null)
                {
                    XmlNodeList optionNodeList = optionsNode.GetElementsByTagName("Option");

                    foreach (XmlNode optionNode in optionNodeList)
                    {
                        Option option = new Option();

                        if (optionNode is XmlElement optionElement)
                        {
                            option.Key = optionElement.SelectSingleNode("Key")?.InnerText;
                            option.Name = optionElement.SelectSingleNode("Name")?.InnerText;
                            option.Description = DescriptionParser.ParseDescription(optionElement);
                            option.SkillModifiers = ParseSkillModifiers(optionElement);
                            option.DieModifiers = ParseDieModifiers(optionElement);
                            option.StartingSkillTraining = ParseSkillTraining(optionElement);
                            option.Experience = Converters.GetIntFromNode(optionElement, "StartingAttributes/Experience");
                            option.TalentModifiers = ParseTalentModifiers(optionElement);
                        }

                        optionList.Add(option);
                    }
                }
            }

            return optionList;
        }

        private static List<DieModifier>? ParseDieModifiers(XmlElement speciesElement)
        {
            List<DieModifier>? dieModifierList = new List<DieModifier>();

            XmlNodeList? dieModifiersList = speciesElement.GetElementsByTagName("DieModifiers");
            if (dieModifiersList.Count > 0)
            {
                XmlElement? dieModifiersNode = dieModifiersList[0] as XmlElement;

                if (dieModifiersNode != null)
                {
                    XmlNodeList dieModifierNodeList = dieModifiersNode.GetElementsByTagName("DieModifier");

                    foreach (XmlNode dieModifierNode in dieModifierNodeList)
                    {
                        DieModifier dieModifier = new DieModifier();

                        if (dieModifierNode is XmlElement dieModifierElement)
                        {
                            dieModifier.SkillKey = dieModifierElement.SelectSingleNode("SkillKey")?.InnerText;
                            dieModifier.AdvantageCount = Converters.GetIntFromNode(dieModifierElement, "AdvantageCount");
                            dieModifier.SkillType = dieModifierElement.SelectSingleNode("SkillType")?.InnerText; 
                            dieModifier.BoostCount = Converters.GetIntFromNode(dieModifierElement, "BoostCount");
                            dieModifier.SetbackCount = Converters.GetIntFromNode(dieModifierElement, "SetbackCount");
                            dieModifier.SuccessCount = Converters.GetIntFromNode(dieModifierElement, "SuccessCount");
                            dieModifier.AddSetbackCount = Converters.GetIntFromNode(dieModifierElement, "AddSetbackCount");
                        }

                        dieModifierList.Add(dieModifier);
                    }
                }
            }

            return dieModifierList;
        }

        private static List<WeaponModifier>? ParseWeaponModifiers(XmlElement speciesElement)
        {
            List<WeaponModifier>? weaponModifierList = new List<WeaponModifier>();

            XmlNodeList? weaponModifiersNodeList = speciesElement.GetElementsByTagName("WeaponModifiers");
            if (weaponModifiersNodeList.Count > 0)
            {
                XmlElement? weaponModifiersNode = weaponModifiersNodeList[0] as XmlElement;

                if (weaponModifiersNode != null)
                {
                    XmlNodeList weaponModifierNodeList = weaponModifiersNode.GetElementsByTagName("WeaponModifier");

                    foreach (XmlNode weaponModifierNode in weaponModifierNodeList)
                    {
                        WeaponModifier weaponModifier = new WeaponModifier();

                        if (weaponModifierNode is XmlElement weaponModifierElement)
                        {
                            weaponModifier.AllSkillKey = weaponModifierElement.SelectSingleNode("AllSkillKey")?.InnerText;
                            weaponModifier.DamageAdd = Converters.GetIntFromNode(weaponModifierElement, "DamageAdd");
                            weaponModifier.Crit = Converters.GetIntFromNode(weaponModifierElement, "Crit");
                            weaponModifier.Range = weaponModifierElement.SelectSingleNode("Range")?.InnerText;
                            weaponModifier.UnarmedName = weaponModifierElement.SelectSingleNode("UnarmedName")?.InnerText;
                            weaponModifier.SkillKey = weaponModifierElement.SelectSingleNode("SkillKey")?.InnerText;
                            weaponModifier.Damage = Converters.GetIntFromNode(weaponModifierElement, "Damage");
                            weaponModifier.Qualities = ParseQualities(weaponModifierElement);
                            weaponModifier.RangeValue = weaponModifierElement.SelectSingleNode("RangeValue")?.InnerText;
                        }

                        weaponModifierList.Add(weaponModifier);
                    }
                }
            }

            return weaponModifierList;
        }

        private static List<Quality>? ParseQualities(XmlElement speciesElement)
        {
            List<Quality>? qualityList = new List<Quality>();

            XmlNodeList? qualitiesNodeList = speciesElement.GetElementsByTagName("Qualities");
            if (qualitiesNodeList.Count > 0)
            {
                XmlElement? qualitiesNode = qualitiesNodeList[0] as XmlElement;

                if (qualitiesNode != null)
                {
                    XmlNodeList qualityNodeList = qualitiesNode.GetElementsByTagName("Quality");

                    foreach (XmlNode qualityNode in qualityNodeList)
                    {
                        Quality quality = new Quality();

                        if (qualityNode is XmlElement qualityElement)
                        {
                            quality.Key = qualityElement.SelectSingleNode("Key")?.InnerText;
                            quality.Count = Converters.GetIntFromNode(qualityElement, "Count");
                        }

                        qualityList.Add(quality);
                    }
                }
            }

            return qualityList;
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

        private static List<SkillTraining>? ParseSkillTraining(XmlElement optionElement)
        {
            List<SkillTraining> skillTrainingList = new List<SkillTraining>();

            XmlNodeList? skillTrainingNodes = optionElement.GetElementsByTagName("SkillTraining");
            if (skillTrainingNodes != null)
            {
                foreach (XmlNode skillTrainingNode in skillTrainingNodes)
                {
                    if (skillTrainingNode is XmlElement skillTrainingElement)
                    {
                        int? skillCount = Converters.GetIntFromNode(skillTrainingElement, "SkillCount");
                        var requirement = ParseSpeciesRequirement(skillTrainingElement.SelectSingleNode("Requirement") as XmlElement);

                        skillTrainingList.Add(new SkillTraining(skillCount, requirement));
                    }
                }
            }

            return skillTrainingList;
        }

        private static SpeciesRequirement? ParseSpeciesRequirement(XmlElement? requirementElement)
        {
            if (requirementElement == null) return null;

            string? career = requirementElement.SelectSingleNode("Career")?.InnerText;
            string? specialization = requirementElement.SelectSingleNode("Specialization")?.InnerText;
            string? fromSkillType = requirementElement.SelectSingleNode("FromSkillType")?.InnerText;
            string? skillType = requirementElement.SelectSingleNode("SkillType")?.InnerText;
            string? nonCareer = requirementElement.SelectSingleNode("NonCareer")?.InnerText;

            return new SpeciesRequirement(career, specialization, fromSkillType, skillType, nonCareer);
        }
    }
}
