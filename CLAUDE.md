# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build both frontend (Vite) and backend (ESBuild) for production
- `npm start` - Run production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes with Drizzle Kit

## Architecture Overview

Careerate is a full-stack TypeScript application with a multi-agent DevOps platform architecture:

**Frontend**: React 18 with Vite, using Wouter for routing, TanStack Query for state management, and shadcn/ui components with Tailwind CSS for styling.

**Backend**: Express.js server with TypeScript ES modules, RESTful API design, and structured route handlers.

**Database**: PostgreSQL with Drizzle ORM for type-safe operations, using Neon Database serverless driver.

**Key Features**: Multi-agent system with 5 agent types (Planner, Builder, Tester, Deployer, Monitor), visual workflow editor with React Flow, and glass morphism UI design.

## Project Structure

```
├── client/src/          - React frontend
│   ├── components/      - UI components (dashboard, workflow, ui)
│   ├── pages/          - Route components
│   ├── hooks/          - Custom React hooks
│   └── lib/            - Utilities and types
├── server/             - Express.js backend
│   ├── agents/         - Agent registry and logic
│   ├── auth/          - Authentication providers and routes
│   ├── infrastructure/ - Cloud provider integrations
│   └── monitoring/     - Observability and health checks
└── shared/            - Shared types and database schema
```

## Database Schema

Core entities managed through Drizzle ORM:
- `users` - User authentication
- `agents` - Multi-agent registry with status tracking
- `workflows` - Visual workflow definitions with nodes/connections
- `cloudResources` - Multi-cloud resource tracking (AWS, GCP, Azure)
- `agentLogs` - Inter-agent communication logs

## Path Aliases

- `@/*` maps to `./client/src/*`
- `@shared/*` maps to `./shared/*`

## Key Dependencies

**Frontend**: React, Wouter, TanStack Query, Radix UI, Tailwind CSS, React Flow
**Backend**: Express, Drizzle ORM, Zod validation, Passport authentication
**Build**: Vite (frontend), ESBuild (backend), TypeScript

## Development Notes

- Uses ES modules throughout (type: "module" in package.json)
- TypeScript with strict mode enabled
- Database migrations managed via Drizzle Kit
- Environment variables required: DATABASE_URL for production
- Hot reload enabled for both frontend and backend during development