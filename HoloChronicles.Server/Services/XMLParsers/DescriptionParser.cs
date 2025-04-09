using System.IO;
using System.Text.RegularExpressions;
using System.Xml;

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