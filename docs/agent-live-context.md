# Agent Live Context

Purpose: Shared handoff file. Every new agent must read this file before coding and update it after meaningful changes.

## Mandatory Workflow
1. Read docs/ui-spec-live.md and this file before any implementation.
2. Reconcile task scope with current open items.
3. After changes, append a new session log with changed files and next actions.
4. If scope changes, update docs/ui-spec-live.md first, then log here.

## Open Items
- Volunteering, projects, organizations, and skills sections are still pending for full v0.2 parity.
- Digital credential flow is still pending.
- Run Prisma migration against a configured DATABASE_URL environment.

## Session Log
### 2026-08-05 00:00 - Bootstrap
- Agent: GitHub Copilot
- Summary: Initialized persistent handoff workflow and versioned spec tracking.
- Files changed:
  - docs/ui-spec-live.md
  - docs/agent-live-context.md
- Next:
  - Add instruction files so future agents enforce read/update flow.
  - Implement profile model and UI extensions.

### 2026-08-05 00:45 - Profile core + education implementation
- Agent: GitHub Copilot
- Summary: Implemented profile core field expansion and education history in backend and frontend.
- Files changed:
  - prisma/schema.prisma
  - prisma/migrations/20260805120000_add_profile_core_and_education_history/migration.sql
  - src/modules/profile/profile.types.ts
  - src/modules/profile/profile.schemas.ts
  - src/modules/profile/profile.service.ts
  - src/modules/profile/profile.routes.ts
  - src/modules/profile/profile.controller.ts
  - ../mathesis-ui/src/lib/api/profile.ts
  - ../mathesis-ui/src/app/(platform)/_lib/types.ts
  - ../mathesis-ui/src/app/(platform)/_lib/constants.ts
  - ../mathesis-ui/src/app/(platform)/_lib/hooks/useProfessionalProfile.ts
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileFormCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileInitializationView.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ExperienceCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/EducationCard.tsx
- Next:
  - Apply migration with prisma migrate dev once DATABASE_URL is configured.
  - Add integration tests for education-history endpoint operations.
  - Continue profile parity with remaining v0.2 sections.

### 2026-08-05 01:20 - Perfil UI redesign pass
- Agent: GitHub Copilot
- Summary: Reworked /perfil composition to align visually with the provided screenshot (import banner, large hero cover with avatar overlap, action buttons, and stacked section cards).
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileFormCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ExperienceCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/EducationCard.tsx
  - ../mathesis-ui/src/components/ui/AppCard.tsx
  - ../mathesis-ui/src/app/globals.css
- Next:
  - Compare /perfil side-by-side with the HTML reference and tune spacing/typography details.
  - Continue with remaining profile sections in v0.2 (projects, volunteering, organizations, skills).

### 2026-08-05 01:45 - Perfil UX fixes pass
- Agent: GitHub Copilot
- Summary: Fixed profile detail display style, restored month/year dropdown persistence, and added explicit feedback for section-level save flows.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileFormCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ExperienceCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/EducationCard.tsx
- Next:
  - Validate interactions manually on /perfil for add/edit/save flow in experience and education.
  - Continue visual fine-tuning for full screenshot fidelity.

### 2026-08-05 02:05 - Screenshot-only simplification pass
- Agent: GitHub Copilot
- Summary: Removed non-target UI elements and hidden extra property rendering to match provided screenshot and HTML intent.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileFormCard.tsx
- Next:
  - Confirm whether Acerca de should remain the only visible profile detail block in view mode.
  - Continue remaining section parity and visual polishing.

### 2026-08-05 02:35 - Global edit and experience style pass
- Agent: GitHub Copilot
- Summary: Removed per-section edit entry points, kept a single global edit control, removed extra Acerca helper text, and restyled experience list toward screenshot parity.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileFormCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ExperienceCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/EducationCard.tsx
- Next:
  - Finish micro-typography/spacing tuning for experience card against latest screenshot.
  - Continue parity for remaining profile sections.

### 2026-08-05 03:05 - Perfil typography parity pass
- Agent: GitHub Copilot
- Summary: Aligned profile, about, experience, and education text scales to the HTML v0.2 typography ranges (section titles, role/meta lines, body copy, badge/button text), while preserving the single global edit flow.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileFormCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ExperienceCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/EducationCard.tsx
  - ../mathesis-ui/src/app/globals.css
- Next:
  - Review /perfil on desktop and mobile against the v0.2 HTML to fine-tune final spacing deltas.
  - Continue pending v0.2 sections (voluntariado, proyectos, organizaciones, aptitudes).

### 2026-08-05 03:25 - Perfil spacing rhythm pass
- Agent: GitHub Copilot
- Summary: Tightened vertical rhythm and section density in perfil cards (header offsets, section spacing, row padding, and divider spacing) to better mirror the v0.2 HTML profile layout while keeping existing global edit behavior.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileFormCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ExperienceCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/EducationCard.tsx
- Next:
  - Do a visual compare pass for remaining tiny spacing offsets in mobile.
  - Continue pending v0.2 sections (voluntariado, proyectos, organizaciones, aptitudes).

### 2026-08-05 03:40 - Perfil mobile pixel-nudge pass
- Agent: GitHub Copilot
- Summary: Applied mobile-only proportional tweaks for perfil hero/avatar/title/headline/actions and compacted card/row paddings at small breakpoints, preserving desktop values and global edit behavior.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileFormCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ExperienceCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/EducationCard.tsx
- Next:
  - Validate final mobile rendering against HTML screenshot and tweak only if a specific remaining mismatch is identified.
  - Continue pending v0.2 sections (voluntariado, proyectos, organizaciones, aptitudes).

### 2026-08-05 04:10 - Experience description end-to-end support
- Agent: GitHub Copilot
- Summary: Added work experience description to database schema, backend profile contracts/service persistence, and frontend experience form/view so users can create, edit, save, and display description text from the profile experience section.
- Files changed:
  - docs/ui-spec-live.md
  - prisma/schema.prisma
  - prisma/migrations/20260805150000_add_work_experience_description/migration.sql
  - src/modules/profile/profile.types.ts
  - src/modules/profile/profile.schemas.ts
  - src/modules/profile/profile.service.ts
  - ../mathesis-ui/src/lib/api/profile.ts
  - ../mathesis-ui/src/app/(platform)/_lib/types.ts
  - ../mathesis-ui/src/app/(platform)/_lib/constants.ts
  - ../mathesis-ui/src/app/(platform)/_lib/hooks/useProfessionalProfile.ts
  - ../mathesis-ui/src/app/(platform)/_components/home/ExperienceCard.tsx
- Next:
  - Run migration against the target database environment so the new description column exists in all deployed DBs.
  - Validate experience description behavior manually in /perfil (add/edit/read-only rendering).

### 2026-08-05 04:18 - Local migration applied
- Agent: GitHub Copilot
- Summary: Executed migrate deploy against local environment and successfully applied 20260805150000_add_work_experience_description.
- Files changed:
  - docs/agent-live-context.md
- Next:
  - Apply the same migration in non-local environments.
  - Validate experience description behavior manually in /perfil (add/edit/read-only rendering).

### 2026-08-05 04:35 - Experience description persistence + Ver mas
- Agent: GitHub Copilot
- Summary: Fixed experience description persistence by always sending description in ADD/EDIT profile operations (including empty values for explicit clears) and implemented read-only Ver mas/menos toggle for long experience descriptions.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/home/ExperienceCard.tsx
  - ../mathesis-ui/src/app/(platform)/_lib/hooks/useProfessionalProfile.ts
  - docs/agent-live-context.md
- Next:
  - Manually validate add/edit/clear description persistence on /perfil.
  - Confirm Ver mas behavior in both collapsed and expanded states.

### 2026-08-05 04:42 - Toggle copy accent pass
- Agent: GitHub Copilot
- Summary: Updated experience description toggle label to use accented Spanish copy ("más") while keeping "menos" unchanged.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/home/ExperienceCard.tsx
  - docs/agent-live-context.md
- Next:
  - Validate final text rendering in /perfil for collapsed/expanded description state.

### 2026-08-06 00:20 - Experience edit-mode redesign
- Agent: GitHub Copilot
- Summary: Reworked experience edit mode to mirror the provided mockup: list-first manager layout with large title, reorder handles visual, add button, row-level edit/delete actions, and on-demand form opening for add/edit.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/home/ExperienceCard.tsx
  - docs/agent-live-context.md
- Next:
  - Validate UX flow in /perfil for add/edit/delete/save with the new manager-style layout.
  - Decide whether to implement actual drag-and-drop reorder behavior beyond the visual handle cue.

### 2026-08-06 00:45 - ExperienceCard parse recovery + cleanup
- Agent: GitHub Copilot
- Summary: Rebuilt ExperienceCard to a single coherent JSX tree, removed duplicated corrupted fragments, and restored compilable screenshot-style edit mode while preserving description persistence and mas/menos behavior.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/home/ExperienceCard.tsx
  - docs/agent-live-context.md
- Next:
  - Run manual visual parity pass against the screenshot for spacing/iconography in edit mode.
  - Optionally replace visual reorder cue with real drag-and-drop if required.

### 2026-08-06 01:05 - Section-level edit entry controls
- Agent: GitHub Copilot
- Summary: Removed the experience reorder helper text and replaced global profile edit control with per-section edit buttons that open each section's own edit view (Acerca de, Experiencia, Formacion academica).
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileFormCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ExperienceCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/EducationCard.tsx
  - docs/agent-live-context.md
- Next:
  - Manually verify per-section open/close transitions in /perfil on desktop and mobile.
  - Decide whether successful section save should auto-close the section editor.

### 2026-08-06 01:20 - Academics manager edit parity
- Agent: GitHub Copilot
- Summary: Reworked Formacion academica edit mode to mirror Experiencia: list-first manager view with large header, add CTA, row-level edit/delete icons, on-demand add/edit form panel, and section-level save/discard flow.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/home/EducationCard.tsx
  - docs/agent-live-context.md
- Next:
  - Validate /perfil academics add/edit/delete/save interactions and spacing against the reference screenshot.
  - Optionally implement true drag-and-drop ordering if required for academics.

### 2026-08-06 01:35 - Header eye-button for readonly self preview
- Agent: GitHub Copilot
- Summary: Added a new header button styled like the edit CTA but with an eye icon, wired to redirect to /perfil?userId=<current user id> so users can preview their own profile as others see it.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - ../mathesis-ui/src/app/(platform)/_lib/hooks/useProfessionalProfile.ts
  - docs/agent-live-context.md
- Next:
  - Validate redirect behavior manually in /perfil and confirm readonly controls hide correctly in preview mode.

### 2026-08-06 02:05 - Profile image fields end-to-end
- Agent: GitHub Copilot
- Summary: Added profile image URL and banner image URL support end-to-end across Prisma schema/migration, backend profile contracts/service validation, and frontend forms/header rendering with fallback styles.
- Files changed:
  - docs/ui-spec-live.md
  - prisma/schema.prisma
  - prisma/migrations/20260806154000_add_profile_images/migration.sql
  - src/modules/profile/profile.types.ts
  - src/modules/profile/profile.schemas.ts
  - src/modules/profile/profile.service.ts
  - ../mathesis-ui/src/lib/api/profile.ts
  - ../mathesis-ui/src/app/(platform)/_lib/types.ts
  - ../mathesis-ui/src/app/(platform)/_lib/constants.ts
  - ../mathesis-ui/src/app/(platform)/_lib/hooks/useProfessionalProfile.ts
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileFormCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileInitializationView.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - docs/agent-live-context.md
- Next:
  - Apply the new Prisma migration in target environments.
  - Validate real image URLs render correctly for both banner and avatar in /perfil.

### 2026-08-06 02:35 - Header file-picker uploads with avatar adjustment
- Agent: GitHub Copilot
- Summary: Implemented hover camera overlays on avatar/banner to open file picker directly from header, added avatar adjustment modal (zoom + move with live circular preview), and saved the processed avatar/banner as data URLs through existing profile save flow.
- Files changed:
  - src/modules/profile/profile.schemas.ts
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - docs/agent-live-context.md
- Next:
  - Validate large-image behavior and response size in the deployed API environment.
  - If needed, move from data-URL persistence to file upload storage for smaller payloads.

### 2026-08-06 02:50 - Avatar drag and mouse-wheel controls
- Agent: GitHub Copilot
- Summary: Replaced slider controls in avatar editor with direct drag-and-drop positioning plus mouse-wheel zoom, keeping live circular preview and save flow unchanged.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - docs/agent-live-context.md
- Next:
  - Optionally add touch gestures (drag + pinch) for mobile avatar positioning.

### 2026-08-06 03:05 - Banner drag-and-wheel arrangement modal
- Agent: GitHub Copilot
- Summary: Updated banner upload flow to open an editor modal before save, with drag-to-position and mouse-wheel zoom so users can preview the visible header area before persisting.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - docs/agent-live-context.md
- Next:
  - Add touch drag/pinch gestures for mobile banner editing.

### 2026-08-06 03:20 - Banner preview fit + mobile touch gestures
- Agent: GitHub Copilot
- Summary: Fixed banner editor baseline fit so images are not initially truncated, and added mobile touch support (drag + pinch zoom) for both avatar and banner editors.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - docs/agent-live-context.md
- Next:
  - Optionally add inertial bounds/limits so dragging cannot move images too far outside frame.

### 2026-08-06 03:35 - Banner crop target synced to real header space
- Agent: GitHub Copilot
- Summary: Restored original profile header banner height behavior and updated banner editor to crop/export against the real on-page banner dimensions, so what users edit matches what is displayed.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - docs/agent-live-context.md
- Next:
  - Optionally store banner focal point metadata to preserve intent across very different viewport widths.

### 2026-08-06 03:45 - Banner editor uncropped baseline
- Agent: GitHub Copilot
- Summary: Changed banner editor preview/export baseline to contain-fit so images no longer appear pre-cropped when opening the editor; users now choose crop explicitly via zoom and drag.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - docs/agent-live-context.md
- Next:
  - Optionally add a one-click "Llenar area" action to jump from full-fit to cover-fit when desired.

### 2026-08-06 04:05 - CI push trigger + touch typing build fix
- Agent: GitHub Copilot
- Summary: Enabled backend CI to trigger on push to dev/stage/main and fixed the frontend build error by widening touch distance helper argument types to accept React touch points.
- Files changed:
  - .github/workflows/ci.yml
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - docs/agent-live-context.md
- Next:
  - Verify next merge to dev creates a backend CI run under Actions.

### 2026-08-06 04:15 - CI scope restricted to dev only
- Agent: GitHub Copilot
- Summary: Updated backend CI workflow triggers so it runs only for push and pull_request events targeting dev.
- Files changed:
  - .github/workflows/ci.yml
  - docs/agent-live-context.md
- Next:
  - Confirm next push/PR to dev triggers CI as expected and no runs happen for stage/main.

### 2026-08-06 04:30 - Agent command autonomy policy
- Agent: GitHub Copilot
- Summary: Added workspace instruction rules so agents automatically run non-destructive verification commands (lint/typecheck/build/test) after meaningful edits without conversational confirmation.
- Files changed:
  - AGENTS.md
  - ../mathesis-ui/AGENTS.md
  - docs/agent-live-context.md
- Next:
  - Set VS Code tool approval preferences to always allow safe terminal commands in this workspace to suppress IDE-level prompts.

### 2026-08-06 11:10 - Backend workflow disabled
- Agent: GitHub Copilot
- Summary: Removed backend GitHub Actions workflow file so backend has no active CI workflow for now, per current delivery scope.
- Files changed:
  - .github/workflows/ci.yml (deleted)
  - docs/agent-live-context.md
- Next:
  - Reintroduce backend workflow when backend CI scope is ready.
  - If UI pushes still do not trigger, verify repository-level Actions settings and branch targeting in the UI repository.

### 2026-08-06 11:45 - Profile/Home color token parity pass
- Agent: GitHub Copilot
- Summary: Normalized profile-related font and control colors to the same shared theme tokens used on Home (text-primary/secondary/soft, line, surface variants), removing hardcoded slate shades in profile/edit cards and image editor modals.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileFormCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ExperienceCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/EducationCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileInitializationView.tsx
  - docs/agent-live-context.md
- Next:
  - Do a quick visual QA pass in /perfil (light + dark theme) to confirm contrast and hierarchy match Home.
