using System.Xml;

namespace HoloChronicles.Server.Services.Utils
{
    public class Converters
    {
        public static int GetIntFromNode(XmlNode node, string tagName, int defaultValue = 0)
        {
            var characteristic = node.SelectSingleNode(tagName);
            if (node != null && int.TryParse(characteristic.InnerText, out int result))
            {
                return result;
            }
            return defaultValue;
        }
    }
}
