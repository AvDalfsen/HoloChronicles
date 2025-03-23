using System.Xml;
using HoloChronicles.Server.Services.XMLParsers;
using HoloChronicles.Server.Dataclasses;

namespace HoloChronicles.Server
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
                        string key = characteristicElement.GetElementsByTagName("Key")?.Item(0)?.InnerText ?? "";
                        string name = characteristicElement.GetElementsByTagName("Name")?.Item(0)?.InnerText ?? "";
                        string abbrev = characteristicElement.GetElementsByTagName("Abbrev")?.Item(0)?.InnerText ?? "";
                        string description = characteristicElement.GetElementsByTagName("Description")?.Item(0)?.InnerText?.Trim()
                            ?.Replace("\n", " ")?.Replace("\r", " ")?.Replace("\t", " ") ?? "";
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