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

                    XmlElement speciesElement = doc.DocumentElement;

                    var species = ParseSpecies(speciesElement);
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
            string name = speciesElement.SelectSingleNode("/Name")?.InnerText ?? "";
            string description = DescriptionParser.ParseDescription(speciesElement);
            var sources = SourceParser.ParseSources(speciesElement);
            string custom = speciesElement.SelectSingleNode("Custom")?.InnerText ?? "";

            StartingChars startingChars = parseStartingChars(speciesElement);

            return new Species(key,name,description,sources,custom,startingChars);
        }

        private static StartingChars parseStartingChars(XmlElement speciesElement)
        {
            XmlNode startingCharsNode = speciesElement.SelectSingleNode("StartingChars");

            StartingChars startingChars = new StartingChars
            {
                Brawn = Converters.GetIntFromNode(startingCharsNode, "Brawn"),
                Agility = Converters.GetIntFromNode(startingCharsNode, "Agility"),
                Intellect = Converters.GetIntFromNode(startingCharsNode, "Intellect"),
                Cunning = Converters.GetIntFromNode(startingCharsNode, "Cunning"),
                Willpower = Converters.GetIntFromNode(startingCharsNode, "Willpower"),
                Presence = Converters.GetIntFromNode(startingCharsNode, "Presence")
            };

            return startingChars;
        }
    }
}
