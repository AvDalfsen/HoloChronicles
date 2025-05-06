using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Npgsql;

namespace HoloChronicles.Server.Controllers.Util
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthenticationController : ControllerBase
    {
        private readonly NpgsqlConnection _conn;
        private readonly IPasswordHasher<string> _hasher;
        private readonly ILogger<AuthenticationController> _logger;

        public AuthenticationController(
            NpgsqlConnection conn,
            IPasswordHasher<string> hasher,
            ILogger<AuthenticationController> logger)
        {
            _conn = conn;
            _hasher = hasher;
            _logger = logger;
        }

        public class SignupAndLoginRequest
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] SignupAndLoginRequest req)
        {
            _logger.LogInformation($"Login attempt for user: {req.Username}");
            await _conn.OpenAsync();

            const string sql = @"
                SELECT password_hash
                  FROM users
                 WHERE username = @u;
            ";
            await using var cmd = new NpgsqlCommand(sql, _conn);
            cmd.Parameters.AddWithValue("u", req.Username);

            var storedHash = (string?)await cmd.ExecuteScalarAsync();
            await _conn.CloseAsync();

            if (storedHash == null)
                return Unauthorized("Invalid username or password.");

            var result = _hasher.VerifyHashedPassword(req.Username, storedHash, req.Password);
            if (result != PasswordVerificationResult.Success)
                return Unauthorized("Invalid username or password.");

            return Ok("Login successful.");
        }

        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] SignupAndLoginRequest req)
        {
            _logger.LogInformation($"Signup attempt for user: {req.Username}");
            await _conn.OpenAsync();

            // Ensure the username isn't already taken
            string checkSql = @"SELECT 1 FROM users WHERE username = @u;";
            await using (var checkCmd = new NpgsqlCommand(checkSql, _conn))
            {
                checkCmd.Parameters.AddWithValue("u", req.Username);
                var exists = await checkCmd.ExecuteScalarAsync();
                if (exists != null)
                {
                    await _conn.CloseAsync();
                    return Conflict("Username is already taken.");
                }
            }

            // Ensure the email address isn't already taken
            checkSql = @"SELECT 1 FROM users WHERE email = @e;";
            await using (var checkCmd = new NpgsqlCommand(checkSql, _conn))
            {
                checkCmd.Parameters.AddWithValue("e", req.Email);
                var exists = await checkCmd.ExecuteScalarAsync();
                if (exists != null)
                {
                    await _conn.CloseAsync();
                    return Conflict("Email address is already taken.");
                }
            }

            // Hash the password
            var hash = _hasher.HashPassword(req.Username, req.Password);

            // Insert the new user
            const string insertSql = @"
                INSERT INTO users (username, password_hash, email)
                VALUES (@u, @ph, @e)
                RETURNING id;
            ";
            await using var insertCmd = new NpgsqlCommand(insertSql, _conn);
            insertCmd.Parameters.AddWithValue("u", req.Username);
            insertCmd.Parameters.AddWithValue("ph", hash);
            insertCmd.Parameters.AddWithValue("e", req.Email);

            var newId = (int?)await insertCmd.ExecuteScalarAsync();
            await _conn.CloseAsync();

            if (newId == null)
                return StatusCode(500, "Could not create user.");

            return Ok(new { UserId = newId, Message = "Signup successful." });
        }
    }
}