using Microsoft.AspNetCore.Mvc;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.XMLParsers;

namespace HoloChronicles.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SpeciesController : ControllerBase
    {
        private readonly ILogger<SpeciesController> _logger;

        public SpeciesController(ILogger<SpeciesController> logger)
        {
            _logger = logger;
        }

        [HttpGet(Name = "GetSpecies")]
        public IEnumerable<Species> Get()
        {
            string basePath = AppContext.BaseDirectory;
            string relativePath = Path.Combine("Assets", "BaseData", "Species");
            string fullPath = Path.Combine(basePath, relativePath);

            _logger.LogInformation($"Attempting to parse characteristics from file: {fullPath}");

            return SpeciesParser.ParseSpeciesFromFiles(fullPath);
        }
    }
}