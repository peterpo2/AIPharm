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
  "FromAddress": "aipharmplus@outlook.com",
  "FromName": "AIPharm",
  "SmtpHost": "smtp.office365.com",
  "SmtpPort": 587,
  "EnableSsl": true,
  "Username": "aipharmplus@outlook.com",
  "Password": "Sklad123!@",
  "PickupDirectory": "App_Data/Emails"
}
```

- **Sender account:** The backend uses the dedicated Outlook mailbox `aipharmplus@outlook.com` (password `Sklad123!@`) to dispatch login and registration emails. Update these values if you rotate the password or switch providers.
- **Per-user delivery:** Leave `OverrideToAddress` unset so verification codes are sent to each account's email address. When running locally you can still inspect every message in the pickup directory, even if the recipient mailbox is fictional.
- **Local pickup folder:** `PickupDirectory` writes a copy of every message to `AIPharm.Backend/AIPharm.Web/App_Data/Emails`. When running through Docker this folder is bind-mounted to your host machine, making it easy to open `.eml` files even if Outlook delivery is delayed.
- **SMTP host:** Outlook/Office 365 uses `smtp.office365.com` on port `587` with STARTTLS (`EnableSsl: true`). Adjust the settings if you switch providers.
- **Secrets:** For production scenarios store credentials securely (environment variables, user-secrets, Key Vault, etc.).

## Example sequence (Outlook delivery)

```bash
# 1) Login with credentials
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aipharmplus@outlook.com","password":"Admin123!"}'

# Response excerpt
# {
#   "requiresTwoFactor": true,
#   "twoFactorToken": "...",
#   "codeExpiresAt": "2024-09-18T11:22:33.123Z"
# }

# 2) Retrieve the code from your inbox (the sender is aipharmplus@outlook.com). A copy of the email is also saved under AIPharm.Backend/AIPharm.Web/App_Data/Emails.

# 3) Submit the code + token to finish authentication
curl -X POST http://localhost:8080/api/auth/verify-2fa \
  -H "Content-Type: application/json" \
  -d '{
  "email":"aipharmplus@outlook.com",
  "twoFactorToken":"<token-from-step-1>",
  "code":"123456"
}'
```

If the code expires or the email is lost, call `POST /api/auth/resend-2fa` with the same email and `twoFactorToken`. Respect the cooldown (60 seconds by default) between resends.
