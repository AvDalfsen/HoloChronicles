using System.Text.RegularExpressions;
using System.Xml;

namespace HoloChronicles.Server.Services.XMLParsers
{
    public class DescriptionParser
    {
        public static string ParseDescription(XmlElement element)
        {
            string description = element.GetElementsByTagName("Description")?.Item(0)?.InnerText?.Replace("\n", " ")?.Replace("\r", " ")?.Replace("\t", " ") ?? "";
            description = Regex.Replace(description, @"\[H\d+\](.*?)\[h\d+\]", "");
            description = description.Trim();

            return description;
        }
    }
}