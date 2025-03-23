using Microsoft.AspNetCore.Mvc;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.XMLParsers;

namespace HoloChronicles.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SkillsController : ControllerBase
    {
        private readonly ILogger<SkillsController> _logger;

        public SkillsController(ILogger<SkillsController> logger)
        {
            _logger = logger;
        }

        [HttpGet(Name = "GetSkills")]
        public IEnumerable<Skill> Get()
        {
            // Build the file path for the Characteristics.xml
            string basePath = AppContext.BaseDirectory;
            string relativePath = Path.Combine("Assets", "BaseData", "Skills.xml");
            string fullPath = Path.Combine(basePath, relativePath);

            _logger.LogInformation($"Attempting to parse characteristics from file: {fullPath}");

            // Return parsed characteristics from the XML file
            return SkillsParser.ParseSkillsFromFile(fullPath);
        }
    }
}