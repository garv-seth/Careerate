# Vibe Coding Experience Revamp

## 1. Current Issues
- **Out-of-memory crash**: `CaraWorkshop` mounts Monaco twice (heavy bundle) and renders full-screen overlays inside `AppShell`, bloating layout and leaking DOM nodes on navigation.
- **Broken agent APIs**: frontend calls `/api/agents/status` and `/api/agents/cara/chat`, but backend only exposes `/api/ai-agents/status`; chat route is unimplemented.
- **Mock-only workspace**: file tree and terminal rely on mock data, so the IDE is non-functional for real repos or deployments.
- **Usability gaps**: tabs overflow without virtualization, sidebars lack true resize persistence, and terminal/chat share one column unlike Replit-style multi-pane flow.
- **Integrations UX**: integrations list is static; Replit-style marketplace view and actionable connect buttons are missing.

## 2. Product Goals
- Preserve the existing WSL matrix background and dark aesthetic.
- Deliver a Careerate-specific, Replit-inspired IDE with:
  - Persistent, multi-root file explorer backed by real project data.
  - Monaco-based editor with tab tearing, diff view, and AI annotations.
  - Cara as a master orchestrator: single chat input, automated agent delegation, result summaries, and inline code updates.
  - Native deployment controls (“Vibe Hosting”) surfaced contextually with preview URLs.
  - Integrations marketplace with actionable connect/configure flows.
- Maintain high performance on mid-range laptops (< 1.5 GB tab memory).

## 3. Technical Plan
### Phase 0 – Stabilization (Bugfix)
1. **Monaco singleton**: lazy-load editor with dynamic import and ensure we unmount cleanly on route changes.
2. **API alignment**: rename frontend endpoints to `/api/ai-agents/status` and scaffold `/api/ai-agents/cara/chat` to match orchestrator flow.
3. **Layout memory leak**: gate expensive background effects behind a single root container and remove duplicated `h-screen` wrappers.

### Phase 1 – Workspace Foundation
1. Replace mock file tree with backend `GET /api/coding/projects/:id/files` (already partially implemented) and add websocket or polling for updates.
2. Implement tab store (Zustand or React Context) with capped history, lazy syntax highlighting, and dirty indicator state management.
3. Persist panel sizing using `localStorage` so users keep preferred layout.

### Phase 2 – Cara Orchestration
1. Backend: extend `CaraOrchestrator` to accept a single `/chat` entry point, fan out to specialist agents, and stream progress updates via Server-Sent Events (SSE).
2. Frontend: add activity timeline, inline code suggestions, and task status chips per agent.

### Phase 3 – Integrations & Deployment
1. Build integrations marketplace UI (grid cards with `Connect` CTA) backed by `GET /api/integrations/catalog` and `POST /api/integrations/:id/connect`.
2. Expose deployment recipes (Vibe Hosting) with natural-language prompts pre-populated from templates and server-side execution via DevOps agent.

### Phase 4 – Polish & Performance
1. Add keyboard shortcuts palette, command bar, and spotlight search.
2. Enable collaborative cursors using existing `useCollaboration` hook once backend WebSocket is stable.
3. Budget-based performance testing (Lighthouse < 3 seconds TTI, memory < 700 MB idle).

## 4. Next Actions
- [ ] Refactor `CaraWorkshop` to load Monaco lazily and use real data hooks.
- [ ] Update agent API routes and scaffold Cara orchestrator endpoints.
- [ ] Design new integrations marketplace wireframes (Figma) and translate into `IntegrationsPane` component.
- [ ] Draft natural-language deployment flow linking coding → hosting.

