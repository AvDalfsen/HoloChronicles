using Microsoft.AspNetCore.Mvc;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.XMLParsers;

namespace HoloChronicles.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CharacteristicsController : ControllerBase
    {
        private readonly ILogger<CharacteristicsController> _logger;

        public CharacteristicsController(ILogger<CharacteristicsController> logger)
        {
            _logger = logger;
        }

        [HttpGet(Name = "GetCharacteristics")]
        public IEnumerable<Characteristic> Get()
        {
            string basePath = AppContext.BaseDirectory;
            string relativePath = Path.Combine("Assets", "BaseData", "Characteristics.xml");
            string fullPath = Path.Combine(basePath, relativePath);

            _logger.LogInformation($"Attempting to parse Characteristics from file: {fullPath}");

            return CharacteristicsParser.ParseCharacteristicsFromFile(fullPath);
        }
    }
}