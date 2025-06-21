using Microsoft.AspNetCore.Mvc;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.XMLParsers;

namespace HoloChronicles.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TalentsController : ControllerBase
    {
        private readonly ILogger<TalentsController> _logger;

        public TalentsController(ILogger<TalentsController> logger)
        {
            _logger = logger;
        }

        [HttpGet(Name = "GetTalents")]
        public IEnumerable<Talent> Get()
        {
            string basePath = AppContext.BaseDirectory;
            string relativePath = Path.Combine("Assets", "BaseData", "Talents.xml");
            string fullPath = Path.Combine(basePath, relativePath);

            _logger.LogInformation($"Attempting to parse Talents from file: {fullPath}");

            return TalentParser.ParseTalentsFromFile(fullPath);
        }
    }
}