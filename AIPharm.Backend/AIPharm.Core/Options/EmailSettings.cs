namespace AIPharm.Core.Options
{
    public class EmailSettings
    {
        public string FromAddress { get; set; } = "aipharmplus@outlook.com";
        public string FromName { get; set; } = "AIPharm";
        public string? OverrideToAddress { get; set; }
        public string SmtpHost { get; set; } = "smtp.office365.com";
        public int SmtpPort { get; set; } = 587;
        public bool EnableSsl { get; set; } = true;
        public string? Username { get; set; } = "aipharmplus@outlook.com";
        public string? Password { get; set; }
        public string? PickupDirectory { get; set; }
        public int CodeLength { get; set; } = 6;
        public int CodeLifetimeMinutes { get; set; } = 10;
        public int ResendCooldownSeconds { get; set; } = 60;
        public int MaxVerificationAttempts { get; set; } = 5;
    }
}
