using Microsoft.AspNetCore.Mvc;
using HoloChronicles.Server.Services.Utils;

namespace HoloChronicles.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecalculatorController : ControllerBase
    {
        private readonly ILogger<RecalculatorController> _logger;

        public RecalculatorController(ILogger<RecalculatorController> logger)
        {
            _logger = logger;
        }

        [HttpGet("wounds", Name = "RecalculateWounds")]
        public ActionResult<int> RecalculateWounds([FromQuery] int currentWounds, [FromQuery] int changedValue)
        {
            int recalculatedWounds = WoundsRecalculator.RecalculateWounds(currentWounds, changedValue);

            return Ok(recalculatedWounds);
        }

        [HttpGet("strain", Name = "RecalculateStrain")]
        public ActionResult<int> RecalculateStrain([FromQuery] int currentStrain, [FromQuery] int changedValue)
        {
            int recalculatedStrain = StrainRecalculator.RecalculateStrain(currentStrain, changedValue);

            return Ok(recalculatedStrain);
        }

        [HttpGet("experience", Name = "RecalculateExperience")]
        public ActionResult<int> RecalculateExperience([FromQuery] int currentExperience, [FromQuery] int changedValue)
        {
            int recalculatedExperience = ExperienceRecalculator.RecalculateExperience(currentExperience, changedValue);

            return Ok(recalculatedExperience);
        }
    }
}