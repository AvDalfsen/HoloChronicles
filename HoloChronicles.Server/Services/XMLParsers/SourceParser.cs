using System.Xml;

using System.Xml.Linq;

namespace HoloChronicles.Server.Services.XMLParsers
{
    public static class SourceParserLinq
    {
        public static List<string> ParseSources(XElement element)
        {
            var sources = element
                .Descendants("Source")
                .Select(sourceEl =>
                {
                    var text = sourceEl.Value?.Trim();
                    var page = sourceEl.Attribute("Page")?.Value;

                    return !string.IsNullOrEmpty(page)
                        ? $"{text} - p. {page}"
                        : text;
                })
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Cast<string>()
                .ToList();

            return sources;
        }
    }
}


namespace HoloChronicles.Server.Services.XMLParsers
{
    public class SourceParser
    {
        public static List<string> ParseSources(XmlElement element)
        {
            var sources = new List<string>();

            XmlNodeList sourcesNodeList = element.GetElementsByTagName("Sources");
            if (sourcesNodeList.Count > 0)
            {
                XmlElement? sourcesNode = sourcesNodeList[0] as XmlElement;
                if (sourcesNode != null)
                {
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
                    XmlNodeList sourceNodes = element.GetElementsByTagName("Source");

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
            }

            return sources;
        }
    }
}
