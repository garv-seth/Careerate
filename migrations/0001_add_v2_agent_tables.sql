-- Migration: Add V2.0 Agent System & Ejectable Infrastructure Tables
-- Date: October 11, 2025
-- Description: New tables for AI agents, deployment plans, cloud connections, and ejection exports

-- ============================================================================
-- AGENT SYSTEM TABLES
-- ============================================================================

-- Agent Sessions
CREATE TABLE IF NOT EXISTS agent_sessions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL DEFAULT 'deployment',
  conversation_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_context JSONB DEFAULT '{}'::jsonb,
  agent_state JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  model_used TEXT,
  total_tokens INTEGER DEFAULT 0,
  total_cost DECIMAL(10, 4) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

COMMENT ON TABLE agent_sessions IS 'Tracks AI agent conversation sessions with users';
COMMENT ON COLUMN agent_sessions.session_type IS 'Type of agent session: deployment, monitoring, cost-optimization, general';
COMMENT ON COLUMN agent_sessions.conversation_history IS 'Array of messages: [{role, content, timestamp}]';
COMMENT ON COLUMN agent_sessions.model_used IS 'AI model used: claude-35-sonnet, gpt-5, phi-4';

-- Deployment Plans
CREATE TABLE IF NOT EXISTS deployment_plans (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id VARCHAR REFERENCES projects(id) ON DELETE CASCADE,
  agent_session_id VARCHAR REFERENCES agent_sessions(id) ON DELETE SET NULL,
  natural_language_input TEXT NOT NULL,
  detected_framework TEXT,
  detected_dependencies JSONB DEFAULT '[]'::jsonb,
  provider TEXT NOT NULL,
  region TEXT NOT NULL,
  architecture JSONB NOT NULL,
  scaling_policy JSONB DEFAULT '{}'::jsonb,
  cost_estimate JSONB NOT NULL,
  reasoning TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  security_checks JSONB DEFAULT '[]'::jsonb,
  compliance_checks JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMP,
  approved_by VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  rejected_at TIMESTAMP,
  rejected_by VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  deployed_at TIMESTAMP,
  deployment_id VARCHAR,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE deployment_plans IS 'AI-generated deployment architecture plans';
COMMENT ON COLUMN deployment_plans.natural_language_input IS 'User original request in plain English';
COMMENT ON COLUMN deployment_plans.provider IS 'Cloud provider: aws, azure, gcp, vercel, railway';
COMMENT ON COLUMN deployment_plans.architecture IS 'Recommended architecture: {compute, database, storage, cdn, monitoring}';
COMMENT ON COLUMN deployment_plans.cost_estimate IS 'Estimated costs: {monthly, breakdown}';
COMMENT ON COLUMN deployment_plans.reasoning IS 'AI explanation for recommendations';
COMMENT ON COLUMN deployment_plans.status IS 'Plan status: pending, approved, rejected, deployed, failed';

-- Agent Actions
CREATE TABLE IF NOT EXISTS agent_actions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_session_id VARCHAR REFERENCES agent_sessions(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  model_used TEXT,
  action_details JSONB NOT NULL,
  reasoning TEXT,
  confidence DECIMAL(5, 2),
  risk_level TEXT,
  requires_approval BOOLEAN DEFAULT FALSE,
  approved BOOLEAN,
  approved_by VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'pending',
  result JSONB,
  error TEXT,
  execution_time_ms INTEGER,
  cost_impact INTEGER,
  resources_affected JSONB DEFAULT '[]'::jsonb,
  rollback_available BOOLEAN DEFAULT FALSE,
  rollback_executed_at TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

COMMENT ON TABLE agent_actions IS 'Audit log of all AI agent actions';
COMMENT ON COLUMN agent_actions.action_type IS 'Action type: deployment, scaling, rollback, healing, cost-optimization';
COMMENT ON COLUMN agent_actions.agent_type IS 'Agent type: planner, deployer, monitor, healer, cost-optimizer';
COMMENT ON COLUMN agent_actions.confidence IS 'AI confidence score (0-100)';
COMMENT ON COLUMN agent_actions.risk_level IS 'Risk level: low, medium, high';
COMMENT ON COLUMN agent_actions.status IS 'Action status: pending, executing, completed, failed, rolled-back';

-- Indexes for agent tables
CREATE INDEX IF NOT EXISTS idx_agent_sessions_user_id ON agent_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_status ON agent_sessions(status);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_created_at ON agent_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_deployment_plans_user_id ON deployment_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_deployment_plans_status ON deployment_plans(status);
CREATE INDEX IF NOT EXISTS idx_deployment_plans_provider ON deployment_plans(provider);

CREATE INDEX IF NOT EXISTS idx_agent_actions_user_action_type ON agent_actions(user_id, action_type);
CREATE INDEX IF NOT EXISTS idx_agent_actions_session ON agent_actions(agent_session_id);
CREATE INDEX IF NOT EXISTS idx_agent_actions_created_at ON agent_actions(created_at);

-- ============================================================================
-- CLOUD CONNECTIONS & EJECTABLE INFRASTRUCTURE
-- ============================================================================

-- Cloud Connections
CREATE TABLE IF NOT EXISTS cloud_connections (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_account_id TEXT,
  connection_name TEXT NOT NULL,
  connection_type TEXT NOT NULL,
  encrypted_credentials TEXT NOT NULL,
  credential_metadata JSONB DEFAULT '{}'::jsonb,
  permissions JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'connected',
  last_health_check TIMESTAMP,
  health_check_status TEXT,
  connected_at TIMESTAMP DEFAULT NOW(),
  ejected_at TIMESTAMP,
  ejected_by VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  revoked_at TIMESTAMP,
  revoked_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE cloud_connections IS 'User cloud account credentials (encrypted)';
COMMENT ON COLUMN cloud_connections.provider IS 'Cloud provider: aws, azure, gcp';
COMMENT ON COLUMN cloud_connections.provider_account_id IS 'AWS account ID, Azure subscription ID, or GCP project ID';
COMMENT ON COLUMN cloud_connections.connection_type IS 'Connection type: iam-role, service-principal, service-account';
COMMENT ON COLUMN cloud_connections.encrypted_credentials IS 'AES-256 encrypted credentials JSON';
COMMENT ON COLUMN cloud_connections.status IS 'Connection status: connected, ejected, revoked, error';

-- Ejection Exports
CREATE TABLE IF NOT EXISTS ejection_exports (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cloud_connection_id VARCHAR NOT NULL REFERENCES cloud_connections(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  template_format TEXT NOT NULL,
  templates JSONB NOT NULL,
  deployment_ids JSONB DEFAULT '[]'::jsonb,
  download_url TEXT,
  download_url_expiry TIMESTAMP,
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP,
  includes_management_guide BOOLEAN DEFAULT TRUE,
  post_ejection_notes TEXT,
  expires_at TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE ejection_exports IS 'Infrastructure as Code templates for ejected accounts';
COMMENT ON COLUMN ejection_exports.template_format IS 'Template format: cloudformation, arm, terraform';
COMMENT ON COLUMN ejection_exports.templates IS 'Array of IaC templates: [{name, content, type}]';
COMMENT ON COLUMN ejection_exports.download_url IS 'Signed URL for ZIP download';

-- Indexes for cloud connection tables
CREATE INDEX IF NOT EXISTS idx_cloud_connections_user_provider ON cloud_connections(user_id, provider);
CREATE INDEX IF NOT EXISTS idx_cloud_connections_status ON cloud_connections(status);

CREATE INDEX IF NOT EXISTS idx_ejection_exports_user_id ON ejection_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_ejection_exports_cloud_connection_id ON ejection_exports(cloud_connection_id);

-- ============================================================================
-- USER PREFERENCES & CONTROLS
-- ============================================================================

-- Autonomy Settings
CREATE TABLE IF NOT EXISTS autonomy_settings (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  level TEXT NOT NULL DEFAULT 'supervised',
  cost_limit INTEGER,
  max_resources_per_deployment INTEGER DEFAULT 10,
  require_approval_for_actions JSONB DEFAULT '[]'::jsonb,
  auto_scaling_enabled BOOLEAN DEFAULT FALSE,
  auto_healing_enabled BOOLEAN DEFAULT FALSE,
  cost_optimization_enabled BOOLEAN DEFAULT TRUE,
  notification_preferences JSONB DEFAULT '{}'::jsonb,
  disclaimer_accepted BOOLEAN DEFAULT FALSE,
  disclaimer_accepted_at TIMESTAMP,
  disclaimer_version TEXT,
  risk_acknowledgement TEXT,
  emergency_contact_email TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE autonomy_settings IS 'User AI agent control preferences';
COMMENT ON COLUMN autonomy_settings.level IS 'Autonomy level: supervised, semi-autonomous, fully-autonomous';
COMMENT ON COLUMN autonomy_settings.cost_limit IS 'Max monthly spend in cents';
COMMENT ON COLUMN autonomy_settings.require_approval_for_actions IS 'Array of action types requiring approval';

-- Cost Alerts
CREATE TABLE IF NOT EXISTS cost_alerts (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cloud_connection_id VARCHAR REFERENCES cloud_connections(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  threshold INTEGER,
  current_spend INTEGER NOT NULL DEFAULT 0,
  projected_spend INTEGER,
  percentage_of_threshold DECIMAL(5, 2),
  anomaly_details JSONB,
  triggered_at TIMESTAMP DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMP,
  acknowledged_by VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  action_taken TEXT,
  notifications_sent JSONB DEFAULT '[]'::jsonb,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE cost_alerts IS 'Budget threshold notifications';
COMMENT ON COLUMN cost_alerts.alert_type IS 'Alert type: threshold, anomaly, forecast';
COMMENT ON COLUMN cost_alerts.threshold IS 'Threshold in cents';
COMMENT ON COLUMN cost_alerts.current_spend IS 'Current spend in cents';
COMMENT ON COLUMN cost_alerts.action_taken IS 'Action: none, scaled-down, disabled-resources, notified-user';

-- Indexes for user preference tables
CREATE INDEX IF NOT EXISTS idx_autonomy_settings_user_id ON autonomy_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_cost_alerts_user_provider ON cost_alerts(user_id, provider);
CREATE INDEX IF NOT EXISTS idx_cost_alerts_triggered_at ON cost_alerts(triggered_at);
CREATE INDEX IF NOT EXISTS idx_cost_alerts_acknowledged ON cost_alerts(acknowledged);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Update migration version
INSERT INTO public.schema_version (version, description, applied_at)
VALUES ('v2.0.0', 'Add AI agent system and ejectable infrastructure tables', NOW())
ON CONFLICT DO NOTHING;

COMMENT ON SCHEMA public IS 'Careerate V2.0 - AI Agent System & Ejectable Infrastructure';

