using Microsoft.AspNetCore.Mvc;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.XMLParsers;

namespace HoloChronicles.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CareerController : ControllerBase
    {
        private readonly ILogger<CareerController> _logger;

        public CareerController(ILogger<CareerController> logger)
        {
            _logger = logger;
        }

        [HttpGet(Name = "GetCareers")]
        public IEnumerable<Career> Get()
        {
            string basePath = AppContext.BaseDirectory;
            string relativePath = Path.Combine("Assets", "BaseData", "Careers");
            string fullPath = Path.Combine(basePath, relativePath);

            _logger.LogInformation($"Attempting to parse characteristics from file: {fullPath}");

            return CareerParser.ParseCareersFromFiles(fullPath);
        }
    }
}