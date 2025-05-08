using System.Linq;
using System.Xml.Linq;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.Utils;

namespace HoloChronicles.Server.Services.XMLParsers
{
    public class SpecializationsParser
    {
        public static List<Specialization> ParseSpecializationsFromFiles(string folderpath)
        {
            var specializations = new List<Specialization>();

            try
            {
                var xmlFiles = Directory.GetFiles(folderpath, "*.xml");

                foreach (var file in xmlFiles)
                {
                    var doc = XDocument.Load(file);
                    var root = doc.Root;

                    if (root == null || root.Name != "Specialization")
                    {
                        Console.WriteLine($"Skipping file: {file}. Root element is not <Specialization> or is missing.");
                        continue;
                    }

                    var specialization = ParseSpecialization(root);
                    specializations.Add(specialization);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error parsing Specializations XML: " + ex.Message);
            }

            return specializations;
        }

        private static Specialization ParseSpecialization(XElement el)
        {
            // Helper for TalentRows
            List<TalentRow>? ParseTalentRows()
            {
                return el.Element("TalentRows")
                         ?.Elements("TalentRow")
                         .Select(tr => new TalentRow(
                             cost: tr.GetInt("Cost"),
                             talents: tr.Element("Talents")
                                        ?.Elements("Key")
                                        .Select(x => x.Value)
                                        .ToList(),
                             directions: tr.Element("Directions")
                                          ?.Elements("Direction")
                                          .Select(d => new Direction(
                                              down: d.GetNonNullBool("Down"),
                                              up: d.GetNonNullBool("Up"),
                                              right: d.GetNonNullBool("Right"),
                                              left: d.GetNonNullBool("Left")
                                          ))
                                          .ToList() ?? new List<Direction>()
                         ))
                         .ToList();
            }

            // Helper for Requirements element
            Requirements? ParseRequirements()
            {
                var req = el.Element("Requirements");
                if (req == null) return null;
                return new Requirements(
                    woundThreshold: req.GetInt("WoundThreshold"),
                    strainThreshold: req.GetInt("StrainThreshold"),
                    defenseRanged: req.GetInt("DefenseRanged"),
                    defenseMelee: req.GetInt("DefenseMelee"),
                    soakValue: req.GetInt("SoakValue"),
                    experience: req.GetInt("Experience"),
                    forceRating: req.GetInt("ForceRating")
                );
            }

            // Helper for Attributes element
            SpecializationAttributes? ParseAttributes()
            {
                var at = el.Element("Attributes");
                if (at == null) return null;
                return new SpecializationAttributes(
                    woundThreshold: at.GetInt("WoundThreshold"),
                    strainThreshold: at.GetInt("StrainThreshold"),
                    defenseRanged: at.GetInt("DefenseRanged"),
                    defenseMelee: at.GetInt("DefenseMelee"),
                    soakValue: at.GetInt("SoakValue"),
                    experience: at.GetInt("Experience"),
                    forceRating: at.GetInt("ForceRating"),
                    requirement: at.Element("Requirement") is XElement r
                                 ? new Requirement(
                                     wearingArmor: r.GetBool("WearingArmor"),
                                     career: r.GetBool("Career"),
                                     specialization: r.GetBool("Specialization"),
                                     nonCareer: r.GetBool("NonCareer"),
                                     soakAtLeast: r.GetInt("SoakAtLeast"),
                                     wieldingMelee: r.GetBool("WieldingMelee"),
                                     wieldingBrawl: r.GetBool("WieldingBrawl"),
                                     wieldingLightsaber: r.GetBool("WieldingLightsaber"),
                                     minForceRating: r.GetBool("MinForceRating")
                                   )
                                 : null
                );
            }

            List<AddlCareerSkills>? ParseAddlSkills()
            {
                var addlEl = el.Element("AddlCareerSkills");
                if (addlEl == null) return null;
                 return el.Elements("AddlCareerSkills")
                          .Select(a => new AddlCareerSkills(
                              skillCount: a.GetInt("SkillCount"),
                              chooseByType: a.GetBool("ChooseByType"),
                              typeValue: a.Get("TypeValue")
                          ))
                          .ToList();
             }



            return new Specialization(
                key: el.Get("Key"),
                name: el.Get("Name"),
                description: el.ParseDescription(),
                sources: el.ParseSources(),
                custom: el.Get("Custom"),
                careerSkills: el.Elements("CareerSkills")
                                 .Elements("Key")
                                 .Select(x => x.Value)
                                 .ToList(),
                talentRows: ParseTalentRows(),
                universal: el.GetBool("Universal"),
                attributes: ParseAttributes(),
                requirements: ParseRequirements(),
                addlCareerSkills: ParseAddlSkills()
            );
        }
    }
}
