using System.Xml.Linq;
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
                        var doc = XDocument.Load(filePath);
                        var root = doc.Root;

                        if (root == null || root.Name != "Species")
                        {
                            Console.WriteLine($"Skipping file: {filePath}. Root element is not <Species> or is missing.");
                            continue;
                        }

                        Species species = ParseSpecies(root);
                        speciesList.Add(species);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error parsing file {filePath}: {ex.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error accessing folder {folderpath}: {ex.Message}");
            }

            return speciesList;
        }

        private static Species ParseSpecies(XElement el)
        {
            return new Species(
                key: el.Get("Key"),
                name: el.Get("Name"),
                description: el.ParseDescription(),
                sources: el.ParseSources(),
                custom: el.Get("Custom"),
                startingChars: ParseStartingChars(el.Element("StartingChars")),
                startingAttrs: ParseStartingAttrs(el.Element("StartingAttrs")),
                skillModifiers: ParseSkillModifiers(el),
                talentModifiers: ParseTalentModifiers(el),
                optionChoices: ParseOptionChoices(el),
                subSpeciesList: ParseSubSpecies(el),
                weaponModifiers: ParseWeaponModifiers(el),
                noForceAbilities: el.GetBool("NoForceAbilities"),
                cyberneticsAdjust: el.GetInt("CyberneticsAdjust")
            );
        }

        private static StartingChars? ParseStartingChars(XElement? el)
        {
            if (el == null) return null;

            return new StartingChars(
                brawn: el.GetInt("Brawn"),
                agility: el.GetInt("Agility"),
                intellect: el.GetInt("Intellect"),
                cunning: el.GetInt("Cunning"),
                willpower: el.GetInt("Willpower"),
                presence: el.GetInt("Presence")
            );
        }

        private static StartingAttrs? ParseStartingAttrs(XElement? el)
        {
            if (el == null) return null;
            return new StartingAttrs(
                woundThreshold: el.GetInt("WoundThreshold"),
                strainThreshold: el.GetInt("StrainThreshold"),
                defenseRanged: el.GetInt("DefenseRanged"),
                defenseMelee: el.GetInt("DefenseMelee"),
                soakValue: el.GetInt("SoakValue"),
                experience: el.GetInt("Experience"),
                forceRating: el.GetInt("ForceRating")
            );
        }

        private static List<SkillModifier>? ParseSkillModifiers(XElement el)
        {
            return el.Element("SkillModifiers")?
                     .Elements("SkillModifier")
                     .Select(sm => new SkillModifier(
                         key: sm.Get("Key"),
                         rankStart: sm.GetInt("RankStart"),
                         rankLimit: sm.GetInt("RankLimit"),
                         rankAdd: sm.GetInt("RankAdd"),
                         isCareer: sm.GetBool("IsCareer"),
                         skillType: sm.Get("SkillType")
                     ))
                     .ToList();
        }

        private static List<TalentModifier>? ParseTalentModifiers(XElement el)
        {
            return el.Element("TalentModifiers")?
                     .Elements("TalentModifier")
                     .Select(tm => new TalentModifier
                     {
                         Key = tm.Get("Key"),
                         RankAdd = tm.GetInt("RankAdd")
                     })
                     .ToList();
        }

        private static List<OptionChoice>? ParseOptionChoices(XElement el)
        {
            return el.Element("OptionChoices")?
                     .Elements("OptionChoice")
                     .Select(oc => new OptionChoice
                     {
                         Key = oc.Get("Key"),
                         Name = oc.Get("Name"),
                         Options = ParseOptions(oc)
                     })
                     .ToList();
        }

        private static List<Option>? ParseOptions(XElement el)
        {
            return el.Element("Options")?
                     .Elements("Option")
                     .Select(o => new Option
                     {
                         Key = o.Get("Key"),
                         Name = o.Get("Name"),
                         Description = o.ParseDescription(),
                         SkillModifiers = ParseSkillModifiers(o),
                         DieModifiers = ParseDieModifiers(o),
                         StartingSkillTraining = ParseSkillTraining(o),
                         Experience = o.Element("StartingAttributes")?.GetInt("Experience"),
                         TalentModifiers = ParseTalentModifiers(o)
                     })
                     .ToList();
        }

        private static List<SubSpecies>? ParseSubSpecies(XElement el)
        {
            return el.Element("SubSpeciesList")?
                     .Elements("SubSpecies")
                     .Select(ss => new SubSpecies
                     {
                         Key = ss.Get("Key"),
                         Name = ss.Get("Name"),
                         Description = ss.ParseDescription(),
                         StartingChars = ParseStartingChars(ss.Element("StartingChars")),
                         StartingAttrs = ParseStartingAttrs(ss.Element("StartingAttrs"))
                     })
                     .ToList();
        }

        private static List<WeaponModifier>? ParseWeaponModifiers(XElement el)
        {
            return el.Element("WeaponModifiers")?
                     .Elements("WeaponModifier")
                     .Select(wm => new WeaponModifier
                     {
                         AllSkillKey = wm.Get("AllSkillKey"),
                         DamageAdd = wm.GetInt("DamageAdd"),
                         Crit = wm.GetInt("Crit"),
                         Range = wm.Get("Range"),
                         UnarmedName = wm.Get("UnarmedName"),
                         SkillKey = wm.Get("SkillKey"),
                         Damage = wm.GetInt("Damage"),
                         Qualities = ParseQualities(wm),
                         RangeValue = wm.Get("RangeValue")
                     })
                     .ToList();
        }

        private static List<Quality>? ParseQualities(XElement el)
        {
            return el.Element("Qualities")?
                     .Elements("Quality")
                     .Select(q => new Quality
                     {
                         Key = q.Get("Key"),
                         Count = q.GetInt("Count")
                     })
                     .ToList();
        }

        private static List<DieModifier>? ParseDieModifiers(XElement el)
        {
            return el.Element("DieModifiers")?
                     .Elements("DieModifier")
                     .Select(dm => new DieModifier
                     {
                         SkillKey = dm.Get("SkillKey"),
                         AdvantageCount = dm.GetInt("AdvantageCount"),
                         SkillType = dm.Get("SkillType"),
                         BoostCount = dm.GetInt("BoostCount"),
                         SetbackCount = dm.GetInt("SetbackCount"),
                         SuccessCount = dm.GetInt("SuccessCount"),
                         AddSetbackCount = dm.GetInt("AddSetbackCount")
                     })
                     .ToList();
        }

        private static List<SkillTraining>? ParseSkillTraining(XElement el)
        {
            return el.Element("StartingSkillTraining")?
                     .Elements("SkillTraining")
                     .Select(st => new SkillTraining(
                         skillCount: st.GetInt("SkillCount"),
                         requirement: ParseSpeciesRequirement(st.Element("Requirement"))
                     ))
                     .ToList();
        }

        private static SpeciesRequirement? ParseSpeciesRequirement(XElement? el)
        {
            if (el == null) return null;
            return new SpeciesRequirement(
                career: el.Get("Career"),
                specialization: el.Get("Specialization"),
                fromSkillType: el.Get("FromSkillType"),
                skillType: el.Get("SkillType"),
                nonCareer: el.Get("NonCareer")
            );
        }
    }
}
