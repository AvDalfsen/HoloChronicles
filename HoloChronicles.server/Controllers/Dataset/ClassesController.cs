using Microsoft.AspNetCore.Mvc;
using HoloChronicles.Server.Dataclasses;
using HoloChronicles.Server.Services.XMLParsers;

namespace HoloChronicles.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClassesController : ControllerBase
    {
        private readonly ILogger<ClassesController> _logger;

        public ClassesController(ILogger<ClassesController> logger)
        {
            _logger = logger;
        }

        [HttpGet(Name = "GetClasses")]
        public IEnumerable<Class> Get()
        {
            string basePath = AppContext.BaseDirectory;
            string relativePath = Path.Combine("Assets", "BaseData", "Classes.xml");
            string fullPath = Path.Combine(basePath, relativePath);

            _logger.LogInformation($"Attempting to parse Classes from file: {fullPath}");

            return ClassesParser.ParseClassesFromFile(fullPath);
        }
    }
}