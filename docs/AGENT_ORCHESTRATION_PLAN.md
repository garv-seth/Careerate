# Cara Orchestrator Upgrade Plan

## Objectives
- Keep user-facing experience simple: a single Cara chat input that accepts natural-language instructions.
- Internally coordinate specialist agents (CodeSmith, Architect, Guardian, Deployer, Researcher) without manual agent switching.
- Provide transparent progress updates, artifacts, and error handling.

## Current State
- `CaraOrchestrator` exposes placeholder methods but lacks a consolidated `/api/ai-agents/cara/chat` endpoint.
- Agent status endpoint returns project deployment info, not real-time task progress.
- Frontend `CaraWorkshop` assumes real agent responses but receives static mock data, leading to UX disconnect.

## Proposed Backend Flow
1. **Entry Point**: POST `/api/ai-agents/cara/chat`
   - Body: `{ message, projectId, context }`
   - Middleware ensures auth, fetches project metadata, and creates a task record.
2. **Cara Analysis**
   - Cara uses `CaraOrchestrator.analyzeIntent` to extract tasks, required tools, and risk level.
   - Returns plan with ordered subtasks and agent assignments.
3. **Delegation Pipeline**
   - For each subtask, orchestrator invokes `AgentManager.executeTask(agentId, payload)`.
   - Supports parallelization when tasks are independent.
4. **Streaming Feedback**
   - Use Server-Sent Events on `/api/ai-agents/cara/events/:taskId`.
   - Frontend subscribes to task updates (status, logs, generated files).
5. **Artifact Handling**
   - Generated code stored in temporary workspace (Azure Blob/Local FS) and surfaced via `/api/coding/projects/:id/files` refresh.
6. **Error Recovery**
   - On failure, orchestrator dispatches Guardian agent for triage and Cara summarizes fallback options.

## Data Model Additions
- `agent_tasks` table: task id, project id, user id, prompt, status, assigned agents, timestamps.
- `agent_events` table: task id, sequence, event type (`status`, `log`, `code_generation`, `deployment`), payload jsonb.

## Frontend Integration
- Cara chat sends command → receives taskId.
- Display timeline UI bound to SSE stream (progress chips, active agent avatars).
- File explorer refresh triggered when code_generation events arrive.
- Terminal tab mirrors logs from events with type `log` or `deployment`.

## Milestones
1. Implement `/api/ai-agents/cara/chat` with synchronous plan + task creation.
2. Add SSE streaming endpoint and wire to orchestrator events.
3. Update frontend hooks to consume task updates and remove mock data.
4. Expand integrations, deployment actions, and testing automation once core loop is stable.

