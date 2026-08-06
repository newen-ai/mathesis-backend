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
