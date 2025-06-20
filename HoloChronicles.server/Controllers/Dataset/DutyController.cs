using Microsoft.AspNetCore.Mvc;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.XMLParsers;

namespace HoloChronicles.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DutyController : ControllerBase
    {
        private readonly ILogger<DutyController> _logger;

        public DutyController(ILogger<DutyController> logger)
        {
            _logger = logger;
        }

        [HttpGet(Name = "GetDuties")]
        public IEnumerable<Duty> Get()
        {
            string basePath = AppContext.BaseDirectory;
            string relativePath = Path.Combine("Assets", "BaseData", "Duty.xml");
            string fullPath = Path.Combine(basePath, relativePath);

            _logger.LogInformation($"Attempting to parse skills from file: {fullPath}");

            return DutiesParser.ParseDutiesFromFile(fullPath);
        }
    }
}