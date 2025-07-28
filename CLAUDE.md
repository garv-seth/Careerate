# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot reload (runs server with tsx on port 5000)
- `npm run build` - Build both frontend (Vite) and backend (ESBuild) for production
- `npm start` - Run production server (serves from dist/ on port 5000)
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes with Drizzle Kit

## Architecture Overview

Careerate is a full-stack TypeScript application with a multi-agent DevOps platform architecture:

**Frontend**: React 18 with Vite, using Wouter for routing, TanStack Query for state management, and shadcn/ui components with Tailwind CSS for styling.

**Backend**: Express.js server with TypeScript ES modules, RESTful API design, and structured route handlers. Server runs on port 5000 and serves both API and static files.

**Database**: PostgreSQL with Drizzle ORM for type-safe operations, using Neon Database serverless driver.

**Key Features**: Multi-agent system with 5 agent types (Planner, Builder, Tester, Deployer, Monitor), visual workflow editor with React Flow, and glass morphism UI design.

## Project Structure

```
├── client/src/          - React frontend
│   ├── components/      - UI components organized by feature
│   │   ├── dashboard/   - Dashboard-specific components
│   │   ├── workflow/    - Workflow editor components
│   │   ├── ui/         - Reusable shadcn/ui components
│   │   ├── layout/     - Layout components
│   │   └── sidebar/    - Sidebar components
│   ├── pages/          - Route components
│   ├── hooks/          - Custom React hooks including useAuth
│   ├── lib/            - Utilities, types, and query client
│   └── utils/          - Additional utility functions
├── server/             - Express.js backend
│   ├── agents/         - Agent registry and AI orchestrator
│   ├── auth/          - Authentication providers and routes
│   ├── infrastructure/ - Cloud provider integrations (AWS, GCP, Azure)
│   ├── monitoring/     - Observability and health checks
│   ├── db.ts          - Database connection setup
│   ├── routes.ts      - API route registration
│   └── index.ts       - Main server entry point
└── shared/            - Shared types and database schema
```

## Database Schema

Core entities managed through Drizzle ORM in `shared/schema.ts`:
- `users` - User authentication with OAuth provider integration
- `agents` - Multi-agent registry with status tracking (5 types: planner, builder, tester, deployer, monitor)
- `workflows` - Visual workflow definitions with nodes/connections stored as JSON
- `cloudResources` - Multi-cloud resource tracking (AWS, GCP, Azure) with cost tracking
- `agentLogs` - Inter-agent communication logs with task correlation
- `sessions` - Express session storage for authentication

## Path Aliases

- `@/*` maps to `./client/src/*`
- `@shared/*` maps to `./shared/*`
- `@assets/*` maps to `./attached_assets/*`

## Key Dependencies

**Frontend**: React, Wouter, TanStack Query, Radix UI, Tailwind CSS, React Flow, Framer Motion, Three.js
**Backend**: Express, Drizzle ORM, Zod validation, Passport authentication, LangChain, OpenAI
**Cloud SDKs**: AWS SDK v3, Google Cloud Compute, Azure ARM Resources
**Build**: Vite (frontend), ESBuild (backend), TypeScript

## Development Notes

- Uses ES modules throughout (`type: "module"` in package.json)
- TypeScript with strict mode enabled
- Database migrations managed via Drizzle Kit
- Environment variables required: DATABASE_URL for production
- Hot reload enabled for both frontend and backend during development
- Server runs on port 5000 locally, Azure assigns port dynamically via `process.env.PORT`
- Client build output goes to `dist/public/`
- Server build output goes to `dist/`

## Azure Deployment

Careerate is configured for Azure Web App deployment with:

### Required Azure Resources
- **Azure Web App** (Node.js 18+)
- **Azure Database for PostgreSQL** (or Neon Database)
- **Azure Key Vault** (for secrets management)
- **Application Insights** (monitoring)

### Environment Variables
```bash
DATABASE_URL=postgresql://...

# AI Configuration (Azure OpenAI recommended for cost efficiency)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-azure-openai-key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini-deployment
AZURE_OPENAI_DEPLOYMENT_NAME_TURBO=gpt-35-turbo-deployment

# Alternative: OpenAI API
# OPENAI_API_KEY=sk-...

# Cloud Provider Integrations
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
GOOGLE_APPLICATION_CREDENTIALS=...
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...
AZURE_TENANT_ID=...
SESSION_SECRET=...
```

### Health Check Endpoints
- `/health` - Main health check for Azure
- `/ready` - Readiness probe
- `/live` - Liveness probe  
- `/api/health` - Detailed API health status

### Deployment
- GitHub Actions workflow in `.github/workflows/azure-deploy.yml`
- Automatic deployment on push to main branch
- Health checks after deployment
- See `AZURE_DEPLOYMENT.md` for complete setup guide

### Configuration Files
- `web.config` - IIS configuration for Azure Web App
- Environment validation in `server/config/environment.ts`
- Enhanced database connection handling for Azure PostgreSQL