using Microsoft.AspNetCore.Mvc;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.XMLParsers;

namespace HoloChronicles.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SpecificMotivationController : ControllerBase
    {
        private readonly ILogger<SpecificMotivationController> _logger;

        public SpecificMotivationController(ILogger<SpecificMotivationController> logger)
        {
            _logger = logger;
        }

        [HttpGet(Name = "GetSpecificMotivations")]
        public IEnumerable<SpecificMotivation> Get()
        {
            string basePath = AppContext.BaseDirectory;
            string relativePath = Path.Combine("Assets", "BaseData", "SpecificMotivations.xml");
            string fullPath = Path.Combine(basePath, relativePath);

            _logger.LogInformation($"Attempting to parse Specific Motivations from file: {fullPath}");

            return SpecificMotivationsParser.ParseSpecificMotivationsFromFile(fullPath);
        }
    }
}