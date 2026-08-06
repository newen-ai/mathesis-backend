# Backend Agent Rules

## Live Files (Mandatory)

For every backend task in this workspace, agents must:

1. Read docs/ui-spec-live.md before implementation.
2. Read docs/agent-live-context.md before implementation.
3. Reconcile requested scope with statuses in docs/ui-spec-live.md.
4. Update docs/ui-spec-live.md first if implementation status changes.
5. Append a session entry in docs/agent-live-context.md after meaningful changes.

Required session entry fields:
- Date/time
- Agent name
- Summary
- Changed files
- Next actions

## Profile Scope Baseline
- Source UI spec file version comes from backend HTML filename only.
- Current implementation priority: profile core + experience + education.

## Command Autonomy
- Agents should run non-destructive verification commands automatically after meaningful edits, without asking for conversational confirmation first.
- Pre-approved verification commands include: npm run lint, npm run typecheck, npm run build, npm test.
- Agents should still avoid destructive or state-changing commands unless explicitly requested (for example: database reset, hard git reset, force push).
