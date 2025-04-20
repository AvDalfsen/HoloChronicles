using Microsoft.AspNetCore.Mvc;

namespace HoloChronicles.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
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
            return true;
        }
    }
}