using HoloChronicles.Server.Services.XMLParsers;
using System.Xml.Linq;

namespace HoloChronicles.Server.Services.Utils
{
    public static class XElementExtensions
    {
        public static string? Get(this XElement el, string name) =>
            el.Element(name)?.Value ?? "";

        public static int? GetInt(this XElement el, string name) =>
            Converters.GetIntFromElement(el, name);

        public static bool? GetBool(this XElement el, string name) =>
            Converters.GetBoolFromElement(el, name);

        public static List<string> ParseSources(this XElement el)
        {
            return SourceParserLinq.ParseSources(el) ?? new List<string>();
        }

        public static string? ParseDescription(this XElement el)
        {
            return DescriptionParserLinq.ParseDescription(el);
        }
    }
}