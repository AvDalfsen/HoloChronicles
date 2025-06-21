using Microsoft.AspNetCore.Mvc;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.XMLParsers;

namespace HoloChronicles.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttitudesController : ControllerBase
    {
        private readonly ILogger<AttitudesController> _logger;

        public AttitudesController(ILogger<AttitudesController> logger)
        {
            _logger = logger;
        }

        [HttpGet(Name = "GetAttitudes")]
        public IEnumerable<Attitude> Get()
        {
            string basePath = AppContext.BaseDirectory;
            string relativePath = Path.Combine("Assets", "BaseData", "Attitudes.xml");
            string fullPath = Path.Combine(basePath, relativePath);

            _logger.LogInformation($"Attempting to parse Attitudes from file: {fullPath}");

            return AttitudesParser.ParseAttitudesFromFile(fullPath);
        }
    }
}