using System.Xml.Linq;

namespace HoloChronicles.Server.Services.Utils
{
    public static class Converters
    {
        public static int? GetIntFromElement(XElement? parent, string tagName)
        {
            var element = parent?.Element(tagName);
            return int.TryParse(element?.Value, out int result) ? result : null;
        }

        public static bool? GetBoolFromElement(XElement? parent, string tagName)
        {
            var element = parent?.Element(tagName);
            return bool.TryParse(element?.Value, out bool result) ? result : null;
        }
    }
}