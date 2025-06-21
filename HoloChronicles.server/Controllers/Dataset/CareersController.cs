using Microsoft.AspNetCore.Mvc;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.XMLParsers;

namespace HoloChronicles.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CareersController : ControllerBase
    {
        private readonly ILogger<CareersController> _logger;

        public CareersController(ILogger<CareersController> logger)
        {
            _logger = logger;
        }

        [HttpGet(Name = "GetCareers")]
        public IEnumerable<Career> Get()
        {
            string basePath = AppContext.BaseDirectory;
            string relativePath = Path.Combine("Assets", "BaseData", "Careers");
            string fullPath = Path.Combine(basePath, relativePath);

            _logger.LogInformation($"Attempting to parse Careers from folder: {fullPath}");

            return CareerParser.ParseCareersFromFiles(fullPath);
        }
    }
}