using System.Text.RegularExpressions;
using System.Xml;
using System.Xml.Linq;

namespace HoloChronicles.Server.Services.XMLParsers
{
    public static class DescriptionParserLinq
    {
        public static string ParseDescription(XElement element)
        {
            var raw = element.Element("Description")?.Value ?? "";

            if (raw == "") return raw;

            var cleaned = Regex.Replace(raw, @"\[H\d+\](.*?)\[h\d+\]", "");
            cleaned = Regex.Replace(cleaned, @"\s+", " ");
            cleaned = cleaned.Trim();

            return cleaned;
        }
    }
}


namespace HoloChronicles.Server.Services.XMLParsers
{
    public class DescriptionParser
    {
        public static string ParseDescription(XmlElement element)
        {
            string description = element.SelectSingleNode("Description")?.InnerText?.Replace("\n", " ")?.Replace("\r", " ")?.Replace("\t", " ") ?? "";
            description = Regex.Replace(description, @"\[H\d+\](.*?)\[h\d+\]", "");
            description = Regex.Replace(description, @"\s+", " ");
            description = description.Trim();

            return description;
        }
    }
}