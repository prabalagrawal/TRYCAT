# TRYCAT™ Managed Environment Variable Inventory

This project uses managed secrets/configuration. **Do not commit values, export files containing values, or create a local environment template with production credentials.** The names below are the credential-safe operational inventory that fulfils the configuration-template requirement in this managed environment.

| Variable | Classification | Purpose | Release requirement |
| --- | --- | --- |
| `DATABASE_URL` | Server secret | Managed database connection. | TLS, least privilege, backup, and network isolation must be verified by the deployment owner. |
| `JWT_SECRET` | Server secret | Session signing and privacy-preserving rate-limit HMAC. | Rotate on compromise; never expose to the browser. |
| `OAUTH_SERVER_URL` | Server configuration | OAuth service origin. | Must use HTTPS in production. |
| `VITE_APP_ID` | Public configuration | OAuth application identifier. | Match the deployed redirect configuration. |
| `BUILT_IN_FORGE_API_URL` | Server configuration | Managed platform API origin. | Server-side only where a server secret is required. |
| `BUILT_IN_FORGE_API_KEY` | Server secret | Managed platform API access. | Never log, transmit to browser, or commit. |
| `VITE_FRONTEND_FORGE_API_URL` | Public configuration | Approved browser-facing platform endpoint. | Review before adding new client integrations. |
| `VITE_FRONTEND_FORGE_API_KEY` | Public platform configuration | Platform-controlled client integration token. | Do not reuse as a server secret. |
| `VITE_ANALYTICS_ENDPOINT` | Public configuration | Optional analytics script endpoint. | Analytics remains disabled until visitor opt-in. |
| `VITE_ANALYTICS_WEBSITE_ID` | Public configuration | Optional analytics site identifier. | Must match the approved analytics property. |
| `VITE_TURNSTILE_SITE_KEY` | Public configuration | Optional Cloudflare Turnstile challenge site key. | Not release-ready until an active domain-matched key is verified. |
| `TURNSTILE_SECRET_KEY` | Server secret | Optional Cloudflare Turnstile server verification key. | Not release-ready until a successful server-side validation is recorded. |

> The current Turnstile pair did not validate against the provider endpoint. No Turnstile form integration is enabled, and public-form rate limits remain in force. Replace the pair through managed secrets before implementing or relying on CAPTCHA.
