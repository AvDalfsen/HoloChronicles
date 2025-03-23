namespace HoloChronicles.Server.Services.Utils
{
    public class StrainRecalculator
    {
        public static int RecalculateStrain(int currentStrain, int changedValue)
        {
            return currentStrain + changedValue;
        }
    }
}
