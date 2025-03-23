using System.Xml;

namespace HoloChronicles.Server.Services.XMLParsers
{
    public class SourceParser
    {
        public static List<string> ParseSources(XmlElement characteristicElement)
        {
            var sources = new List<string>();

            XmlNodeList sourcesNodeList = characteristicElement.GetElementsByTagName("Sources");
            if (sourcesNodeList.Count > 0)
            {
                XmlElement sourcesNode = sourcesNodeList[0] as XmlElement;
                XmlNodeList sourceNodes = sourcesNode.GetElementsByTagName("Source");

                foreach (XmlNode sourceNode in sourceNodes)
                {
                    if (sourceNode is XmlElement sourceElement)
                    {
                        string page = sourceElement.GetAttribute("Page");

                        if (!string.IsNullOrEmpty(page))
                        {
                            sources.Add($"{sourceElement.InnerText} - p. {page}");
                        }
                        else
                        {
                            sources.Add(sourceElement.InnerText);
                        }
                    }
                }
            }
            else
            {
                // If <Sources> tag is missing, look for individual <Source> tag
                XmlNodeList sourceNodes = characteristicElement.GetElementsByTagName("Source");

                foreach (XmlNode sourceNode in sourceNodes)
                {
                    if (sourceNode is XmlElement sourceElement)
                    {
                        string page = sourceElement.GetAttribute("Page");

                        if (!string.IsNullOrEmpty(page))
                        {
                            sources.Add($"{sourceElement.InnerText} - p. {page}");
                        }
                        else
                        {
                            sources.Add(sourceElement.InnerText);
                        }
                    }
                }
            }

            return sources;
        }
    }
}
