using System.Xml.Linq;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.Utils;

namespace HoloChronicles.Server.Services.XMLParsers
{
    public class CareerParser
    {
        public static List<Career> ParseCareersFromFiles(string folderpath)
        {
            var careers = new List<Career>();

            try
            {
                var xmlFiles = Directory.GetFiles(folderpath, "*.xml");

                foreach (var file in xmlFiles)
                {
                    var doc = XDocument.Load(file);
                    var root = doc.Root;

                    if (root == null || root.Name != "Career")
                    {
                        Console.WriteLine($"Skipping file: {file}. Root element is not <Career> or is missing.");
                        continue;
                    }

                    var career = ParseCareer(root);
                    careers.Add(career);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error parsing Careers XML: " + ex.Message);
            }

            return careers;
        }

        private static Career ParseCareer(XElement el)
        {
            return new Career(
                key: el.Get("Key"),
                name: el.Get("Name"),
                description: el.ParseDescription(),
                sources: el.ParseSources(),
                careerSkills: el.Elements("CareerSkills").Elements("Key").Select(x => x.Value).ToList(),
                specializations: el.Elements("Specializations").Elements("Key").Select(x => x.Value).ToList(),
                forceRating: el.GetInt("ForceRating"),
                freeRanks: el.GetInt("FreeRanks"),
                attributes: ParseAttributes(el.Element("Attributes"))
            );
        }

        private static CareerAttributes? ParseAttributes(XElement? el)
        {
            if (el == null) return null;

            return new CareerAttributes(
                woundThreshold: el.GetInt("WoundThreshold"),
                strainThreshold: el.GetInt("StrainThreshold"),
                defenseRanged: el.GetInt("DefenseRanged"),
                defenseMelee: el.GetInt("DefenseMelee"),
                soakValue: el.GetInt("SoakValue"),
                experience: el.GetInt("Experience"),
                forceRating: el.GetInt("ForceRating"),
                requirement: ParseRequirement(el.Element("Requirement"))
            );
        }

        private static CareerRequirement? ParseRequirement(XElement? el)
        {
            if (el == null) return null;

            return new CareerRequirement(
                wearingArmor: el.GetBool("WearingArmor"),
                career: el.GetBool("Career"),
                specialization: el.GetBool("Specialization"),
                nonCareer: el.GetBool("NonCareer"),
                soakAtLeast: el.GetInt("SoakAtLeast")
            );
        }
    }
}
