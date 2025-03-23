namespace HoloChronicles.Server.Services.Utils
{
    public class WoundsRecalculator
    {
        public static int RecalculateWounds(int currentWounds, int newWounds)
        {
            return currentWounds + newWounds;
        }
    }
}