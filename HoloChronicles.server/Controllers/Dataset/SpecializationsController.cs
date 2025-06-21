using Microsoft.AspNetCore.Mvc;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.XMLParsers;

namespace HoloChronicles.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SpecializationsController : ControllerBase
    {
        private readonly ILogger<SpecializationsController> _logger;

        public SpecializationsController(ILogger<SpecializationsController> logger)
        {
            _logger = logger;
        }

        [HttpGet(Name = "GetSpecializations")]
        public IEnumerable<Specialization> Get()
        {
            string basePath = AppContext.BaseDirectory;
            string relativePath = Path.Combine("Assets", "BaseData", "Specializations");
            string fullPath = Path.Combine(basePath, relativePath);

            _logger.LogInformation($"Attempting to parse Specializations from folder: {fullPath}");

            return SpecializationsParser.ParseSpecializationsFromFiles(fullPath);
        }
    }
}