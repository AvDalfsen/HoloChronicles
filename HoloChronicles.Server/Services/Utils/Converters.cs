using System.Xml;

namespace HoloChronicles.Server.Services.Utils
{
    public class Converters
    {
        public static int? GetIntFromNode(XmlNode node, string tagName)
        {
            var integerAsString = node.SelectSingleNode(tagName);
            if (integerAsString != null && int.TryParse(integerAsString.InnerText, out int result))
            {
                return result;
            }
            return null;
        }        
        
        public static bool? GetBoolFromNode(XmlNode node, string tagName)
        {
            var booleanAsString = node.SelectSingleNode(tagName);
            if (booleanAsString != null && bool.TryParse(booleanAsString.InnerText, out bool result))
            {
                return result;
            }
            return null;
        }
    }
}
