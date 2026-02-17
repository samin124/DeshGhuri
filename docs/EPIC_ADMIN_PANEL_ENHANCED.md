# Epic: Admin Panel (Enhanced Features)

This epic extends `docs/prd.md` Epic 14 (Admin Panel) with additional stories based on the current admin system and next-stage operations requirements.

## Scope

- Keep existing Admin Panel capabilities from Epic 14.
- Add security hardening, advanced operations, and scalable admin workflows.

## User Stories

| Story ID | User Story | Priority | SP | Acceptance Criteria | Edge Cases |
| -------- | ---------- | -------- | -- | ------------------- | ---------- |
| US-14.11 | As a super admin, I want mandatory 2FA for admin accounts so unauthorized access is reduced | P0 | 5 | 2FA enrollment required for admin roles, backup codes supported, login blocked after grace period | Lost authenticator device requires secure recovery flow |
| US-14.12 | As a super admin, I want IP allowlist and trusted-device policies so admin access is restricted to approved environments | P0 | 5 | Role-based IP allowlist, trusted device sessions, failed access alerting | Traveling admins use time-bound bypass with approval |
| US-14.13 | As a super admin, I want granular permission sets by module and action so least-privilege access is enforced | P0 | 8 | Custom permission profiles, action-level scopes (read/write/approve/refund/export), backend enforcement on all admin APIs | Permission changes invalidate stale elevated sessions |
| US-14.14 | As a support admin, I want a unified support ticket console linked to users, sellers, and bookings so issue handling is centralized | P0 | 5 | Ticket create/assign/escalate, SLA status tracking, internal notes, linked entity context | Duplicate tickets can be merged without data loss |
| US-14.15 | As a risk admin, I want a fraud-risk dashboard so suspicious users, sellers, and transactions are triaged faster | P1 | 8 | Risk scores, trigger reasons, review queue, manual decision with required reason | False positives can be whitelisted with audit trail |
| US-14.16 | As an admin, I want maker-checker approval for high-risk actions so critical operations require dual control | P0 | 8 | Refund, seller suspension, escrow release require submitter + approver, immutable approvals log | Submitter cannot self-approve |
| US-14.17 | As an admin, I want bulk actions with dry-run preview so large moderation tasks can be executed safely | P1 | 5 | Bulk select by filters, preview affected records, reason-required confirmation, partial-failure report | Long-running jobs support retry and resume |
| US-14.18 | As a finance/compliance admin, I want scheduled compliance report exports so audit prep is automated | P1 | 5 | Scheduled CSV/PDF exports, encrypted links, retention policy controls, access logging | Large exports are chunked and resumable |
| US-14.19 | As an admin, I want a real-time alert center so critical operational incidents are detected quickly | P1 | 3 | Configurable alert thresholds, acknowledge/snooze/escalate states, multi-channel delivery (email/webhook) | Alert storms are deduplicated by rule window |
| US-14.20 | As an admin lead, I want incident timelines with postmortem notes so resolution and learnings are traceable | P1 | 5 | Incident severity/owner/status, timeline of system + admin actions, closure checklist, searchable archive | Reopened incidents preserve full historical timeline |

**Epic Total: 57 SP**

## Dependency Notes

- Builds on existing Admin APIs and pages under `apps/server/src/routes/admin` and `apps/web/src/routes/admin`.
- Requires extension of audit logging to cover approval workflow, alerts, and incident lifecycle data.

