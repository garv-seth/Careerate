# Rollback & Recovery

From the Launch Wizard Deploy step:
- Click Rollback to revert to the previous version (if available).
- Status polling switches to the rollback deployment and shows health/logs.

API
- POST `/api/hosting/deployments/:deploymentId/rollback`
- GET `/api/hosting/deployments/:deploymentId` for status

Server references
- `server/routes.ts` rollback route
- `server/services/deploymentManager.ts` `rollbackDeployment`
