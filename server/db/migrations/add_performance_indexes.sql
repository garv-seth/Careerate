-- Performance Optimization Indexes
-- Created: October 12, 2025
-- Purpose: Add database indexes for faster queries

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);
CREATE INDEX IF NOT EXISTS idx_users_microsoft_id ON users(microsoft_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Projects table indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_user_status ON projects(user_id, status);

-- Deployments table indexes
CREATE INDEX IF NOT EXISTS idx_deployments_project_id ON deployments(project_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
CREATE INDEX IF NOT EXISTS idx_deployments_created_at ON deployments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deployments_project_status ON deployments(project_id, status);
CREATE INDEX IF NOT EXISTS idx_deployments_user_status ON deployments(user_id, status);

-- Cloud Accounts table indexes
CREATE INDEX IF NOT EXISTS idx_cloud_accounts_user_id ON cloud_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_accounts_provider ON cloud_accounts(provider);
CREATE INDEX IF NOT EXISTS idx_cloud_accounts_status ON cloud_accounts(status);
CREATE INDEX IF NOT EXISTS idx_cloud_accounts_user_provider ON cloud_accounts(user_id, provider);

-- Agent Sessions table indexes
CREATE INDEX IF NOT EXISTS idx_agent_sessions_user_id ON agent_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_deployment_id ON agent_sessions(deployment_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_status ON agent_sessions(status);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_created_at ON agent_sessions(created_at DESC);

-- Deployment Plans table indexes
CREATE INDEX IF NOT EXISTS idx_deployment_plans_deployment_id ON deployment_plans(deployment_id);
CREATE INDEX IF NOT EXISTS idx_deployment_plans_status ON deployment_plans(status);
CREATE INDEX IF NOT EXISTS idx_deployment_plans_created_at ON deployment_plans(created_at DESC);

-- Monitoring Metrics table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_monitoring_metrics_deployment_id ON monitoring_metrics(deployment_id) WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'monitoring_metrics');
CREATE INDEX IF NOT EXISTS idx_monitoring_metrics_timestamp ON monitoring_metrics(timestamp DESC) WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'monitoring_metrics');

-- Sessions table indexes (if using session storage)
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id) WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions');
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at) WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions');

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_projects_user_created ON projects(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deployments_project_created ON deployments(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deployments_user_created ON deployments(user_id, created_at DESC);

-- Full-text search indexes (for project names, descriptions)
CREATE INDEX IF NOT EXISTS idx_projects_name_trgm ON projects USING gin(name gin_trgm_ops) WHERE EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm');
CREATE INDEX IF NOT EXISTS idx_projects_description_trgm ON projects USING gin(description gin_trgm_ops) WHERE EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm');

-- Partial indexes for active/pending records (most queried)
CREATE INDEX IF NOT EXISTS idx_deployments_active ON deployments(project_id, created_at DESC) WHERE status IN ('pending', 'in_progress', 'deploying');
CREATE INDEX IF NOT EXISTS idx_agent_sessions_active ON agent_sessions(user_id, created_at DESC) WHERE status IN ('active', 'processing');

-- Analyze tables to update statistics
ANALYZE users;
ANALYZE projects;
ANALYZE deployments;
ANALYZE cloud_accounts;
ANALYZE agent_sessions;
ANALYZE deployment_plans;

-- Success message
SELECT 'Performance indexes created successfully!' AS message;

