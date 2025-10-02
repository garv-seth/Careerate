# Quickstart: Launch Wizard

1. Connect integrations
- Go to Integrations. Ensure your cloud provider (Azure/AWS/GCP) shows Ready. Secrets come from Azure Key Vault.

2. Open the Launch Wizard
- From the dashboard, click Open Wizard.
- Steps: Connect → Repo → Provider → Preflight → Deploy.

3. Preflight
- The wizard validates provider readiness and shows a plan with steps and env hints.

4. Deploy and monitor
- The Deploy step shows status, health, URL, logs, and errors.
- Rollback: click Rollback to revert to a previous version if available.

Notes
- For local dev, set SMOKE_BASE_URL and use `npm run smoke` to sanity-check endpoints.
