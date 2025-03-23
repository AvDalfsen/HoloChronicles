namespace HoloChronicles.Server.Services.Utils
{
    public class ExperienceRecalculator
    {
        public static int RecalculateExperience(int currentExperience, int changedValue)
        {
            return currentExperience + changedValue;
        }
    }
}
