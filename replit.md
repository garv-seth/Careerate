# Careerate - Autonomous DevOps Platform

## Overview

Careerate is a next-generation agentic DevOps and hosting platform built with a modern full-stack architecture. The application features an autonomous multi-agent system for DevOps workflows, with a React frontend, Express.js backend, and PostgreSQL database managed through Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Components**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom glass morphism design theme
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured route handlers
- **Middleware**: Custom logging, JSON parsing, and error handling
- **Development**: Hot module replacement via Vite integration

### Database Architecture
- **Database**: PostgreSQL (configured for production)
- **ORM**: Drizzle ORM with type-safe queries
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: Neon Database serverless driver
- **Development**: In-memory storage fallback for development

## Key Components

### Multi-Agent System
The application implements an autonomous agent registry with five core agent types:
- **Planner Agent**: Repository analysis and deployment planning
- **Builder Agent**: Template rendering and asset compilation
- **Tester Agent**: Automated testing and validation
- **Deployer Agent**: Infrastructure deployment and orchestration
- **Monitor Agent**: Health monitoring and auto-healing

### Workflow Management
- Visual workflow editor with React Flow integration
- Real-time agent status tracking and communication
- Interactive node-based workflow creation
- Agent-to-agent task delegation and handoff

### Dashboard Components
- **Agent Registry**: Real-time agent status and performance metrics
- **Cloud Status**: Multi-cloud resource monitoring (AWS, GCP, Azure)
- **Cost Optimization**: Resource cost tracking and optimization suggestions
- **Health Monitoring**: System health scores and endpoint monitoring

### Glass UI Design System
- Custom glass morphism components with transparency effects
- Dark theme optimized for DevOps workflows
- Responsive design with mobile-first approach
- Consistent color theming with CSS custom properties

## Data Flow

### Agent Communication
1. Agent registry manages available agents and their capabilities
2. Workflow engine orchestrates task distribution between agents
3. Real-time logging captures inter-agent communications
4. State management tracks workflow progress and agent status

### API Data Flow
1. Frontend makes RESTful API calls using TanStack Query
2. Express middleware handles request logging and error management
3. Routes delegate to storage layer for data operations
4. Responses are cached and synchronized across components

### Database Operations
1. Drizzle ORM provides type-safe database interactions
2. Schema definitions ensure data consistency
3. Migrations handle database structure changes
4. Connection pooling optimizes database performance

## External Dependencies

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Lucide React**: Consistent icon library
- **React Flow**: Interactive workflow visualization
- **Tailwind CSS**: Utility-first styling framework

### Backend Dependencies
- **Drizzle ORM**: Type-safe database operations
- **Zod**: Runtime type validation
- **Express**: Web application framework
- **Neon Database**: Serverless PostgreSQL hosting

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking
- **ESBuild**: Fast JavaScript bundling
- **PostCSS**: CSS processing and optimization

## Deployment Strategy

### Build Process
1. Vite builds the React frontend for production
2. ESBuild bundles the Express server with external package resolution
3. Static assets are optimized and versioned
4. Environment-specific configurations are applied

### Database Deployment
1. Drizzle migrations run against the production database
2. Schema changes are versioned and tracked
3. Connection strings use environment variables
4. Database credentials are managed securely

### Environment Configuration
- **Development**: Local development with hot reloading
- **Production**: Optimized builds with static asset serving
- **Database**: Environment-specific connection strings
- **Logging**: Request/response logging with performance metrics

The architecture prioritizes developer experience with fast hot reloading, type safety throughout the stack, and a modern UI design that supports complex DevOps workflows.