# Archived Documentation

**Purpose**: This directory contains historical documentation from Careerate V1.0 that is no longer actively used but preserved for reference.

---

## Archived Files

### V1.0 Deployment Logs (October 2025)
- `DEPLOYMENT_COMPLETE_v0.0.28.md` - Final v1.0 deployment completion log
- `DEPLOYMENT_SUCCESS_OCT_10_2025.md` - October 10 deployment success notes
- `PRODUCTION_STATUS_OCT_10.md` - Pre-rebuild production status
- `OAUTH_FIX_GUIDE.md` - GitHub/Microsoft OAuth fix guide (v1.0)

### Superseded Planning Documents
- `REBUILD_PROGRESS_OCT_11_2025.md` - Initial progress tracking (superseded by `CURRENT_STATUS.md`)

---

## Why These Were Archived

### Deployment Logs
These files documented v1.0 deployments and fixes. With the V2.0 rebuild underway, these are historical records that don't apply to the new architecture.

**Reason**: V2.0 uses Next.js 15 (not React 18), different deployment patterns, and new OAuth flows.

### Progress Tracking
`REBUILD_PROGRESS_OCT_11_2025.md` was the initial progress document but has been superseded by two more focused files:
- `IMPLEMENTATION_STATUS.md` - Comprehensive status dashboard
- `CURRENT_STATUS.md` - Quick status for AI agents

**Reason**: Consolidation and better organization.

---

## Active Documentation (Not Archived)

### V2.0 Planning & Design
- `MARKET_RESEARCH_2025.md` - Competitor analysis and market gaps
- `PORTER_INFRASTRUCTURE_PATTERNS.md` - Ejectable infrastructure guide
- `CAREERATE_POSITIONING.md` - Market positioning
- `ARCHITECTURE.md` - V2.0 system architecture
- `DESIGN_SYSTEM_V2.md` - UI/UX standards

### Status Tracking
- `IMPLEMENTATION_STATUS.md` - Comprehensive status dashboard
- `CURRENT_STATUS.md` - Quick status tracker

### Business Documents (Still Relevant)
- `BUSINESS-STRATEGY.md` - Pricing, market analysis
- `PITCH_DECK_BUSINESS_PLAN.md` - Fundraising materials
- `FOUNDER_HANDOFF.md` - Onboarding guide
- `README.md` - Project overview

---

## Restoration

If you need to reference these archived files:
1. They are preserved in Git history
2. They remain in `docs/archive/` directory
3. Search Git history: `git log --all --full-history -- "filename.md"`

---

## Cleanup Policy

**When to Archive**:
- Old deployment logs (older than 30 days and superseded by new deployments)
- Superseded planning documents (when consolidated into new files)
- Deprecated guides (when features are removed or replaced)

**When to Keep**:
- Active architecture documents
- Current status trackers
- Business strategy documents
- Any file referenced by active code

---

**Last Updated**: October 11, 2025  
**Archived By**: V2.0 Rebuild Cleanup

