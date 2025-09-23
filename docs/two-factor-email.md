# Email-based Two-Factor Authentication

The backend now enforces email-based two-factor authentication (2FA) for every user account. After a user enters valid credentials, a short-lived verification code is sent to the account's email address. The login flow completes only after the code is confirmed.

## How it works

1. **Password check** – `POST /api/auth/login` validates the email/password pair. If the account has 2FA enabled, the API responds with `requiresTwoFactor: true` and a `twoFactorToken` representing the pending login session. A numeric code is sent to the user via email.
2. **Code verification** – `POST /api/auth/verify-2fa` consumes the `twoFactorToken` plus the code from the email. A JWT is issued only after successful verification.
3. **Optional resend** – `POST /api/auth/resend-2fa` resends a new code (honouring cooldown/attempt limits) for the same pending login session.

The pending login session and verification code expire 10 minutes after they are issued. Five incorrect codes in a row invalidate the session.

## Configuring email delivery

The service uses the `Email` section in `appsettings*.json`:

```json
"Email": {
  "FromAddress": "peterpo2@abv.bg",
  "FromName": "AIPharm Security",
  "OverrideToAddress": "peterpo2@abv.bg",
  "PickupDirectory": "./App_Data/Emails",
  "SmtpHost": "smtp.abv.bg",
  "SmtpPort": 465,
  "EnableSsl": true,
  "Username": "peterpo2@abv.bg",
  "Password": ""
}
```

- **Override recipient:** `OverrideToAddress` forces every outgoing 2FA email to be delivered to the specified inbox. This keeps local testing simple even if demo accounts use other addresses.
- **Pickup directory:** By default emails are saved as `.eml` files under `AIPharm.Backend/AIPharm.Web/App_Data/Emails`. Clear this setting to send through the configured SMTP server instead. Relative paths resolve against `AIPharm.Backend/AIPharm.Web`.
- **SMTP host:** Replace `smtp.abv.bg`, port, SSL, username, and password with valid credentials for your mail provider. For ABV you typically need an application password.
- **Secrets:** Never commit your mailbox password. For local development use [ASP.NET Core user-secrets](https://learn.microsoft.com/aspnet/core/security/app-secrets) or environment variables (`Email__Password`).

## Example sequence (local pickup mode)

```bash
# 1) Login with credentials
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"peterpo2@abv.bg","password":"Admin123!"}'

# Response excerpt
# {
#   "requiresTwoFactor": true,
#   "twoFactorToken": "...",
#   "codeExpiresAt": "2024-09-18T11:22:33.123Z"
# }

# 2) Retrieve the code from App_Data/Emails/xxx.eml

# 3) Submit the code + token to finish authentication
curl -X POST http://localhost:8080/api/auth/verify-2fa \
  -H "Content-Type: application/json" \
  -d '{
  "email":"peterpo2@abv.bg",
  "twoFactorToken":"<token-from-step-1>",
  "code":"123456"
}'
```

If the code expires or the email is lost, call `POST /api/auth/resend-2fa` with the same email and `twoFactorToken`. Respect the cooldown (60 seconds by default) between resends.
