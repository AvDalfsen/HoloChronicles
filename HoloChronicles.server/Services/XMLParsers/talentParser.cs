using System.Xml.Linq;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.Utils;

namespace HoloChronicles.Server.Services.XMLParsers
{
    public class TalentParser
    {
        public static List<Talent> ParseTalentsFromFile(string filepath)
        {
            var talents = new List<Talent>();
            try
            {
                var doc = XDocument.Load(filepath);
                talents = doc
                    .Descendants("Talent")
                    .Select(ParseTalent)
                    .ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error parsing Talents XML: {ex.Message}");
            }
            return talents;
        }

        private static Talent ParseTalent(XElement el)
        {
            TalentAttributes? ParseAttributes()
            {
                var a = el.Element("Attributes");
                if (a == null) return null;
                return new TalentAttributes(
                    soakValue: a.GetInt("SoakValue"),
                    requirement: a.Element("Requirement") is XElement req
                        ? new TalentRequirement(
                              wearingArmor: req.GetBool("WearingArmor"),
                              soakAtLeast: req.GetInt("SoakAtLeast")
                          )
                        : null,
                    defenseRanged: a.GetInt("DefenseRanged"),
                    defenseMelee: a.GetInt("DefenseMelee"),
                    forceRating: a.GetInt("ForceRating"),
                    strainThreshold: a.GetInt("StrainThreshold"),
                    woundThreshold: a.GetInt("WoundThreshold")
                );
            }

            ChooseCareerSkills? ParseChooseCareerSkills()
            {
                var c = el.Element("ChooseCareerSkills");
                if (c == null) return null;
                return new ChooseCareerSkills(
                    skillCount: c.GetInt("SkillCount"),
                    newSkills: c.Element("NewSkills")?.Elements("Key").Select(x => x.Value).ToList(),
                    chooseByType: c.GetBool("ChooseByType"),
                    typeValue: c.Get("TypeValue"),
                    type: c.Get("Type")
                );
            }

            List<TalentDieModifier>? ParseDieModifiers()
            {
                return el.Element("DieModifiers")
                         ?.Elements("DieModifier")
                         .Select(d => new TalentDieModifier(
                             skillKey: d.Get("SkillKey"),
                             boostCount: d.GetInt("BoostCount"),
                             setbackCount: d.GetInt("SetbackCount"),
                             forceCount: d.GetInt("ForceCount"),
                             skillType: d.Get("SkillType"),
                             decreaseDifficultyCount: d.GetInt("DecreaseDifficultyCount"),
                             applyOnce: d.GetBool("ApplyOnce"),
                             advantageCount: d.GetInt("AdvantageCount")
                         ))
                         .ToList();
            }

            SkillChoice? ParseSkillChoice()
            {
                var s = el.Element("SkillChoice");
                if (s == null) return null;
                return new SkillChoice(
                    typeValue: s.Get("TypeValue"),
                    skillCount: s.GetInt("SkillCount"),
                    addDamagePerSkillRank: s.GetBool("AddDamagePerSkillRank"),
                    addSkillsPerRank: s.GetBool("AddSkillsPerRank"),
                    skillList: s.Element("SkillList")?.Elements("Key").Select(x => x.Value).ToList()
                );
            }

            List<CharacteristicChoice>? ParseCharacteristicChoices()
            {
                return el.Element("CharacteristicChoices")
                         ?.Elements("CharacteristicChoice")
                         .Select(c => new CharacteristicChoice(c.Get("Bonus")))
                         .ToList();
            }

            RosterMods? ParseRosterMods()
            {
                var r = el.Element("RosterMods");
                if (r == null) return null;
                return new RosterMods(
                    pilotOnly: r.GetBool("PilotOnly"),
                    defAll: r.GetInt("DefAll")
                );
            }

            Damage? ParseDamage()
            {
                var d = el.Element("Damage");
                if (d == null) return null;
                return new Damage(
                    bonus: d.GetInt("Bonus"),
                    skills: d.Element("Skills")?.Elements("Key").Select(x => x.Value).ToList()
                );
            }

            List<ItemChange>? ParseItemChanges()
            {
                return el.Element("ItemChanges")
                         ?.Elements("ItemChange")
                         .Select(ic => new ItemChange(
                             itemType: ic.Get("ItemType"),
                             qualityChanges: ic.Elements("QualityChanges")
                                               .Elements("Quality")
                                               .Select(q => new TalentQuality(
                                                   key: q.Get("Key"),
                                                   count: q.GetInt("Count"),
                                                   useForceRating: q.GetBool("UseForceRating")
                                               ))
                                               .ToList(),
                             damageChange: ic.GetInt("DamageChange"),
                             skillKeys: ic.Element("SkillKeys")?.Elements("Key").Select(x => x.Value).ToList(),
                             encumChange: ic.GetInt("EncumChange"),
                             addNewQualities: ic.GetBool("AddNewQualities"),
                             unarmedOnly: ic.GetBool("UnarmedOnly"),
                             critChange: ic.GetInt("CritChange"),
                             updateQualities: ic.GetBool("UpdateQualities")
                         ))
                         .ToList();
            }

            List<SkillChar>? ParseSkillChars()
            {
                return el.Element("SkillChars")
                         ?.Elements("SkillChar")
                         .Select(sc => new SkillChar(
                             skillKey: sc.Get("SkillKey"),
                             charKey: sc.Get("CharKey")
                         ))
                         .ToList();
            }

            Rigger? ParseRigger()
            {
                var r = el.Element("Rigger");
                if (r == null) return null;
                return new Rigger(
                    baseMods: r.Element("BaseMods")?.Elements("Mod").Select(m => new Mod(
                        key: m.Get("Key"),
                        count: m.GetInt("Count")
                    )).ToList(),
                    silhouetteAdd: r.GetInt("SilhouetteAdd"),
                    chooseWeapon: r.GetBool("ChooseWeapon"),
                    weaponMods: r.Element("WeaponMods")?.Elements("Mod").Select(m => new Mod(
                        key: m.Get("Key"),
                        count: m.GetInt("Count")
                    )).ToList(),
                    chooseVehicle: r.GetBool("ChooseVehicle"),
                    silhouetteBase: r.GetInt("SilhouetteBase")
                );
            }

            // Now assemble the Talent:
            return new Talent(
                key: el.Get("Key"),
                name: el.Get("Name"),
                description: el.ParseDescription(),
                sources: el.ParseSources(),
                custom: el.Get("Custom"),
                ranked: el.GetNonNullBool("Ranked"),
                activationValue: el.Get("ActivationValue"),
                attributes: ParseAttributes(),
                forceTalent: el.GetNonNullBool("ForceTalent"),
                chooseCareerSkills: ParseChooseCareerSkills(),
                dieModifiers: ParseDieModifiers(),
                skillChoice: ParseSkillChoice(),
                characteristicChoices: ParseCharacteristicChoices(),
                rosterMods: ParseRosterMods(),
                damage: ParseDamage(),
                modPercentDiscount: el.GetInt("ModPercentDiscount"),
                juryRigged: el.GetNonNullBool("JuryRigged"),
                itemChanges: ParseItemChanges(),
                addlHP: el.GetInt("AddlHP"),
                skillChars: ParseSkillChars(),
                hpPerItem: el.GetInt("HPPerItem"),
                conflict: el.GetInt("Conflict"),
                rigger: ParseRigger(),
                addlCyber: el.GetInt("AddlCyber")
            );
        }
    }
}