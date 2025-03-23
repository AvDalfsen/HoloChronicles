using Microsoft.AspNetCore.Mvc;

namespace HoloChronicles.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
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
            // Build the file path for the Characteristics.xml
            string basePath = AppContext.BaseDirectory;
            string relativePath = Path.Combine("Assets", "BaseData", "Characteristics.xml");
            string fullPath = Path.Combine(basePath, relativePath);

            _logger.LogInformation($"Attempting to parse characteristics from file: {fullPath}");

            // Return parsed characteristics from the XML file
            return CharacteristicsParser.ParseCharacteristicsFromFile(fullPath);
        }
    }
}