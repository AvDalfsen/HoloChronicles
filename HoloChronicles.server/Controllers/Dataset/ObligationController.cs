using Microsoft.AspNetCore.Mvc;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.XMLParsers;

namespace HoloChronicles.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ObligationController : ControllerBase
    {
        private readonly ILogger<ObligationController> _logger;

        public ObligationController(ILogger<ObligationController> logger)
        {
            _logger = logger;
        }

        [HttpGet(Name = "GetObligations")]
        public IEnumerable<Obligation> Get()
        {
            string basePath = AppContext.BaseDirectory;
            string relativePath = Path.Combine("Assets", "BaseData", "Obligations.xml");
            string fullPath = Path.Combine(basePath, relativePath);

            _logger.LogInformation($"Attempting to parse Obligations from file: {fullPath}");

            return ObligationsParser.ParseObligationsFromFile(fullPath);
        }
    }
}