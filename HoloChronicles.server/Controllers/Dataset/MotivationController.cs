using Microsoft.AspNetCore.Mvc;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.XMLParsers;

namespace HoloChronicles.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MotivationController : ControllerBase
    {
        private readonly ILogger<MotivationController> _logger;

        public MotivationController(ILogger<MotivationController> logger)
        {
            _logger = logger;
        }

        [HttpGet(Name = "GetMotivations")]
        public IEnumerable<Motivation> Get()
        {
            string basePath = AppContext.BaseDirectory;
            string relativePath = Path.Combine("Assets", "BaseData", "Motivations.xml");
            string fullPath = Path.Combine(basePath, relativePath);

            _logger.LogInformation($"Attempting to parse Motivations from file: {fullPath}");

            return MotivationsParser.ParseMotivationsFromFile(fullPath);
        }
    }
}