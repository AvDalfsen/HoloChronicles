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
                        string? key = skillElement.SelectSingleNode("Key")?.InnerText;
                        string? name = skillElement.SelectSingleNode("Name")?.InnerText;
                        string? abbrev = skillElement.SelectSingleNode("Abbrev")?.InnerText;
                        string? description = DescriptionParser.ParseDescription(skillElement);
                        string? charKey = skillElement.SelectSingleNode("CharKey")?.InnerText;
                        string? typeValue = skillElement.SelectSingleNode("TypeValue")?.InnerText;
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
