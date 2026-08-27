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

### 2026-08-10 23:45 - Authenticated password change end-to-end
- Agent: GitHub Copilot
- Summary: Implemented authenticated password change from Configuración by adding backend route/controller/service/schema support (`POST /auth/change-password`) and wiring the frontend change-password page to submit to the real endpoint with response-based UI feedback.
- Files changed:
  - docs/ui-spec-live.md
  - src/modules/auth/auth.schemas.ts
  - src/modules/auth/auth.controller.ts
  - src/modules/auth/auth.routes.ts
  - src/modules/auth/auth.service.ts
  - test/integration/auth.integration.test.ts
  - ../mathesis-ui/src/lib/api/auth.ts
  - ../mathesis-ui/src/app/(platform)/account/configuration/change-password/page.tsx
- Next:
  - Run full integration suite after aligning legacy integration fixtures with current password policy validation requirements.

### 2026-08-19 15:20 - Ateneo non-member preview + join
- Agent: GitHub Copilot
- Summary: Implemented non-member group preview and join flow by opening discover groups to their detail page, exposing public group metadata/rules for non-members, and adding a backend join endpoint that enables full member access after joining.
- Files changed:
  - docs/ui-spec-live.md
  - src/modules/ateneo/ateneo.schemas.ts
  - src/modules/ateneo/ateneo.types.ts
  - src/modules/ateneo/ateneo.service.ts
  - src/modules/ateneo/ateneo.controller.ts
  - src/modules/ateneo/ateneo.routes.ts
  - ../mathesis-ui/src/lib/api/ateneo.ts
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoExploreGroups.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoGroupsExplorer.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoGroupFeed.tsx
- Next:
  - Validate join flow end-to-end against real API auth session.
  - Confirm non-members still cannot access topic/comment endpoints before joining.

### 2026-08-19 16:00 - Ateneo admin-only topic/comment gating
- Agent: GitHub Copilot
- Summary: Added persisted admin-only permission modes for topic creation and commenting in Ateneo groups, enforced them in backend create endpoints, and hid the matching create/comment CTAs in the frontend when the current user is not an admin.
- Files changed:
  - docs/ui-spec-live.md
  - prisma/schema.prisma
  - prisma/migrations/20260819150000_add_ateneo_group_permission_modes/migration.sql
  - src/modules/ateneo/ateneo.schemas.ts
  - src/modules/ateneo/ateneo.types.ts
  - src/modules/ateneo/ateneo.service.ts
  - ../mathesis-ui/src/lib/api/ateneo.ts
  - ../mathesis-ui/src/app/(platform)/ateneo/create/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoGroupFeed.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoNewTopicForm.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoTopicDiscussion.tsx
- Next:
  - Confirm the existing groups that should use admin-only settings are created/edited with the new mode values.
  - Optionally add read-only explanatory copy where users hit the hidden-CTA state on the new-topic and discussion screens.

### 2026-08-19 16:25 - Ateneo group action pages
- Agent: GitHub Copilot
- Summary: Started implementation of the group header action buttons and their destination pages: info, members, and admin-only edit with prefilled config.
- Files changed:
  - docs/ui-spec-live.md
- Next:
  - Add backend group members/update endpoints.
  - Wire the header buttons into the group middle column.
  - Reuse the new-group form for the edit page.

### 2026-08-19 17:00 - Ateneo group info/members/edit completed
- Agent: GitHub Copilot
- Summary: Finished the Ateneo middle-column header actions and destination pages: info, members, and admin-only edit. Added backend members/update endpoints and reused the new-group form for the edit UI.
- Files changed:
  - docs/ui-spec-live.md
  - docs/agent-live-context.md
  - prisma/schema.prisma
  - src/modules/ateneo/ateneo.schemas.ts
  - src/modules/ateneo/ateneo.types.ts
  - src/modules/ateneo/ateneo.service.ts
  - src/modules/ateneo/ateneo.controller.ts
  - src/modules/ateneo/ateneo.routes.ts
  - ../mathesis-ui/src/lib/api/ateneo.ts
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoGroupHeaderActions.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoGroupForm.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoGroupInfoPanel.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoGroupMembersPanel.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoGroupEditPanel.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoGroupFeed.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/info/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/members/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/edit/page.tsx
- Next:
  - Optionally add admin-only hint copy to the info/members pages if the UX needs to explain the edit affordance.

### 2026-08-19 18:10 - Pages export route fix for Ateneo
- Agent: GitHub Copilot
- Summary: Resolved export-mode build failures by adding generateStaticParams to Ateneo dynamic routes and centralizing static param generation from local Ateneo seed data.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/ateneo/_lib/static-params.ts
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/edit/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/info/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/members/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/new-topic/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/topics/[topicId]/page.tsx
- Next:
  - Keep the static params list in sync with any new Ateneo mock/seed routes used in export builds.

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

### 2026-08-07 01:20 - Email confirmation flow
- Agent: GitHub Copilot
- Summary: Added a token-based email confirmation flow that creates a verification token at registration, exposes a public /auth/confirm endpoint, and persists email_verified_at in the database when the confirmation link is visited. The UI now includes a confirmation page at /confirm that completes the verification handshake and shows a success/error state.
- Files changed:
  - prisma/schema.prisma
  - prisma/migrations/20260807120000_add_email_verification/migration.sql
  - src/modules/auth/auth.service.ts
  - src/modules/auth/auth.controller.ts
  - src/modules/auth/auth.routes.ts
  - ../mathesis-ui/src/lib/api/auth.ts
  - ../mathesis-ui/src/app/confirm/page.tsx
  - test/integration/auth.integration.test.ts
  - docs/agent-live-context.md
- Next:
  - Hook the real email sender into the registration flow once an SMTP/resend provider is configured, so the confirmation link is actually emailed rather than only returned in the registration response.
  - Verify the confirmation page in the browser once the frontend is running.

### 2026-08-07 02:30 - Registration success redirect
- Agent: GitHub Copilot
- Summary: Redirected successful registrations to a standalone /registro/enviado page that shows the submitted email and keeps the page outside the platform navbar shell. Also refactored the /confirm flow to avoid the prerender-time useSearchParams issue by moving token handling into a client leaf component.
- Files changed:
  - ../mathesis-ui/src/app/registro/page.tsx
  - ../mathesis-ui/src/app/registro/enviado/page.tsx
  - ../mathesis-ui/src/app/confirm/page.tsx
  - ../mathesis-ui/src/app/confirm/ConfirmClient.tsx
  - docs/agent-live-context.md
- Next:
  - Confirm the /registro/enviado copy and spacing in the browser.
  - Keep the confirm page token handling aligned with future auth flow changes if the response shape changes again.

### 2026-08-07 07:47 - Forgot-password page 1 (request view) kickoff
- Agent: GitHub Copilot
- Summary: Started forgot-password flow implementation with the first request-email page at /forgot-password, wired the login CTA to this route, and built the page to match provided desktop/mobile references with light and dark mode parity using existing theme tokens.
- Files changed:
  - docs/ui-spec-live.md
  - ../mathesis-ui/src/app/login/page.tsx
  - ../mathesis-ui/src/app/forgot-password/page.tsx
  - docs/agent-live-context.md
- Next:
  - Review screenshot parity for /forgot-password in both light and dark modes and apply UI corrections.
  - Implement /forgot-password/sent (page 2) once page 1 is approved.

### 2026-08-07 07:55 - Forgot-password login-size parity refinement
- Agent: GitHub Copilot
- Summary: Refined /forgot-password typography and spacing to align with login page sizing system (form width, labels, input height, button size, and desktop/mobilized text scales) while preserving the forgot-password layout/content.
- Files changed:
  - ../mathesis-ui/src/app/forgot-password/page.tsx
  - docs/agent-live-context.md
- Next:
  - Validate updated visual parity between /login and /forgot-password in light and dark themes.
  - Proceed to /forgot-password/sent after page 1 approval.

### 2026-08-07 08:01 - Forgot-password page 2 (sent view)
- Agent: GitHub Copilot
- Summary: Implemented /forgot-password/sent with login-consistent auth layout, light/dark token-based styling, query-param email resolution, masked email display, and actions to return to login or restart with another email.
- Files changed:
  - docs/ui-spec-live.md
  - ../mathesis-ui/src/app/forgot-password/sent/page.tsx
  - docs/agent-live-context.md
- Next:
  - Review /forgot-password/sent in light and dark themes for screenshot parity adjustments.
  - Proceed to page 3 reset form after page 2 approval.

### 2026-08-07 08:17 - Forgot-password mobile parity fix pass
- Agent: GitHub Copilot
- Summary: Reworked mobile layout for both /forgot-password and /forgot-password/sent to match expected pattern: dedicated navy top header section, white content block below, adjusted spacing/typography, and preserved desktop split behavior and theme token compatibility.
- Files changed:
  - ../mathesis-ui/src/app/forgot-password/page.tsx
  - ../mathesis-ui/src/app/forgot-password/sent/page.tsx
  - docs/agent-live-context.md
- Next:
  - Validate both pages against updated mobile screenshots in light and dark modes.
  - Proceed to page 3 after page 2 visual signoff.

### 2026-08-07 08:27 - Frontend UI guideline live file + mobile scale correction
- Agent: GitHub Copilot
- Summary: Added a frontend live UI-guidelines file and enforced AGENTS instruction to read/update it for UI direction changes. Also reduced oversized mobile font scales on forgot-password pages and changed top mobile helper from static "Ayuda con tu contrasena" text to clickable "Atras" linking to /login.
- Files changed:
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
  - ../mathesis-ui/AGENTS.md
  - ../mathesis-ui/src/app/forgot-password/page.tsx
  - ../mathesis-ui/src/app/forgot-password/sent/page.tsx
  - docs/agent-live-context.md
- Next:
  - Validate mobile visual parity for both forgot-password pages after typography reduction.
  - Continue to page 3 implementation once page 2 visuals are approved.

### 2026-08-07 08:42 - Sent page title scale + redundant action removal
- Agent: GitHub Copilot
- Summary: Updated /forgot-password/sent heading scale to 1.35rem and removed the "Usar otro email" action because the mobile top "Atras" control already covers the return path.
- Files changed:
  - ../mathesis-ui/src/app/forgot-password/sent/page.tsx
  - docs/agent-live-context.md
- Next:
  - Confirm visual parity for /forgot-password/sent after heading size update.
  - Continue to page 3 once page 2 is approved.

### 2026-08-07 08:46 - Spanish orthography enforcement in FE copy
- Agent: GitHub Copilot
- Summary: Replaced remaining "contrasena" occurrences with "contraseña" in forgot-password sent copy and added explicit frontend guideline rules requiring Spanish accents and "ñ" in all UI text.
- Files changed:
  - ../mathesis-ui/src/app/forgot-password/sent/page.tsx
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
  - docs/agent-live-context.md
- Next:
  - Keep Spanish copy in auth flow aligned with orthography rules during page 3 implementation.
  - Continue forgot-password flow after final page 2 signoff.

### 2026-08-07 08:54 - Shared logo/basePath helper refactor
- Agent: GitHub Copilot
- Summary: Centralized repeated logo/basePath path logic into `src/lib/assets.ts` and refactored login, registro, forgot-password pages, top bar, and app layout to use shared exports. Added FE guideline rule to avoid redefining asset path constants per file.
- Files changed:
  - ../mathesis-ui/src/lib/assets.ts
  - ../mathesis-ui/src/app/layout.tsx
  - ../mathesis-ui/src/app/login/page.tsx
  - ../mathesis-ui/src/app/registro/page.tsx
  - ../mathesis-ui/src/app/forgot-password/page.tsx
  - ../mathesis-ui/src/app/forgot-password/sent/page.tsx
  - ../mathesis-ui/src/app/(platform)/_components/TopBar.tsx
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
  - docs/agent-live-context.md
- Next:
  - Reuse `src/lib/assets.ts` for any future shared static asset path additions.
  - Continue forgot-password flow implementation after current UI signoff.

### 2026-08-07 09:03 - Shared email utility extraction (DRY)
- Agent: GitHub Copilot
- Summary: Extracted repeated frontend email helper logic into `src/lib/utils/email.ts` (normalize input, resolve query param, mask email) and refactored forgot-password/login/registro pages to consume shared helpers. Updated FE live guidelines with a reusable-function lookup map and explicit anti-duplication rule.
- Files changed:
  - ../mathesis-ui/src/lib/utils/email.ts
  - ../mathesis-ui/src/app/forgot-password/sent/page.tsx
  - ../mathesis-ui/src/app/registro/enviado/page.tsx
  - ../mathesis-ui/src/app/login/page.tsx
  - ../mathesis-ui/src/app/forgot-password/page.tsx
  - ../mathesis-ui/src/app/registro/page.tsx
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
  - docs/agent-live-context.md
- Next:
  - Check shared utility modules first before adding page-local helper functions.
  - Continue forgot-password flow implementation after page 2 UI signoff.

### 2026-08-07 09:21 - Reset-password page (page 3) implementation
- Agent: GitHub Copilot
- Summary: Implemented `/reset-password` from provided mobile screenshot with inferred desktop parity from existing auth pages. Added token-aware submit flow, password confirmation, requirement checklist bars, service error popup integration, and redirect to `/login` on success. Added `resetPassword` API client call to `/auth/confirm-reset`.
- Files changed:
  - docs/ui-spec-live.md
  - ../mathesis-ui/src/lib/api/auth.ts
  - ../mathesis-ui/src/app/reset-password/page.tsx
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
  - docs/agent-live-context.md
- Next:
  - Verify visual parity of `/reset-password` in light and dark themes (mobile + desktop).
  - Wire backend endpoints/token validation if not yet available.

### 2026-08-07 09:55 - Password reset migration recovery
- Agent: GitHub Copilot
- Summary: Resolved a failed local Prisma migration by marking `20260807120000_add_email_verification` as applied after confirming its columns already existed in the database, then reran `npm run migrate:deploy local` successfully. Also updated the deploy helper to run `prisma generate` after a successful deploy so the generated client stays in sync with newly applied schema fields.
- Files changed:
  - scripts/migrate-deploy.ts
  - docs/agent-live-context.md
- Next:
  - Keep using `npm run migrate:deploy <env>` for future schema changes, and resolve any failed migration entries before deploying new ones.
  - If a local dev database drifts again, inspect `_prisma_migrations` first before resetting it.

### 2026-08-07 10:10 - Shared Resend email helper
- Agent: GitHub Copilot
- Summary: Consolidated the duplicate Resend API request/response logic in `src/common/services/email.service.ts` into one generic `sendResendEmail` helper, then kept verification and password reset mailers as thin subject/body wrappers.
- Files changed:
  - src/common/services/email.service.ts
  - docs/agent-live-context.md
- Next:
  - Reuse `sendResendEmail` for any future auth or notification emails that target Resend.
  - Keep email-specific content in the caller and transport-specific code in the shared helper.

### 2026-08-07 10:25 - Shared auth password schema
- Agent: GitHub Copilot
- Summary: Centralized auth password validation in `src/modules/auth/auth.schemas.ts` by introducing one shared `passwordSchema` and reusing it for register, login, and password reset flows so the password policy stays consistent.
- Files changed:
  - src/modules/auth/auth.schemas.ts
  - docs/agent-live-context.md
- Next:
  - Reuse `passwordSchema` anywhere else the backend accepts a password field.
  - Keep login/register/reset password validation aligned if the password policy changes again.

### 2026-08-07 09:31 - Reset-password header and semaphore refinement
- Agent: GitHub Copilot
- Summary: Set `Creá una nueva contraseña` heading size to 1.35rem, removed `Restablecer acceso` eyebrow from reset-password headers, generalized page-local password evaluation into shared `src/lib/utils/password.ts`, and updated semaphore behavior to weak/normal/strong states (red/yellow/green bar patterns).
- Files changed:
  - ../mathesis-ui/src/lib/utils/password.ts
  - ../mathesis-ui/src/app/reset-password/page.tsx
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
  - docs/agent-live-context.md
- Next:
  - Validate `/reset-password` visual parity in light/dark with updated title scale and header simplification.
  - Reuse `src/lib/utils/password.ts` for future password forms to avoid duplication.

### 2026-08-07 09:38 - Reset-password success feedback before redirect
- Agent: GitHub Copilot
- Summary: Replaced immediate post-submit redirect with inline success feedback state on `/reset-password`, added automatic redirect to `/login` after 2 seconds, and included a manual "Ir ahora a iniciar sesión" button for immediate navigation.
- Files changed:
  - ../mathesis-ui/src/app/reset-password/page.tsx
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
  - docs/agent-live-context.md
- Next:
  - Validate success-state visuals in light/dark themes and confirm redirect timing feels right.
  - Continue backend wiring for reset-token validation and confirm-reset endpoint behavior.

### 2026-08-08 13:20 - Desktop topbar profile menu implementation
- Agent: GitHub Copilot
- Summary: Implemented a desktop-first avatar-triggered profile menu in the topbar to mirror the provided layout, bound menu header identity fields to live profile data, and enabled first-pass interactions (logout functional, existing route-backed items navigable, placeholders visible without navigation). Mobile menu behavior was preserved for later dedicated UI work.
- Files changed:
  - docs/ui-spec-live.md
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
  - ../mathesis-ui/src/app/(platform)/_components/TopBar.tsx
  - docs/agent-live-context.md
- Next:
  - Perform screenshot-based visual tuning pass for desktop menu typography and spacing against the latest reference.
  - Hook remaining placeholder menu items to routes once their corresponding pages are implemented.

### 2026-08-08 13:26 - Desktop topbar menu size reduction
- Agent: GitHub Copilot
- Summary: Reduced the desktop profile menu footprint further by centralizing shared menu typography values in global CSS and trimming the panel width, padding, and label sizes to better match the full-page screenshot.
- Files changed:
  - ../mathesis-ui/src/app/globals.css
  - ../mathesis-ui/src/app/(platform)/_components/TopBar.tsx
  - docs/agent-live-context.md
- Next:
  - Check the smaller menu in-browser against the full-page comparison and only nudge if any remaining mismatch is still visually large.

### 2026-08-08 14:10 - Desktop topbar 3/4 role options + HTML icon extraction
- Agent: GitHub Copilot
- Summary: Implemented desktop horizontal topbar role gating so non-admin users now see exactly Feed, Mensajes, Notificaciones while admin users see those three plus Admin, and replaced desktop quick-nav markers with extracted HTML v0.2 icon components (feed, message, bell, settings geometry).
- Files changed:
  - docs/ui-spec-live.md
  - ../mathesis-ui/src/app/(platform)/_components/DesktopTopbarIcons.tsx
  - ../mathesis-ui/src/app/(platform)/_components/TopBar.tsx
  - ../mathesis-ui/src/app/globals.css
  - docs/agent-live-context.md
- Next:

### 2026-08-13 10:15 - Enterprise edit and delete flow
- Agent: GitHub Copilot
- Summary: Added owner-scoped enterprise update and delete backend routes, wired list-card actions to the real API, and created the dynamic edit page for /my-enterprises/[enterpriseId]/edit so admins can update or remove their own company entries.
- Files changed:
  - src/modules/enterprise/enterprise.schemas.ts
  - src/modules/enterprise/enterprise.service.ts
  - src/modules/enterprise/enterprise.controller.ts
  - src/modules/enterprise/enterprise.routes.ts
  - ../mathesis-ui/src/lib/api/enterprise.ts
  - ../mathesis-ui/src/app/(platform)/my-enterprises/page.tsx
  - ../mathesis-ui/src/app/(platform)/my-enterprises/[enterpriseId]/edit/page.tsx
  - docs/ui-spec-live.md
- Next actions:
  - Validate the edit/delete flow with a browser run and confirm the final static export route constraint is met.
  - Keep future enterprise changes limited to the current owner-scoped contract unless product rules expand again.

  - Validate screenshot-level visual parity for icon sizing/alignment against the latest topbar reference.
  - Confirm final admin icon preference (settings vs brand mark) if design direction changes.

### 2026-08-08 14:35 - Rename linkedin classes/selectors to mathesis
- Agent: GitHub Copilot
- Summary: Renamed all remaining `linkedin-` prefixed class names and matching CSS selectors to `mathesis-` across shell, card, topbar, nav, composer trigger, and phrase banner naming to align project vocabulary while preserving behavior.
- Files changed:
  - ../mathesis-ui/src/app/globals.css
  - ../mathesis-ui/src/components/ui/AppCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/TopBar.tsx
  - ../mathesis-ui/src/app/(platform)/_components/ModulePage.tsx
  - ../mathesis-ui/src/app/(platform)/_components/auth/SessionGate.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileInitializationView.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/HomeView.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ComposerCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/CatchyPhrasesBanner.tsx
  - docs/agent-live-context.md
  - docs/ui-spec-live.md
- Next:
  - Keep future CSS utility names under `mathesis-` prefix for consistency.

### 2026-08-09 00:00 - Feed reactions kickoff
- Agent: GitHub Copilot
- Summary: Started feed reaction implementation work with a future-proof single-reaction backend/db shape and matching Valorar / Valorado UI copy target.
- Files changed:
  - docs/ui-spec-live.md
  - docs/agent-live-context.md
- Next:
  - Add feed reaction model, toggle endpoint, and list payload enrichment in the backend.
  - Wire the feed card button to persisted reaction state in the UI.

### 2026-08-09 16:15 - Frontend avatar consistency pass
- Agent: GitHub Copilot
- Summary: Standardized frontend avatar rendering so all updated surfaces now use profile image when available and consistently fall back to two initials, replacing mixed single-initial implementations.
- Files changed:
  - ../mathesis-ui/src/lib/utils/name.ts
  - ../mathesis-ui/src/components/ui/UserAvatar.tsx
  - ../mathesis-ui/src/app/(platform)/_lib/hooks/useProfessionalProfile.ts
  - ../mathesis-ui/src/app/(platform)/_components/TopBar.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/HomeView.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ComposerCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/FeedPostCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - ../mathesis-ui/src/app/(platform)/mensajes/page.tsx
  - ../mathesis-ui/src/lib/api/profile.ts
  - ../mathesis-ui/src/lib/api/feed.ts
  - ../mathesis-ui/src/lib/api/chat.ts
  - docs/agent-live-context.md
- Next:
  - If backend payloads are expanded further with profile image fields in additional endpoints, continue routing them through `UserAvatar` to keep behavior consistent.
  - Run a quick manual UI sweep of feed/topbar/mensajes to confirm visual parity across desktop and mobile states.

### 2026-08-09 16:32 - Feed author avatar payload fix
- Agent: GitHub Copilot
- Summary: Fixed feed author payload serialization so each post now includes `author.profileImageUrl`, enabling the frontend feed card to render profile photos instead of falling back to initials when an image exists.
- Files changed:
  - src/modules/feed/feed.types.ts
  - src/modules/feed/feed.service.ts
  - docs/agent-live-context.md
- Next:
  - Restart/redeploy backend service so the updated feed payload is served to the UI.
  - Verify feed cards display profile images for users with `profileImageUrl` and two-initial fallback otherwise.

### 2026-08-09 16:45 - Messages avatar payload fix
- Agent: GitHub Copilot
- Summary: Fixed chat payload serialization so chat members and message senders now include `profileImageUrl`, enabling the mensajes UI to render profile photos instead of initials when an image exists.
- Files changed:
  - src/modules/chat/chat.types.ts
  - src/modules/chat/chat.service.ts
  - docs/agent-live-context.md
- Next:
  - Restart/redeploy backend service so updated chat payloads are served to the UI.
  - Verify mensajes thread list and contact picker display profile images for users with `profileImageUrl` and two-initial fallback otherwise.

### 2026-08-10 14:09 - Configuración UI first pass
- Agent: GitHub Copilot
- Summary: Implemented the first-pass Configuración UI at /account/configuration for mobile and desktop, moved the active dark-mode control into the page, removed the standalone topbar theme toggles, and wired menu access to the new route.
- Files changed:
  - docs/ui-spec-live.md
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
  - ../mathesis-ui/src/lib/theme/useUiTheme.ts
  - ../mathesis-ui/src/app/(platform)/account/configuration/page.tsx
  - ../mathesis-ui/src/app/(platform)/_components/TopBar.tsx
  - docs/agent-live-context.md
- Next:
  - Review the new Configuración page visually against the provided screenshots and adjust spacing/iconography if needed.
  - Confirm whether placeholder rows should remain non-functional until their dedicated screens are provided.
  - After UI approval, add backend preference persistence for theme and hydrate Configuración from that API.

### 2026-08-10 14:19 - Bloqueados panel prototype in Configuración
- Agent: GitHub Copilot
- Summary: Added interactive Bloqueados row behavior to open a blocked-users panel with example records, including per-user reminder comments shown under each user to represent the future block-reason note.
- Files changed:
  - docs/ui-spec-live.md
  - ../mathesis-ui/src/app/(platform)/account/configuration/page.tsx
  - docs/agent-live-context.md
- Next:
  - Replace example blocked-users rows with backend data once a blocked-users table and endpoints are implemented.
  - Add create/update flow for the block-reason note when block actions are wired.

### 2026-08-10 15:00 - Change-password page UI
- Agent: GitHub Copilot
- Summary: Created dedicated change-password page at /account/configuration/change-password matching both desktop (gold left panel + right form) and mobile (back button + stacked form) reference screenshots. Includes password strength semaphore, frontend validation, and success state. Submit is a UI placeholder pending backend endpoint. Wired Cambiar contraseña row in Configuración to navigate to the new route.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/account/configuration/change-password/page.tsx
  - ../mathesis-ui/src/app/(platform)/account/configuration/page.tsx
  - docs/agent-live-context.md
- Next:
  - Implement POST /auth/change-password backend endpoint (currentPassword, newPassword) and wire it to the form's onSubmit.
  - Replace the setTimeout placeholder with the real API call once backend is ready.

### 2026-08-10 14:24 - Bloqueados dedicated page redesign
- Agent: GitHub Copilot
- Summary: Replaced the Bloqueados overlay interaction with a dedicated route page matching the provided desktop reference, including a back button to return to the previous view, warning copy block, example blocked user card with reminder note, and informational right rail.
- Files changed:
  - docs/ui-spec-live.md
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
  - ../mathesis-ui/src/app/(platform)/account/configuration/page.tsx
  - ../mathesis-ui/src/app/(platform)/account/configuration/blocked/page.tsx
  - docs/agent-live-context.md
- Next:
  - Replace example blocked record(s) with API-backed blocked-users data once backend tables/endpoints exist.
  - Wire Desbloquear and block-reason creation/editing actions after backend scope is approved.

### 2026-08-18 14:15 - Ateneo new-topic composer UI mock pass
- Agent: GitHub Copilot
- Summary: Added a local mock composer to the group feed so the `+ Nuevo tema` control opens a draft form, accepts title/description/tone values, and prepends a new topic entry to the visible feed list without backend persistence.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoGroupFeed.tsx
  - docs/ui-spec-live.md
  - docs/agent-live-context.md
- Next actions:
  - Verify the composer visually in the browser and polish copy/spacing if needed.
  - Decide whether the next iteration should include actual validation states or backend persistence once the UI is approved.

### 2026-08-10 23:58 - Password eye-toggle across all fields
- Agent: GitHub Copilot
- Summary: Added a shared eye-toggle password input component and replaced every password field in login, registration, reset-password, and authenticated change-password pages so users can switch between hidden and visible password text consistently.
- Files changed:
  - ../mathesis-ui/src/components/ui/PasswordInput.tsx
  - ../mathesis-ui/src/app/login/page.tsx
  - ../mathesis-ui/src/app/registro/page.tsx
  - ../mathesis-ui/src/app/reset-password/page.tsx
  - ../mathesis-ui/src/app/(platform)/account/configuration/change-password/page.tsx
  - docs/agent-live-context.md
- Next:
  - Run a quick manual UX pass in mobile and desktop to confirm icon tap target and spacing are comfortable on all auth screens.

### 2026-08-10 23:59 - Dark-mode gold eye icon styling
- Agent: GitHub Copilot
- Summary: Updated the shared password visibility toggle styles to use theme tokens and apply brand gold in dark mode for better contrast and visual consistency.
- Files changed:
  - ../mathesis-ui/src/components/ui/PasswordInput.tsx
  - ../mathesis-ui/src/app/globals.css
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
  - docs/agent-live-context.md
- Next:
  - Validate the updated icon color on login, registro, reset-password, and configuración/change-password pages in dark mode.

### 2026-08-10 23:59 - Invalidate other sessions on password change
- Agent: GitHub Copilot
- Summary: Implemented auth session version rotation so password changes invalidate other active sessions while preserving the current session with a refreshed token.
- Files changed:
  - prisma/schema.prisma
  - prisma/migrations/20260810235900_add_auth_session_version/migration.sql
  - src/modules/auth/auth.types.ts
  - src/modules/auth/auth.service.ts
  - src/modules/auth/auth.controller.ts
  - src/common/middlewares/require-auth.ts
  - test/integration/auth.integration.test.ts
  - docs/ui-spec-live.md
  - docs/agent-live-context.md
- Next:
  - Run the full integration suite after legacy fixtures across all integration files are updated to strong passwords compliant with current auth policy.

### 2026-08-12 10:30 - Profile badge UI wired to backend badge slugs
- Agent: GitHub Copilot
- Summary: Exposed active user badges in profile API responses and replaced the hardcoded perfil header chip with dynamic badge chips rendered under the profile name using slug-to-title formatting with integral sign prefix.
- Files changed:
  - docs/ui-spec-live.md
  - docs/agent-live-context.md
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
  - src/modules/profile/profile.types.ts
  - src/modules/profile/profile.service.ts
  - ../mathesis-ui/src/lib/api/profile.ts
  - ../mathesis-ui/src/app/(platform)/_lib/hooks/useProfessionalProfile.ts
  - ../mathesis-ui/src/lib/utils/badge.ts
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
- Next:
  - Run a quick manual check in /perfil for users with 0, 1, and multiple active badges to confirm wrapping and spacing.
  - If design requires special aliasing (for example "AR" instead of "Argentina"), add optional label overrides per slug in the UI utility.

### 2026-08-12 11:20 - Mis empresas UI first pass
- Agent: GitHub Copilot
- Summary: Implemented first-pass My Enterprises screen at /my-enterprises with screenshot-aligned desktop layout, mobile-consistent responsive behavior, two hardcoded enterprise rows, and placeholder-only action buttons. Wired both existing "Mis Empresas" drawer entries (desktop + mobile) to this route.
- Files changed:
  - docs/ui-spec-live.md
  - ../mathesis-ui/src/app/(platform)/_components/TopBar.tsx
  - ../mathesis-ui/src/app/(platform)/my-enterprises/page.tsx
  - docs/agent-live-context.md
- Next:
  - Implement backend enterprise model + endpoints and replace hardcoded rows with API data.
  - Wire CTA/button actions (crear, editar, eliminar, ver directorio) once backend scope starts.

### 2026-08-12 11:45 - Enterprises typography scale + dark-mode status contrast
- Agent: GitHub Copilot
- Summary: Fixed low-contrast "Aprobada" badge styling in dark mode and introduced a shared 5-step typography scale utility in global styles, then refactored /my-enterprises to use the shared classes instead of ad-hoc font-size values.
- Files changed:
  - ../mathesis-ui/src/app/globals.css
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
  - ../mathesis-ui/src/app/(platform)/my-enterprises/page.tsx
  - docs/agent-live-context.md
- Next:
  - Apply the new text-scale utility classes gradually across other existing UI pages to reduce one-off size values.
  - Keep enterprise status chips on token-based classes for future API-driven status variants.

### 2026-08-12 12:05 - Crear nueva empresa navigation + form screen
- Agent: GitHub Copilot
- Summary: Wired the "Crear nueva empresa" action on /my-enterprises to open /my-enterprises/create and implemented the requested form screen with screenshot-aligned structure, preserving placeholder-only behavior and setting the primary CTA text to "Crear empresa".
- Files changed:
  - docs/ui-spec-live.md
  - ../mathesis-ui/src/app/(platform)/my-enterprises/page.tsx
  - ../mathesis-ui/src/app/(platform)/my-enterprises/create/page.tsx
  - docs/agent-live-context.md
- Next:
  - Connect the create form to backend enterprise creation/request endpoint when backend phase starts.
  - Replace placeholder form submission with API validation and success/error states.

### 2026-08-12 12:30 - Dark/light theme parity hardening for enterprises UI
- Agent: GitHub Copilot
- Summary: Improved dark-theme readability by replacing light-only heading/button text colors in enterprise pages with semantic theme-aware tokens/classes from globals.css, and updated agent instruction files to require dark/light validation and token-first color usage for future UI tasks.
- Files changed:
  - ../mathesis-ui/src/app/globals.css
  - ../mathesis-ui/src/app/(platform)/my-enterprises/page.tsx
  - ../mathesis-ui/src/app/(platform)/my-enterprises/create/page.tsx
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
  - ../mathesis-ui/AGENTS.md
  - docs/agent-live-context.md
- Next:
  - Apply semantic heading/button/link color classes gradually across other platform pages still using light-only navy or fixed hex text colors.
  - Keep new UI pages token-first and verify light/dark parity before signoff.

### 2026-08-12 12:55 - Crear empresa required validation + submit redirect
- Agent: GitHub Copilot
- Summary: Converted /my-enterprises/create to a client form with required validation for "Nombre de la empresa" and "Tu rol", showing inline field-level errors when missing and redirecting to /my-enterprises when submission is valid. Also synchronized the live spec source to the newly added v0.4 HTML file.
- Files changed:
  - docs/ui-spec-live.md
  - ../mathesis-ui/src/app/(platform)/my-enterprises/create/page.tsx
  - docs/agent-live-context.md
- Next:
  - Replace current redirect-only submit flow with backend request submission and success/error toasts once API is available.
  - Reuse the same client validation rules in backend DTO/schema to keep parity.

### 2026-08-12 13:35 - Enterprises backend endpoints + UI wiring
- Agent: GitHub Copilot
- Summary: Implemented the first backend slice for enterprises with Prisma model/migration and authenticated endpoints to create and list the current user's enterprises. Wired frontend create/list pages to these endpoints, preserving field validation and redirect behavior after successful creation.
- Files changed:
  - prisma/schema.prisma
  - prisma/migrations/20260812143000_add_enterprises_module/migration.sql
  - src/modules/enterprise/enterprise.types.ts
  - src/modules/enterprise/enterprise.schemas.ts
  - src/modules/enterprise/enterprise.service.ts
  - src/modules/enterprise/enterprise.controller.ts
  - src/modules/enterprise/enterprise.routes.ts
  - src/routes/index.ts
  - docs/ui-spec-live.md
  - ../mathesis-ui/src/lib/api/enterprise.ts
  - ../mathesis-ui/src/app/(platform)/my-enterprises/page.tsx
  - ../mathesis-ui/src/app/(platform)/my-enterprises/create/page.tsx
  - ../mathesis-ui/src/app/globals.css
  - docs/agent-live-context.md
- Next:
  - Add backend update/delete enterprise endpoints and connect existing UI placeholder actions.
  - Add integration tests for enterprise create/list authorization and validation paths.

### 2026-08-12 13:55 - Enterprises list friendly empty-state fallback
- Agent: GitHub Copilot
- Summary: Updated /my-enterprises list loading UX so failed/empty fetch cases no longer show a red technical error banner and instead fall back to a friendly empty-state message indicating the user still has no created companies.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/my-enterprises/page.tsx
  - docs/agent-live-context.md
- Next:
  - Add explicit API error typing on the frontend to distinguish true server failures from expected empty-list states once backend error contracts are finalized.

### 2026-08-12 14:10 - Enterprise status removal (UI + backend + DB)
- Agent: GitHub Copilot
- Summary: Removed enterprise approval/pending/rejected status from the product scope by deleting status rendering in the UI list, removing status from API types/contracts, and dropping the Enterprise status column/enum/index in Prisma with a dedicated migration.
- Files changed:
  - prisma/schema.prisma
  - prisma/migrations/20260812152000_drop_enterprise_status/migration.sql
  - src/modules/enterprise/enterprise.types.ts
  - src/modules/enterprise/enterprise.service.ts
  - docs/ui-spec-live.md
  - ../mathesis-ui/src/lib/api/enterprise.ts
  - ../mathesis-ui/src/app/(platform)/my-enterprises/page.tsx
  - ../mathesis-ui/src/app/globals.css
  - docs/agent-live-context.md
- Next:
  - Apply the new migration in each environment to remove the status column from existing databases.
  - Remove any future status-related business logic from upcoming edit/delete enterprise endpoints.

### 2026-08-15 11:40 - Admin dashboard tab contrast pass
- Agent: GitHub Copilot
- Summary: Updated admin dashboard tab states to improve readability by using navy/blue styling for inactive items and gold styling for active items, including the nested whitelist view tabs. Added this direction to UI live guidelines to keep future admin UI changes consistent.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/admin/page.tsx
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
  - docs/agent-live-context.md
- Next:
  - Validate the updated tab contrast manually in both light and dark themes on /admin.
  - Apply the same color-state pattern to any future admin tab groups for visual consistency.

### 2026-08-15 12:05 - Mathesis admin Mensa management UX pass
- Agent: GitHub Copilot
- Summary: Refined the Mathesis admin Mensa panel to show only current Mensa Empresarios admins in the list, switched list rows to navy backgrounds for readability, and added an "Agregar admin" searchable popup to grant ME admin access. Removed the top-level "Recargar datos" and "Abrir dashboard de Mensa Empresarios" actions from the Mathesis admin dashboard and increased contrast for admin subtitle/summary/helper texts.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/admin/page.tsx
  - ../mathesis-ui/src/app/(platform)/_components/ModulePage.tsx
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
  - docs/agent-live-context.md
- Next:
  - Validate the new popup flow and ME-admin-only list behavior manually in light and dark themes.
  - Apply the same contrast approach to any remaining low-contrast admin copy if found during QA.

### 2026-08-15 12:25 - Companies admin route rename + style parity
- Agent: GitHub Copilot
- Summary: Renamed the dedicated Mensa admin UI route to `/admin/companies-admin`, kept `/admin/mensa-admin` as a compatibility redirect, and applied the same high-contrast blue-background/white-text styling to the companies-admin request and access lists.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/admin/companies-admin/page.tsx
  - ../mathesis-ui/src/app/(platform)/admin/mensa-admin/page.tsx
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
  - docs/agent-live-context.md
- Next:
  - Validate manual navigation and redirect behavior between `/admin/mensa-admin` and `/admin/companies-admin`.
  - Confirm readability in both light and dark themes for all list cards and chips on companies-admin.

### 2026-08-15 12:45 - Companies admin tabs + icon actions, legacy route removed
- Agent: GitHub Copilot
- Summary: Removed the old `mensa-admin` route completely, converted `/admin/companies-admin` into two tabs (pending requests and approved users), added icon-only approve/reject actions for pending requests, and added an icon action to remove approved users from Mensa Empresarios access.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/admin/companies-admin/page.tsx
  - ../mathesis-ui/src/lib/utils/admin-mock.ts
  - ../mathesis-ui/src/app/(platform)/admin/mensa-admin/page.tsx (deleted)
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
  - docs/agent-live-context.md
- Next:
  - Manually verify tab switching and icon actions in `/admin/companies-admin` on both desktop and mobile.
  - Confirm remove-access behavior aligns with expected ME admin governance rules before backend implementation.

### 2026-08-15 13:30 - Mensa Empresarios backend + frontend integration
- Agent: GitHub Copilot
- Summary: Replaced all mock localStorage data with a real backend implementation. Added `mensaEmpresariosAdminAt` to User model, created `MensaBadgeRequest` model and migration, built a companies module (service/schemas/controller/routes), registered it at `/api/v1/admin/companies/*`. Updated frontend admin/page.tsx Mensa tab and companies-admin/page.tsx to call the real API. Deleted admin-mock.ts. TypeCheck and lint pass on both workspaces.
- Files changed:
  - prisma/schema.prisma
  - prisma/migrations/20260815140000_add_mensa_empresarios_admin_and_badge_requests/migration.sql
  - src/modules/companies/companies.service.ts
  - src/modules/companies/companies.schemas.ts
  - src/modules/companies/companies.controller.ts
  - src/modules/companies/companies.routes.ts
  - src/routes/index.ts
  - ../mathesis-ui/src/lib/api/admin.ts
  - ../mathesis-ui/src/app/(platform)/admin/page.tsx
  - ../mathesis-ui/src/app/(platform)/admin/companies-admin/page.tsx
  - ../mathesis-ui/src/lib/utils/admin-mock.ts (deleted)
  - docs/ui-spec-live.md
  - docs/agent-live-context.md
- Next:
  - Run `prisma migrate deploy` against the target database to apply the new migration.
  - Validate the full admin flows end-to-end (badge request approve/reject, member removal, admin grant/revoke, search).

### 2026-08-15 14:05 - Companies dashboard ME-only access enforcement
- Agent: GitHub Copilot
- Summary: Removed the Mathesis admin role bypass from companies dashboard middleware so only users with `mensaEmpresariosAdminAt` can access companies-admin routes. This aligns the backend policy with the product rule that only ME admins can use the ME dashboard.
- Files changed:
  - src/modules/companies/companies.routes.ts
  - docs/ui-spec-live.md
  - docs/agent-live-context.md
- Next:
  - Verify access matrix manually: non-ME users (including role=admin without ME flag) should get 403 on `/api/v1/admin/companies/access-check`; ME admins should get 200.
  - Validate companies-admin frontend behavior after auth change (authorized view vs access denied state).

### 2026-08-15 14:18 - Companies access-denied back navigation
- Agent: GitHub Copilot
- Summary: Added a visible "Volver al inicio" action on the companies-admin forbidden state so users denied ME-admin access can return to home in one click.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/admin/companies-admin/page.tsx
  - docs/agent-live-context.md
- Next:
  - Validate the forbidden state on `/admin/companies-admin` in light and dark themes and confirm the new button routes to `/`.

### 2026-08-15 15:00 - Home Mensa membership CTA state-driven flow
- Agent: GitHub Copilot
- Summary: Implemented a state-driven Mensa Empresarios CTA in Home right sidebar with three states: request membership, cancel open request, and go-to-Mensa label when badge is active. Added authenticated backend endpoints for membership state, create request, and cancel request so this flow can be reused from future UI entry points.
- Files changed:
  - src/modules/companies/companies.service.ts
  - src/modules/companies/companies.schemas.ts
  - src/modules/companies/companies.controller.ts
  - src/modules/companies/companies.routes.ts
  - ../mathesis-ui/src/lib/api/admin.ts
  - ../mathesis-ui/src/app/(platform)/_components/home/HomeView.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/RightSidebar.tsx
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
  - docs/ui-spec-live.md
  - docs/agent-live-context.md
- Next:
  - Confirm CTA transitions end-to-end on `/` for: no badge/no request, pending request, and active badge.
  - Decide final redirect target for `Ir a Mensa Empresarios` and replace temporary placeholder behavior.

### 2026-08-16 00:35 - Temporary ME admin topbar shortcut
- Agent: GitHub Copilot
- Summary: Added a temporary topbar shortcut for ME admins only, driven by the companies access-check endpoint, so testers can jump directly to `/admin/companies-admin` from the main navigation.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/TopBar.tsx
  - ../mathesis-ui/src/lib/api/admin.ts
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
  - docs/ui-spec-live.md
  - docs/agent-live-context.md
- Next:
  - Verify the shortcut appears for ME admins and remains hidden for non-ME users.
  - Remove the shortcut once the permanent navigation path is decided.

### 2026-08-16 02:05 - Ateneo explore groups first screen (UI mock pass)
- Agent: GitHub Copilot
- Summary: Added an Ateneo entry in platform navigation and implemented the first Ateneo screen at `/ateneo` as a mock-only explore-groups page with search and tabbed groups (`Tus grupos`, `Descubrir`, `Grupos que administrás`) aligned to the provided desktop/mobile references.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/TopBar.tsx
  - ../mathesis-ui/src/app/(platform)/_components/DesktopTopbarIcons.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_lib/mock-data.ts
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
  - docs/ui-spec-live.md
  - docs/agent-live-context.md
- Next:
  - Validate `/ateneo` in light and dark themes on desktop and mobile.
  - Continue with the next Ateneo screen after user approval of this first screen.

### 2026-08-16 02:28 - Ateneo create-group flow wiring (UI mock pass)
- Agent: GitHub Copilot
- Summary: Implemented functional redirection for all `Crear grupo` actions in `/ateneo` to `/ateneo/create`, and built a mock-only create-group form screen with the requested field set and redirect-back submit behavior.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/ateneo/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/create/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_lib/mock-data.ts
  - docs/ui-spec-live.md
  - docs/agent-live-context.md
- Next:
  - Validate `/ateneo/create` in light and dark themes on desktop and mobile.
  - Move to the next Ateneo screen after user feedback.

### 2026-08-16 02:41 - Ateneo create form layout + badge multiselect refinement
- Agent: GitHub Copilot
- Summary: Updated `/ateneo/create` so `Crear temas` and `Comentarios` render on the same row, replaced `Insignias requeridas` checkbox grid with a multiselect dropdown interaction, and removed the `Mathesis` badge from mock badge options.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/ateneo/create/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_lib/mock-data.ts
  - docs/agent-live-context.md
- Next:
  - Validate the new multiselect behavior and row layout on desktop and mobile.
  - Continue with the next Ateneo screen after user approval.

### 2026-08-16 02:52 - Ateneo create action placement + title back control
- Agent: GitHub Copilot
- Summary: Moved the `Crear` action to the bottom of the `/ateneo/create` form and added a classic back-chevron control beside the `Nuevo grupo` title.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/ateneo/create/page.tsx
  - docs/agent-live-context.md
- Next:
  - Validate spacing parity for the new header row and bottom action placement in desktop/mobile.

### 2026-08-16 02:57 - Ateneo create button right alignment
- Agent: GitHub Copilot
- Summary: Aligned the bottom `Crear` button to the right side of the `/ateneo/create` form as requested.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/ateneo/create/page.tsx
  - docs/agent-live-context.md
- Next:
  - Continue with the next Ateneo screen adjustments from user feedback.

### 2026-08-16 03:07 - Ateneo member-group card redirect
- Agent: GitHub Copilot
- Summary: Implemented click-to-open behavior for groups where the user is already a member and routed them to `/ateneo/groups/:groupId`; added a first-pass group destination screen with group context and visible rules.

### 2026-08-21 20:15 - Mensa Empresarios directory backend integration
- Agent: GitHub Copilot
- Summary: Added the public verified-directory API for enterprises whose owners hold an active Mensa Empresarios badge and replaced the static mock directory page with live fetch logic, loading state, and empty-state handling. Verified the backend integration contract with the targeted enterprise-directory test and confirmed the UI builds successfully.
- Files changed:
  - src/modules/enterprise/enterprise.service.ts
  - src/modules/enterprise/enterprise.controller.ts
  - src/modules/enterprise/enterprise.routes.ts
  - src/modules/enterprise/enterprise.types.ts
  - test/integration/enterprise-directory.integration.test.ts
  - ../mathesis-ui/src/lib/api/enterprise.ts
  - ../mathesis-ui/src/app/(platform)/directorio/page.tsx
  - docs/ui-spec-live.md
  - docs/agent-live-context.md
- Next:
  - Keep the disabled “Solicitar membresía Empresarios” CTA in place until the badge request flow is ready.
  - Revisit live data pagination or richer founder metadata once the directory UX expands beyond the initial verified-list scope.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/ateneo/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_lib/mock-data.ts
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/page.tsx
  - docs/ui-spec-live.md
  - docs/agent-live-context.md
- Next:
  - Validate group-card routing behavior on all Ateneo tabs.
  - Implement the full per-group screen layout once provided.

### 2026-08-16 03:16 - Ateneo static export dynamic-route fix
- Agent: GitHub Copilot
- Summary: Fixed the `/ateneo/groups/[groupId]` build error under `output: export` by converting the page to a server-rendered dynamic route and adding `generateStaticParams()` from Ateneo mock member groups.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/page.tsx
  - docs/agent-live-context.md
- Next:
  - Confirm static export/build runs without missing `generateStaticParams` errors.

### 2026-08-16 03:28 - Ateneo group page 3-column desktop layout
- Agent: GitHub Copilot
- Summary: Implemented screenshot-aligned 3-column desktop layout for `/ateneo/groups/:groupId` while keeping the existing topbar: left panel with centered `Coming soon`, middle column with group context and popular topics, and right `Descubrí Mathesis` cards. Mobile remains middle-column-only.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/page.tsx
  - docs/ui-spec-live.md
  - docs/agent-live-context.md
- Next:
  - Validate spacing and typography parity against the provided screenshot in light and dark themes.

### 2026-08-16 03:40 - Ateneo group column content extracted to standalone components
- Agent: GitHub Copilot
- Summary: Moved the left placeholder content, middle group feed content, and right discovery content for `/ateneo/groups/:groupId` into standalone components named `AteneoExploreGroups`, `AteneoGroupFeed`, and `DiscoverMathesis`, while preserving the shared three-column shell and column wrappers.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoExploreGroups.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoGroupFeed.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/DiscoverMathesis.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/page.tsx
  - docs/agent-live-context.md
- Next:
  - Reuse these extracted content components in future Ateneo column rotations and alternate group layouts.
  - Replace the page-local mock topics with shared or backend-backed data when the group feed is connected.

### 2026-08-17 18:20 - Ateneo middle-column back row alignment
- Agent: GitHub Copilot
- Summary: Fixed duplicated `Volver a explorar grupos` behavior by moving the back action into a dedicated first row of the middle column and removing the in-form duplicate, matching the two-row middle layout from the screenshot.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoGroupMiddleColumn.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoGroupFeed.tsx
  - docs/agent-live-context.md
- Next actions:
  - Validate final visual parity for middle-column borders/dividers in browser at desktop widths.
  - Continue with any remaining topic-form spacing or typography nits from user review.

### 2026-08-17 19:05 - Ateneo split pages for feed and new topic
- Agent: GitHub Copilot
- Summary: Recovered the feed as its own middle component and moved topic creation into a dedicated new-topic page, with both pages reusing the same 3-column structure and shared left/right column content.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoGroupFeed.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoNewTopicForm.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_lib/group-topics.ts
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/new-topic/page.tsx
  - docs/ui-spec-live.md
  - docs/agent-live-context.md
- Next actions:
  - Validate browser parity for both routes (`/ateneo/groups/:groupId` and `/ateneo/groups/:groupId/new-topic`) in light and dark themes.
  - Decide whether submit behavior on new-topic should stay mock-only or connect to backend creation flow.

### 2026-08-17 19:20 - New-topic group target selector
- Agent: GitHub Copilot
- Summary: Added a group dropdown to the new-topic middle form so users can change which member group they are posting to while staying on the same creation screen.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoNewTopicForm.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/new-topic/page.tsx
  - docs/agent-live-context.md
- Next actions:
  - Confirm selected target group is included in payload once backend topic-create endpoint is connected.
  - Keep dropdown options scoped to groups where the user is a member.

### 2026-08-17 19:35 - New-topic availableGroups runtime guard
- Agent: GitHub Copilot
- Summary: Fixed `Cannot read properties of undefined (reading 'map')` in the new-topic form by making `availableGroups` optional and mapping over a safe fallback list that defaults to the current group.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoNewTopicForm.tsx
  - docs/agent-live-context.md
- Next actions:
  - Validate navigation path transitions to `/new-topic` under HMR/reload to confirm no stale-prop crashes.

### 2026-08-17 20:10 - Ateneo topic detail mock pass
- Agent: GitHub Copilot
- Summary: Replaced the form-heavy `/ateneo/groups/:groupId/new-topic` experience with a feed-like single-topic detail card that keeps the left and right columns static while the middle column focuses on the post, reaction list, and bookmark control. The bookmark trigger raises a toast with the exact copy `Coming soon` and the reaction/comment row follows the existing feed visual language without adding unsupported backend behavior.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoNewTopicForm.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/new-topic/page.tsx
  - ../mathesis-backend/docs/ui-spec-live.md
  - ../mathesis-backend/docs/agent-live-context.md
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
- Next actions:
  - Validate the final view in the browser at `/ateneo/groups/:groupId/new-topic` in light and dark themes.
  - If product direction changes, tighten the reaction/comment row to the exact screenshot after the final copy review.

### 2026-08-19 00:00 - Ateneo topic/create polish pass
- Agent: GitHub Copilot
- Summary: Updated the Ateneo create-group form so `Grupo oficial` is visibly disabled with an info icon tooltip that says `Coming soon`; relabeled the first field in the new-topic form to `Grupo`; and added a post-level three-dotted overflow menu with `Denunciar`, using a flag icon and danger styling consistent with comment-level report actions.
- Files changed:
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
  - ../mathesis-ui/src/app/(platform)/ateneo/create/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoNewTopicForm.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoTopicDiscussion.tsx
- Next actions:
  - Do a final light/dark visual check on the updated Ateneo flows if the user wants further polish.
  - Keep the create-topic and topic-detail interaction split stable while the UI is being wrapped up.

### 2026-08-19 00:10 - Ateneo left-rail test data expansion
- Agent: GitHub Copilot
- Summary: Expanded the Ateneo mock group lists so the left rail can exercise the `Ver más` and `Ver todos` states with enough entries in the Administrás, Tus grupos, and Recomendados para vos sections.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/ateneo/_lib/mock-data.ts
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoExploreGroups.tsx
- Next actions:
  - Use the added mock groups to visually confirm the section expansion limits and footer shortcuts.
  - Replace the temporary `Redirección pendiente` placeholder once the target route is decided.

### 2026-08-19 00:20 - Ateneo dedicated feed page
- Agent: GitHub Copilot
- Summary: Added a dedicated `/ateneo/feed` 3-column page with the same left and right rails as the group/topic views, plus a middle column that mixes member-group topics and recommended topics. The left-rail `Feed` shortcut now navigates to the new page and is highlighted there.
- Files changed:
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoExploreGroups.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoFeedMiddle.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/feed/page.tsx
  - ../mathesis-backend/docs/ui-spec-live.md
- Next actions:
  - Review the feed page visually in the browser and tune card density if needed.
  - Decide the final destination for the `+ Nuevo tema` action on the feed page.

### 2026-08-19 00:30 - Ateneo route swap to canonical feed/groups paths
- Agent: GitHub Copilot
- Summary: Moved the feed screen to `/ateneo`, moved the explore-groups screen to `/ateneo/groups`, and kept `/ateneo/feed` as a redirect for compatibility. Updated the left-rail Feed shortcut to point at the canonical feed route and refreshed the live docs to match the new route map.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/ateneo/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/feed/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoExploreGroups.tsx
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
  - ../mathesis-backend/docs/ui-spec-live.md
- Next actions:
  - Run a final production build to confirm the new canonical routes compile and prerender cleanly.
  - Update any future navigation copy to reference `/ateneo` for feed and `/ateneo/groups` for group browsing.

### 2026-08-19 00:40 - Ateneo groups tab query selection fix
- Agent: GitHub Copilot
- Summary: Fixed `/ateneo/groups?tab=...` tab resolution so the requested tab is correctly selected when navigating from left-rail `Ver todos`. Updated the route-level parser to support Next 16 `searchParams` handling and normalize both `string` and `string[]` values.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/page.tsx
  - ../mathesis-backend/docs/agent-live-context.md
- Next actions:
  - Manually verify in-browser that `/ateneo/groups?tab=discover`, `/ateneo/groups?tab=mine`, and `/ateneo/groups?tab=admin` each preselect the matching tab.
  - Keep query-driven tab parsing aligned with Next 16 page prop conventions for future route updates.

### 2026-08-19 00:55 - Ateneo groups static rendering + client tab URL source
- Agent: GitHub Copilot
- Summary: Removed server-side `searchParams` usage from `/ateneo/groups` to resolve the `dynamic = "error"` static rendering failure. The groups explorer now reads and controls the tab directly from the client URL query (`?tab=...`) using `useSearchParams`, and tab clicks update the URL via router navigation.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoGroupsExplorer.tsx
  - ../mathesis-backend/docs/agent-live-context.md
- Next actions:
  - Manually verify tab deep links and tab switching preserve the expected selected state.
  - Keep `/ateneo/groups` free of server-side query parsing while `dynamic = "error"` static behavior is required.

### 2026-08-19 01:05 - Ateneo reply mention prefill
- Agent: GitHub Copilot
- Summary: Updated topic comment replies so clicking `Responder` preloads the reply composer with `@<autor> ` and focuses the input, enabling direct addressed replies for future notification handling.
- Files changed:
  - ../mathesis-ui/docs/ui-agent-live-guidelines.md
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoTopicDiscussion.tsx
  - ../mathesis-backend/docs/agent-live-context.md
- Next actions:
  - Manually verify on `/ateneo/groups/[groupId]/topics/[topicId]` that each `Responder` click replaces the draft prefix with the selected comment author mention.
  - Wire real mention parsing/notification backend behavior when comment persistence is implemented.

### 2026-08-19 02:10 - Ateneo backend implementation and mock runtime removal
- Agent: GitHub Copilot
- Summary: Implemented a new backend Ateneo module with Prisma models, migration, and authenticated endpoints for groups, feed topics, topic detail, comments/replies, and reaction toggles. Migrated Ateneo UI runtime data access from mock arrays to real API clients across feed, groups explorer, left rail, group page, topic page, comment posting, and new-topic publishing. Updated Next.js config to allow dynamic routes required by backend-driven Ateneo pages.
- Files changed:
  - prisma/schema.prisma
  - prisma/migrations/20260819110000_add_ateneo_core/migration.sql
  - src/modules/ateneo/ateneo.schemas.ts
  - src/modules/ateneo/ateneo.types.ts
  - src/modules/ateneo/ateneo.service.ts
  - src/modules/ateneo/ateneo.controller.ts
  - src/modules/ateneo/ateneo.routes.ts
  - src/routes/index.ts
  - docs/ui-spec-live.md
  - ../mathesis-ui/src/lib/api/ateneo.ts
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoGroupFeed.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoTopicDiscussion.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoFeedMiddle.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoGroupsExplorer.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoExploreGroups.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoNewTopicForm.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/topics/[topicId]/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/new-topic/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/create/page.tsx
  - ../mathesis-ui/next.config.ts
  - docs/agent-live-context.md
- Next actions:
  - Apply the new Prisma migration in target environments and seed Ateneo groups/topics for non-empty first-run experiences.
  - Add backend endpoints for join/leave, report actions, and notifications so remaining `Coming soon` interactions become fully functional.

### 2026-08-19 02:25 - Ateneo CTA navigation bug fixes
- Agent: GitHub Copilot
- Summary: Fixed two Ateneo UI navigation bugs: left-rail `+ Grupo` now routes to `/ateneo/create`, and feed-page `+ Nuevo tema` now routes to the real topic composer UI (first available owned group `/ateneo/groups/:groupId/new-topic`, fallback `/ateneo/groups?tab=mine`).
- Files changed:
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoExploreGroups.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoFeedMiddle.tsx
  - docs/agent-live-context.md
- Next actions:
  - Manually verify the CTA redirects in-browser for authenticated users with and without owned groups.
  - Replace the fallback flow with a dedicated multi-group composer route if product requires choosing a target group before opening compose.

### 2026-08-19 02:35 - Ateneo two-level comment threading UI
- Agent: GitHub Copilot
- Summary: Updated topic comment rendering to keep exactly two visual levels: direct topic comments at base level, and all replies indented one level to the right. Replies to replies are anchored to the same top-level parent and stay at the same indented level.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoTopicDiscussion.tsx
  - docs/agent-live-context.md
- Next actions:
  - Manually verify reply ordering/indentation in `/ateneo/groups/[groupId]/topics/[topicId]` with a mix of direct replies and replies-to-replies.
  - If required, add explicit visual connectors (thread line) for reply grouping without introducing a third nesting level.

### 2026-08-19 18:30 - Revert export static params for Vercel migration
- Agent: GitHub Copilot
- Summary: Reverted the GitHub Pages export-only static param implementation for Ateneo dynamic routes and switched Next config back to runtime-friendly mode in preparation for Vercel hosting.
- Files changed:
  - ../mathesis-ui/next.config.ts
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/edit/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/info/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/members/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/new-topic/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/groups/[groupId]/topics/[topicId]/page.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_lib/static-params.ts (deleted)
  - docs/agent-live-context.md
- Next actions:
  - Configure Vercel project environment variables for frontend runtime API access.
  - Replace GitHub Pages deployment with Vercel deployment so new dynamic group URLs work without rebuild-time path seeding.

### 2026-08-19 19:05 - Backend CORS multi-origin allowlist
- Agent: GitHub Copilot
- Summary: Fixed backend CORS rigidity by adding support for multiple allowed frontend origins via `FRONTEND_ORIGINS` (comma-separated), while keeping `FRONTEND_ORIGIN` backward compatible.
- Files changed:
  - src/config/env.ts
  - src/app.ts
  - .env.example
  - docs/agent-live-context.md
- Next actions:
  - Set `FRONTEND_ORIGIN`/`FRONTEND_ORIGINS` in the running backend environment to include the active frontend hostnames.
  - Restart backend process and re-check login/API calls from `https://test.mathesis.social`.

### 2026-08-21 01:52 - Perfil Intereses UI-only
- Agent: GitHub Copilot
- Summary: Added the new `Intereses` section in perfil as an editable tag/chip list with individual delete actions, case-insensitive dedupe, and localStorage-backed save/discard behavior. Kept backend profile DTO/API payload unchanged in this phase.
- Files changed:
  - docs/ui-spec-live.md
  - ../mathesis-ui/src/app/(platform)/_components/home/InteresesCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - docs/agent-live-context.md
- Next actions:
  - Wire `Intereses` to backend profile read/save once backend contract and persistence are implemented.
  - Validate UX in both themes on desktop/mobile with add, dedupe, remove, save, discard, and refresh restore flows.

### 2026-08-21 01:57 - Perfil Intereses autocomplete suggestions
- Agent: GitHub Copilot
- Summary: Added frontend autocomplete suggestions to `Intereses` with a 3-character trigger, keyboard navigation (up/down + enter + escape), click-to-select behavior, and filtering to hide already-added tags. Kept this phase UI-only with no backend/DB contract changes.
- Files changed:
  - docs/ui-spec-live.md
  - ../mathesis-ui/src/app/(platform)/_lib/constants.ts
  - ../mathesis-ui/src/app/(platform)/_components/home/InteresesCard.tsx
  - docs/agent-live-context.md
- Next actions:
  - If desired, replace static suggestion source with backend endpoint for dynamic/popularity-ranked suggestions.
  - Validate suggestion UX on mobile virtual keyboard flow and dark/light themes.

### 2026-08-21 02:02 - Perfil Intereses backend + no mocks
- Agent: GitHub Copilot
- Summary: Implemented full backend support for `Intereses`, including DB persistence, profile payload integration, and backend suggestion endpoint. Removed mocked/local suggestion source and localStorage persistence from the Intereses UI.
- Files changed:
  - prisma/schema.prisma
  - prisma/migrations/20260821021000_add_profile_interests/migration.sql
  - src/modules/profile/profile.types.ts
  - src/modules/profile/profile.schemas.ts
  - src/modules/profile/profile.service.ts
  - src/modules/profile/profile.controller.ts
  - src/modules/profile/profile.routes.ts
  - docs/ui-spec-live.md
  - ../mathesis-ui/src/lib/api/profile.ts
  - ../mathesis-ui/src/app/(platform)/_lib/types.ts
  - ../mathesis-ui/src/app/(platform)/_lib/constants.ts
  - ../mathesis-ui/src/app/(platform)/_lib/hooks/useProfessionalProfile.ts
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileFormCard.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileInitializationView.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - ../mathesis-ui/src/app/(platform)/_components/home/InteresesCard.tsx
  - docs/agent-live-context.md
- Next actions:
  - Run the new Prisma migration in each target environment before deploying backend.
  - Optionally add ranking refinements and normalization display rules for suggestion labels based on product preference.

### 2026-08-21 02:08 - Intereses drag-and-drop ordering
- Agent: GitHub Copilot
- Summary: Added drag-and-drop reordering for `Intereses` chips in profile edit mode, including visual drag/target states and persistence of the reordered list through the existing save flow.
- Files changed:
  - docs/ui-spec-live.md
  - ../mathesis-ui/src/app/(platform)/_components/home/InteresesCard.tsx
  - docs/agent-live-context.md
- Next actions:
  - Validate drag-and-drop behavior in desktop browsers and decide whether to add explicit mobile touch-reorder controls.

### 2026-08-21 02:09 - Intereses lowercase normalization
- Agent: GitHub Copilot
- Summary: Enforced lowercase normalization for `Intereses` during save so persisted values are always lowercase across clients.
- Files changed:
  - src/modules/profile/profile.schemas.ts
  - src/modules/profile/profile.service.ts
  - ../mathesis-ui/src/app/(platform)/_components/home/InteresesCard.tsx
  - docs/ui-spec-live.md
  - docs/agent-live-context.md
- Next actions:
  - Optionally add accent/diacritic normalization rules if product copy guidelines require canonicalized storage beyond lowercase.

### 2026-08-21 02:25 - Topbar search results avatar rendering
- Agent: GitHub Copilot
- Summary: Updated topbar profile search results to display each user profile image on the left of the name with fixed avatar sizing and initials fallback for missing images.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/TopBar.tsx
  - docs/agent-live-context.md
- Next actions:
  - Validate topbar search dropdown spacing and truncation behavior in both light and dark themes on desktop and mobile.

### 2026-08-21 02:40 - Profile search image payload fix
- Agent: GitHub Copilot
- Summary: Fixed backend profile search payload to include profileImageUrl, enabling topbar search results to render actual profile images instead of initials fallback when an image exists.
- Files changed:
  - src/modules/profile/profile.types.ts
  - src/modules/profile/profile.service.ts
  - docs/agent-live-context.md
- Next actions:
  - Verify end-to-end in UI by searching a user known to have profileImageUrl and confirming avatar render in the dropdown.

### 2026-08-21 03:05 - Ateneo generalized avatar rendering
- Agent: GitHub Copilot
- Summary: Generalized avatar rendering in Ateneo by adding `profileImageUrl` to backend author/member payloads and updating Ateneo UI cards/panels to use shared `UserAvatar` with initials fallback.
- Files changed:
  - src/modules/ateneo/ateneo.types.ts
  - src/modules/ateneo/ateneo.service.ts
  - ../mathesis-ui/src/lib/api/ateneo.ts
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoFeedMiddle.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoGroupFeed.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoTopicDiscussion.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoGroupMembersPanel.tsx
  - docs/agent-live-context.md
- Next actions:
  - Restart backend and validate in `/ateneo` that users with profile images render photos (and users without image still show initials) across feed, group topics, topic discussion, and members list.

### 2026-08-21 03:18 - Vercel build type fix for Ateneo mock topics
- Agent: GitHub Copilot
- Summary: Fixed Next.js build error caused by missing `authorImageUrl` in Ateneo mock `popularTopics` seed objects after the shared avatar contract update.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/ateneo/_lib/group-topics.ts
  - docs/agent-live-context.md
- Next actions:
  - Keep mock/topic seed objects aligned with `AteneoGroupTopic` when fields are added to prevent CI/CD type failures.

### 2026-08-26 14:30 - Block user implementation kickoff
- Agent: GitHub Copilot
- Summary: Started end-to-end block-user implementation with backend block/audit data models and API routes, then integrated enforcement across profile visibility, feed visibility, direct-message sending, Ateneo members/topics/comments visibility, and connection creation; also replaced the blocked-users settings page mock data with API-backed load/unblock behavior and added profile unavailable + Ateneo deleted-comment placeholder UI handling.
- Files changed:
  - docs/ui-spec-live.md
  - prisma/schema.prisma
  - prisma/migrations/20260826120000_add_user_blocks/migration.sql
  - src/modules/block/block.schemas.ts
  - src/modules/block/block.types.ts
  - src/modules/block/block.controller.ts
  - src/modules/block/block.routes.ts
  - src/modules/block/block.service.ts
  - src/routes/index.ts
  - src/modules/chat/chat.service.ts
  - src/modules/feed/feed.service.ts
  - src/modules/profile/profile.controller.ts
  - src/modules/profile/profile.service.ts
  - src/modules/connection/connection.service.ts
  - src/modules/ateneo/ateneo.types.ts
  - src/modules/ateneo/ateneo.service.ts
  - ../mathesis-ui/src/lib/api/block.ts
  - ../mathesis-ui/src/lib/api/ateneo.ts
  - ../mathesis-ui/src/app/(platform)/account/configuration/blocked/page.tsx
  - ../mathesis-ui/src/app/(platform)/account/configuration/page.tsx
  - ../mathesis-ui/src/app/(platform)/_lib/hooks/useProfessionalProfile.ts
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - ../mathesis-ui/src/app/(platform)/ateneo/_components/AteneoTopicDiscussion.tsx
  - docs/agent-live-context.md
- Next actions:
  - Implement frontend block actions from user surfaces (for example profile/search/chat actions) so users can create blocks outside the settings unblock list.
  - Add integration tests for block/unblock + cross-module enforcement scenarios (DM block, profile/search hide, feed/Ateneo filtering, connection auto-removal).
  - Decide and implement notification-layer suppression behavior for blocked-pair mentions in group chats once notification hooks are available.

### 2026-08-26 15:05 - Profile UI block action menu
- Agent: GitHub Copilot
- Summary: Added a three-dot actions menu on read-only profile views with `Bloquear` and `Denunciar` options; `Bloquear` now calls the backend block endpoint from the profile header and shows loading/success/error feedback.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - docs/ui-spec-live.md
  - docs/agent-live-context.md
- Next actions:
  - Add equivalent block-entry actions in other user surfaces (search results, feed cards, and messages thread headers) for complete UX parity.
  - Replace `Denunciar` placeholder with real reporting flow once backend/report endpoints are defined.

### 2026-08-26 15:20 - Profile actions menu visibility and close behavior
- Agent: GitHub Copilot
- Summary: Fixed read-only profile actions menu visibility by removing clipping from the profile card container and raising menu layering; added close-on-outside-click and close-on-Escape interactions for the three-dot actions menu.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - docs/agent-live-context.md
- Next actions:
  - Manually validate menu behavior on desktop and mobile overlays to confirm no remaining stacking conflicts with adjacent floating UI elements.

### 2026-08-26 15:28 - Denunciar action color tweak
- Agent: GitHub Copilot
- Summary: Updated read-only profile menu `Denunciar` action text color to explicit red token for clearer visual emphasis.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - docs/agent-live-context.md
- Next actions:
  - Confirm final color contrast in both light and dark themes on the profile action menu.

### 2026-08-26 15:40 - Profile block note popup
- Agent: GitHub Copilot
- Summary: Changed profile `Bloquear` action to open a modal popup with explanatory copy and optional private note field; confirm action now submits `reasonNote` to backend block endpoint.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - docs/ui-spec-live.md
  - docs/agent-live-context.md
- Next actions:
  - Validate modal UX in light/dark themes and ensure note text appears later in the blocked-users list as expected.

### 2026-08-26 15:52 - Immediate profile refetch after blocking
- Agent: GitHub Copilot
- Summary: Added a safe `refetchProfile` helper in the profile hook and invoked it after successful block confirmation so blocked profile visibility updates immediately without manual reload.
- Files changed:
  - ../mathesis-ui/src/app/(platform)/_lib/hooks/useProfessionalProfile.ts
  - ../mathesis-ui/src/app/(platform)/_components/home/ProfileView.tsx
  - docs/agent-live-context.md
- Next actions:
  - Verify cross-surface refresh behavior (search, feed, messages) for instant block visibility updates beyond profile page.

### 2026-08-26 16:20 - Mensajes composer blocked-state UX
- Agent: GitHub Copilot
- Summary: Added directional blocked-state flags to chat detail responses for direct chats and wired `/mensajes` composer to disable input/send with hover guidance. When blocked by the other user, the hover copy is `Has sido bloqueado por este usuario`; when blocked by current user, copy indicates self-block state.
- Files changed:
  - docs/ui-spec-live.md
  - src/modules/chat/chat.types.ts
  - src/modules/chat/chat.service.ts
  - ../mathesis-ui/src/lib/api/chat.ts
  - ../mathesis-ui/src/app/(platform)/mensajes/page.tsx
  - docs/agent-live-context.md
- Next actions:
  - Optionally propagate blocked-state flags to chat list payload if list-level badges/indicators are later required.
  - Validate live behavior by opening a direct chat where the other user has already blocked the current user and confirming composer hover text in both light/dark themes.

### 2026-08-26 16:45 - Blocked-user filter helper refactor
- Agent: GitHub Copilot
- Summary: Reduced repeated blocked-user `notIn` query snippets by adding a shared helper in block service and reusing it in profile search, Ateneo feed/members/topics, and feed author-filter paths.
- Files changed:
  - src/modules/block/block.service.ts
  - src/modules/profile/profile.service.ts
  - src/modules/ateneo/ateneo.service.ts
  - src/modules/feed/feed.service.ts
  - docs/agent-live-context.md
- Next actions:
  - Optionally migrate remaining block-related query snippets to the same helper pattern as new modules are touched.

