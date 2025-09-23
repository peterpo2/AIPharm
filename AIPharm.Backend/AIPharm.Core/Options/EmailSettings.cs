namespace AIPharm.Core.Options
{
    public class EmailSettings
    {
        public string FromAddress { get; set; } = "no-reply@aipharm.local";
        public string FromName { get; set; } = "AIPharm Security";
        public string SmtpHost { get; set; } = "localhost";
        public int SmtpPort { get; set; } = 25;
        public bool EnableSsl { get; set; } = false;
        public string? Username { get; set; }
        public string? Password { get; set; }
        public string? PickupDirectory { get; set; }
        public int CodeLength { get; set; } = 6;
        public int CodeLifetimeMinutes { get; set; } = 10;
        public int ResendCooldownSeconds { get; set; } = 60;
        public int MaxVerificationAttempts { get; set; } = 5;
    }
}
