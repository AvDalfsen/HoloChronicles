using System.Xml;
using HoloChronicles.Server.Dataclasses;

namespace HoloChronicles.Server.Services.XMLParsers
{
    public class CharacteristicsParser
    {
        public static List<Characteristic> ParseCharacteristicsFromFile(string filepath)
        {
            var characteristics = new List<Characteristic>();

            try
            {
                XmlDocument doc = new XmlDocument();
                doc.Load(filepath);

                XmlNodeList characteristicNodes = doc.GetElementsByTagName("Characteristic");

                foreach (XmlNode node in characteristicNodes)
                {
                    if (node is XmlElement characteristicElement)
                    {
                        string key = characteristicElement.SelectSingleNode("Key")?.InnerText ?? "";
                        string name = characteristicElement.SelectSingleNode("Name")?.InnerText ?? "";
                        string abbrev = characteristicElement.SelectSingleNode("Abbrev")?.InnerText ?? "";
                        string description = DescriptionParser.ParseDescription(characteristicElement);
                        var sources = SourceParser.ParseSources(characteristicElement);

                        characteristics.Add(new Characteristic(key, name, abbrev, description, sources));
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error parsing XML file: " + ex.Message);
            }

            return characteristics;
        }
    }
}