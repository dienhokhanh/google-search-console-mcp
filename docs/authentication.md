# Authentication

Google Search Console data is private. Every installation must authenticate with a Google identity that has access to the requested properties.

## Service account

This is the most predictable option for local tools and automation.

1. Create or select a project in Google Cloud Console.
2. Enable the Google Search Console API.
3. Create a service account.
4. Create and download a JSON key for that service account.
5. Open the relevant property in Google Search Console.
6. Go to **Settings → Users and permissions**.
7. Add the service account email with the minimum permission level required.
8. Run the setup wizard and provide the absolute path to the JSON key.

The JSON key remains outside this repository. The setup wizard stores only its path.

## Application Default Credentials

When no credential file is configured, the server uses Google Application Default Credentials (ADC). This is useful with:

- `gcloud auth application-default login` for local development.
- Workload Identity on Google Cloud.
- Attached service accounts on supported Google Cloud runtimes.

The identity must still be added to the Search Console property.

## OAuth user credentials

ADC may contain authorized-user credentials created by the Google Cloud CLI. The server does not implement its own shared OAuth application and does not ship a client secret.

## Scopes

The server requests:

- `https://www.googleapis.com/auth/webmasters.readonly` by default.
- `https://www.googleapis.com/auth/webmasters` only when `GSC_ENABLE_WRITE_TOOLS=true`.

## Credential safety

- Never commit a service account key.
- Keep keys outside the repository.
- Use an absolute path.
- Prefer short-lived workload credentials for production automation.
- Rotate a key immediately if it is exposed.
