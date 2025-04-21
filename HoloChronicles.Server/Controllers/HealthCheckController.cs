using Microsoft.AspNetCore.Mvc;

namespace HoloChronicles.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthCheckController : ControllerBase
    {
        private readonly ILogger<HealthCheckController> _logger;

        public HealthCheckController(ILogger<HealthCheckController> logger)
        {
            _logger = logger;
        }

        [HttpGet(Name = "GetHealthCheck")]
        public bool Get()
        {
            _logger.LogInformation($"Checking the health of the API!");
            return true;
        }
    }
}