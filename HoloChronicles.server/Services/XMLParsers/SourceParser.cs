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