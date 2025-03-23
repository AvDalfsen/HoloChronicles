using System.Text.RegularExpressions;
using System.Xml;
using HoloChronicles.Server.Dataclasses;

namespace HoloChronicles.Server.Services.XMLParsers
{
    public class SkillsParser
    {
        public static List<Skill> ParseSkillsFromFile(string filepath)
        {
            var skills = new List<Skill>();

            try
            {
                XmlDocument doc = new XmlDocument();
                doc.Load(filepath);

                XmlNodeList skillNodes = doc.GetElementsByTagName("Skill");

                foreach (XmlNode node in skillNodes)
                {
                    if (node is XmlElement skillElement)
                    {
                        string key = skillElement.GetElementsByTagName("Key")?.Item(0)?.InnerText ?? "";
                        string name = skillElement.GetElementsByTagName("Name")?.Item(0)?.InnerText ?? "";
                        string abbrev = skillElement.GetElementsByTagName("Abbrev")?.Item(0)?.InnerText ?? "";
                        string description = DescriptionParser.ParseDescription(skillElement);
                        string charKey = skillElement.GetElementsByTagName("CharKey")?.Item(0)?.InnerText ?? "";
                        string typeValue = skillElement.GetElementsByTagName("TypeValue")?.Item(0)?.InnerText ?? "";
                        var sources = SourceParser.ParseSources(skillElement);

                        skills.Add(new Skill(key, name, description, charKey, typeValue, sources));
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error parsing XML file: " + ex.Message);
            }

            return skills;
        }
    }
}
