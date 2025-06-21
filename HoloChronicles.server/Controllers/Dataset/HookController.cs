using Microsoft.AspNetCore.Mvc;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.XMLParsers;

namespace HoloChronicles.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HooksController : ControllerBase
    {
        private readonly ILogger<HooksController> _logger;

        public HooksController(ILogger<HooksController> logger)
        {
            _logger = logger;
        }

        [HttpGet(Name = "GetHooks")]
        public IEnumerable<Hook> Get()
        {
            string basePath = AppContext.BaseDirectory;
            string relativePath = Path.Combine("Assets", "BaseData", "Hooks.xml");
            string fullPath = Path.Combine(basePath, relativePath);

            _logger.LogInformation($"Attempting to parse Hooks from file: {fullPath}");

            return HooksParser.ParseHooksFromFile(fullPath);
        }
    }
}