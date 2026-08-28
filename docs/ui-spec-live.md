# UI Spec Live

Purpose: Keep backend and frontend aligned with the current HTML source of truth and track implementation deltas by HTML filename version.

## Active Spec Source
- HTML file: html/Mathesis_MVP_Unificado_v0.4.html
- Version source of truth: filename suffix only (v0.2, v0.3, ...)
- Last sync date: 2026-08-12
- Scope owner: backend + frontend

## Implementation Scope (Current)
- Authentication onboarding: registration moves required `firstName` + `lastName` and optional `middleName` into `/registro`, the old inline post-login profile-initialization screen is no longer part of the primary new-user flow, email confirmation routes into a one-time two-page welcome sequence, and completion redirects to `/ateneo`.
- Profile core: name, surname, date of birth, nationality, headline, current company, about, location.
- Profile badges: render active user badges below profile name in /perfil hero header.
- Digital credential flow (backend signed verification): front/back flip credential screen with square-ish proportion, no ID, no share/download actions, QR-style panel, and badge grid for the back side; QR now resolves to a signed, expiring verification token at `/verificar` so the verification page validates against backend data instead of accepting arbitrary query-string names.
- Experience section: editable operations and read-only rendering.
- Academics/Education section: editable operations and read-only rendering.
- Interests section: editable tag list in /perfil (`Intereses`) with individual remove actions, backend-persisted save, and backend suggestions from 3 typed characters.
- Interests section: editable tag list in /perfil (`Intereses`) with individual remove actions, drag-and-drop reordering, backend-persisted save, and backend suggestions from 3 typed characters.
- Interests section: editable tag list in /perfil (`Intereses`) with individual remove actions, drag-and-drop reordering, backend-persisted save, backend suggestions from 3 typed characters, and lowercase normalization on save.
- Authentication: forgot-password flow (Page 1 request view implemented; Page 2 sent view implemented; Page 3 reset-password view implemented; dark/light parity required per page) and authenticated change-password flow implemented end-to-end.
- Application shell: a global footer with copy `Powered by Newen.Solutions` is rendered from the root layout, fixed to the viewport bottom, visible on all screens (platform + auth/public), and inherited automatically by new pages.
- Bug reports (backend-integrated): authenticated platform routes can expose an env-gated floating `Reportar bug` action that opens a draft-preserving form with current URL capture, screenshot attachments, local autosave, close-without-clear behavior, and backend submission through the support module.
- Bug reports (verification utility): add a temporary authenticated verification route in the UI that lists the current user’s bug reports and exercises attachment retrieval against the support download endpoint.
- Platform navigation: desktop topbar profile menu (avatar-triggered panel), with profile header bound to user profile data and first-pass interaction limits (logout functional, route-backed entries functional, placeholder entries visible without route behavior).
- Platform navigation: add an Ateneo entry that routes directly to `/ateneo` (explore groups), available in desktop topbar and mobile drawer personal menu.
- Configuration: main settings page only, reached from the topbar menu at /account/configuration, with the first pass covering both desktop and mobile. Mobile entry must match the provided screenshot; desktop should follow the HTML v0.2 settings reference. Dark-mode control moves from the topbar into this page.
- Enterprises: /my-enterprises now loads from backend endpoint GET /api/v1/enterprises/my, creates via POST /api/v1/enterprises, updates via PATCH /api/v1/enterprises/:enterpriseId, and deletes via DELETE /api/v1/enterprises/:enterpriseId.
- Enterprises: creation request form route at /my-enterprises/create keeps required-field client validation (Nombre de la empresa and Tu rol), shows inline per-field errors, and redirects to /my-enterprises after successful backend creation.
- Enterprises: each card in /my-enterprises offers edit and delete actions; edit uses /my-enterprises/[enterpriseId]/edit with prefilled data and save-back to the backend.
- Enterprises: status labels/chips were removed from both backend contracts and UI rendering (status column dropped from DB schema).
- Ateneo (backend-integrated): `/ateneo` is the dedicated 3-column feed page with middle-column topics loaded from backend endpoint `GET /api/v1/ateneo/feed`.
- Ateneo (backend-integrated): `/ateneo/groups` uses backend endpoint `GET /api/v1/ateneo/groups?tab=...` for tabbed group browsing (`Tus grupos`, `Descubrir`, `Grupos que administrás`).
- Ateneo (backend-integrated): group/topic/detail flows (`/ateneo/groups/:groupId`, `/ateneo/groups/:groupId/new-topic`, `/ateneo/groups/:groupId/topics/:topicId`) are runtime-backed by `GET/POST /api/v1/ateneo/groups/:groupId/topics*` and topic-comment endpoints.
- Ateneo (backend-integrated): non-member users can open a group detail preview (`/ateneo/groups/:groupId`) to read basic metadata (name, description, rules) and join in place via `POST /api/v1/ateneo/groups/:groupId/join`; topics remain member-only until join succeeds.
- Ateneo (backend-integrated): group settings can restrict topic creation and commenting to admins only; the frontend hides the corresponding CTAs and the backend rejects bypass attempts for those actions.
- Ateneo (backend-integrated): group middle-column header actions include an info page (`/ateneo/groups/:groupId/info`), a members page (`/ateneo/groups/:groupId/members`), and an admin-only edit page (`/ateneo/groups/:groupId/edit`) that reuses the new-group form prefilled with the current group data.
- Ateneo (compatibility): `/ateneo/feed` redirects to `/ateneo`.
- Blocked users (backend + frontend in progress): one-sided block action with mutual enforcement while active. DMs keep history but block new direct sends both directions; group chats still deliver messages but suppress blocked-pair mention notifications; profile URL + global search + feed author surfaces + Ateneo members hide blocked users; Ateneo topics/comments from blocked pairs are hidden both directions with deleted-placeholder behavior for hidden parent comments that still have visible replies; blocked pairs cannot connect while active and existing connections are removed on block; unblock restores normal access; direct-chat composer in `/mensajes` is disabled when the pair is blocked and shows directional hover guidance.
- Profile UI action menu: when viewing another user's profile (`/perfil?userId=...`), show a three-dot actions trigger with `Bloquear` and `Denunciar`; `Bloquear` calls backend block endpoint and `Denunciar` remains a placeholder.

## Profile Field Matrix
| Section | Field | Backend status | Frontend status | Notes |
|---|---|---|---|---|
| Core | firstName | implemented | implemented | |
| Core | lastName | implemented | implemented | |
| Core | middleName | implemented | implemented | Collected during registration; optional in profile payload/output |
| Core | dateOfBirth | implemented | implemented | |
| Core | nationality | implemented | implemented | |
| Core | currentJobTitle (headline) | implemented | implemented | 80 chars in UI |
| Core | currentCompany | implemented | implemented | |
| Core | about | implemented | implemented | 800 chars in UI |
| Core | locationCountry | implemented | implemented | |
| Core | locationCity | implemented | implemented | |
| Core | locationPostalCode | implemented | implemented | |
| Core | profileImageUrl | implemented | implemented | URL-based profile photo |
| Core | profileBannerImageUrl | implemented | implemented | URL-based profile banner |
| Core | badges | implemented | implemented | Rendered below profile name; label derives from slug words in Title Case |
| Experience | employmentHistory | implemented | implemented | refined edit UX |
| Experience | employmentHistory.description | implemented | implemented | 300 chars in UI |
| Education | educationHistory | implemented | implemented | dedicated patch endpoint |
| Interests | interests | implemented | implemented | Persisted in profile payload and suggestion source comes from backend endpoint |

## Rules For Version Updates
1. When a new HTML file is added, update Active Spec Source immediately.
2. Keep older entries in Changelog; do not delete historical scope notes.
3. If implementation deviates from spec, document a short rationale in Notes.
4. Every profile-related task must update this file when statuses change.

## Changelog
### 2026-08-28 - Bug report attachment verification utility
- Added authenticated support read endpoints for listing the current user’s bug reports and downloading their attachments.
- Added a temporary UI verification page to preview and download bug report attachments end to end.

### 2026-08-28 - Bug report backend integration
- Extended the support module with an authenticated multipart bug-report endpoint that persists title, description, page URL, and screenshot attachments in dedicated bug-report tables instead of the generic contact-message table.
- Replaced the UI-only placeholder submit flow with the real backend integration while keeping local draft persistence for close/reload recovery.

### 2026-08-27 - Bug report widget UI-first scope
- Added an env-gated floating bug report widget scope for authenticated platform pages.
- First pass is frontend-only: title + description form, current URL capture, screenshot attachments, local draft persistence across close/reload, and local placeholder submission until the backend contract exists.

### 2026-08-28 - Auth login gates for unverified email and whitelist
- Enforced email-verification blocking during login so unconfirmed users cannot authenticate or receive an app session.
- Enforced whitelist gating during login when `WHITELIST_ENABLED=true`, matching the same policy already applied to protected routes.
- Added regression coverage for both cases and for the existing password-change flow to keep the login/auth contract stable.

### 2026-08-27 - Registration names + welcome onboarding implemented
- Moved required first/last name capture into `/registro`, added optional `middleName` support end to end, and create the initial profile record during backend registration.
- Added a one-time authenticated welcome flow after email confirmation: `/bienvenida` and `/bienvenida/futuro`, with final completion redirecting to `/ateneo`.
- Added a dedicated user onboarding-completion flag to the auth session payload so platform routes can enforce the welcome flow once without relying on missing-profile detection.
- Kept the old inline profile initialization component only as a legacy fallback for pre-existing accounts that still lack a profile record.

### 2026-08-27 - Registration names + welcome onboarding scope
- Added implementation scope for moving required first/last name capture into `/registro`, adding optional `middleName`, and retiring the old inline profile initialization from the primary new-user path.
- Added implementation scope for a one-time post-confirmation welcome sequence that uses two static pages and finishes in `/ateneo`.

### 2026-08-26 - Mensajes blocked composer state
- Added directional blocked state (`blocked by other` / `blocked by me`) in chat-detail responses for direct chats.
- Updated `/mensajes` composer to disable input/send on blocked direct chats with hover guidance copy (including `Has sido bloqueado por este usuario`).
### 2026-08-21 - Ateneo topic input length guards
- Aligned Ateneo new-topic length limits end-to-end so topic title is capped at 100 characters and description at 1000 characters.
- Added frontend invalid-state feedback for over-limit topic fields (red input border and red character counter when the current length exceeds the allowed maximum).

### 2026-08-21 - Global fixed footer across all screens
- Added a single root-level footer (`Powered by Newen.Solutions`) that stays fixed at the viewport bottom and is visible across all app routes.
- Removed duplicate local footer markup from platform/auth pages so new pages inherit the footer automatically without extra page-level code.

### 2026-08-21 - Directorio Mensa Empresarios backend integration
- Added the public directory listing endpoint `GET /api/v1/enterprises/directory` that returns only enterprises whose owner has an active `mensa_empresarios` badge and excludes deleted records.
- The directory payload includes each enterprise’s name, role, website, description, founder, location, and badge metadata so the UI can render live data without mock content.
- The static mockup remains in place visually while the page now reads this backend data source and keeps the disabled “Solicitar membresía Empresarios” CTA intact for the future request flow.

### 2026-08-21 - Directorio Mensa Empresarios UI pass
- Added a new desktop/mobile topbar entry labeled `Directorio` that routes to a dedicated `/directorio` page for the Mensa Empresarios directory.
- Implemented a static directory view matching the provided mockup: community header, `Recién lanzado` banner, and enterprise cards for verified Mensa-led businesses.
- The `Solicitar membresía Empresarios` CTA is intentionally disabled and shows hover text `Próximamente` until the backend flow is ready.

### 2026-08-21 - Intereses backend integration
- Added backend persistence for profile interests and wired frontend save flow to the real profile API payload.
- Replaced mocked/local suggestion source with backend endpoint `GET /api/v1/profile/interests/suggestions?text=...` triggered from 3 typed characters.

### 2026-08-21 - Intereses reorder by drag and drop
- Added drag-and-drop reordering for interests chips in edit mode so users can define a custom order before saving.

### 2026-08-26 - Profile header block action
- Added a three-dot actions menu on read-only profile views with `Bloquear` + `Denunciar` entries.
- Wired `Bloquear` to backend endpoint `POST /api/v1/blocks/:targetUserId` from the profile UI.

### 2026-08-26 - Profile block note popup
- Updated the read-only profile `Bloquear` action to open a popup with explanatory copy and an optional private note field.
- On confirmation, the optional note is sent to backend block endpoint `POST /api/v1/blocks/:targetUserId` as `reasonNote`.

### 2026-08-21 - Intereses lowercase normalization on save
- Enforced lowercase normalization for all interests at save time in both frontend payload shaping and backend persistence validation.

### 2026-08-21 - Intereses autocomplete suggestions (UI-only)
- Added frontend-only suggestions in the `Intereses` input: visible from 3 typed characters, keyboard navigation support (arrow up/down + enter), click-to-select, and filtering that excludes already-added tags.

### 2026-08-21 - Intereses UI-only first pass
- Added a new profile section `Intereses` after `Formacion academica` with editable chips/tags, case-insensitive dedupe, and per-tag delete controls.
- Kept backend payload/contracts unchanged for this phase; section save persists to localStorage as a temporary frontend-only state.

### 2026-08-05 - Initialized live file for v0.2
- Created version-aware source of truth linked to html/Mathesis_MVP_Unificado_v0.2.html.
- Established profile scope for core + experience + education.

### 2026-08-05 - Implemented profile scope pass
- Added backend profile core fields: about, locationCountry, locationCity, locationPostalCode.
- Added backend education history model and endpoint parity with work experiences.
- Implemented frontend education section and expanded core profile form with counters.
- Preserved read-only profile mode through userId query param.

### 2026-08-05 - Added experience description field
- Added experience description support end-to-end (DB, backend contracts/service, and frontend edit/view rendering).
- Description follows HTML v0.2 behavior with 300-char form limit.

### 2026-08-06 - Added profile image URLs
- Added profile image URL and banner image URL to profile core model and UI.
- Header rendering now uses these URLs with fallback styles when not provided.

### 2026-08-07 - Forgot-password flow kickoff
- Started authentication forgot-password implementation with a page-by-page workflow.
- Established requirement that each new forgot-password page must be completed in both light and dark modes before signoff.

### 2026-08-07 - Forgot-password page 2
- Implemented the sent-confirmation view route at /forgot-password/sent.
- Added masked-email rendering and consistent light/dark styling aligned with login-scale auth pages.

### 2026-08-07 - Forgot-password page 3
- Implemented reset-password view route at /reset-password using mobile screenshot as source and desktop style inferred from existing auth views.
- Added new-password + confirmation form, visual requirement checklist bars, and redirect flow on successful submission.

### 2026-08-08 - Desktop topbar profile menu scope kickoff
- Added desktop avatar-triggered profile menu scope to implementation tracking for v0.2 parity iteration.
- Established first-pass behavior constraints: logout operational; existing route-backed items navigable; non-routed items rendered as visual placeholders.

### 2026-08-08 - Desktop topbar role-based quick nav and icon parity
- Updated desktop horizontal topbar quick-nav behavior to enforce role-based option count: non-admin users see Feed, Mensajes, Notificaciones; admin users see those three plus Admin.
- Updated desktop quick-nav iconography to use HTML v0.2 symbol geometry parity (feed, message, bell, settings) through extracted UI icon components.

### 2026-08-09 - Feed reaction scope kickoff
- Added feed post reaction implementation scope with a single current reaction and future-proof backend/db shape.
- Current UI copy target for the feed action button is Valorar / Valorado based on the current user's reaction state.

### 2026-08-10 - Configuration page scope kickoff
- Added main configuration page scope to implementation tracking for HTML v0.2 parity.
- Established first-pass constraints: route path /account/configuration, Spanish UI copy, mobile screenshot parity on entry, desktop settings-reference parity, and relocation of the dark-mode control out of the topbar.

### 2026-08-10 - Bloqueados interaction prototype
- Added first-pass Bloqueados interaction from Configuración to open an in-app blocked-users panel in UI.
- Current implementation uses example rows only (no backend persistence yet) and includes a per-user reminder comment displayed below each blocked user, matching the intended future "motivo del bloqueo" behavior.

### 2026-08-10 - Bloqueados dedicated page pass
- Replaced the Bloqueados overlay prototype with a dedicated route-based page to match the provided desktop reference layout.
- Current implementation remains example-data only (no backend persistence yet), with reminder comments shown under each blocked user and a back control next to the "Bloqueados" title.

### 2026-08-10 - Authenticated change-password flow
- Added backend authenticated password-change endpoint (`POST /auth/change-password`) with current-password verification and password policy validation.
- Wired the frontend `/account/configuration/change-password` form to submit against the backend endpoint and show success/error states from the real response.

### 2026-08-10 - Password change invalidates other sessions
- Enhanced authenticated password-change behavior so changing a password invalidates other active sessions while keeping the current session active.
- Implemented token-version rotation in backend auth flow and middleware validation to reject stale tokens after password updates.

### 2026-08-12 - Profile badges render pass
- Added profile badge rendering scope to show active user badges in the perfil header under the display name.
- Badge labels are derived from slug values using word splitting on underscore and per-word title casing.

### 2026-08-12 - Mis empresas UI first pass
- Added frontend route /my-enterprises and wired "Mis Empresas" topbar menu entries (desktop + mobile drawer) to this path.
- Implemented screenshot-aligned page structure with two hardcoded enterprises and non-functional action buttons as UI placeholders pending backend.

### 2026-08-12 - Crear empresa form UI pass
- Added frontend route /my-enterprises/create and wired the /my-enterprises "Crear nueva empresa" CTA to navigate to it.
- Implemented screenshot-aligned request form UI and set the primary action label to "Crear empresa" (no backend submit yet).

### 2026-08-12 - Active source bumped to v0.4
- Updated live spec source to html/Mathesis_MVP_Unificado_v0.4.html after new HTML version was added.

### 2026-08-12 - Crear empresa form validation + redirect
- Added client-side required validation for "Nombre de la empresa" and "Tu rol" with mandatory markers and inline error messages below each invalid field.
- On successful submit, the form now redirects back to /my-enterprises (backend integration remains pending).

### 2026-08-12 - Enterprises backend first pass
- Added backend enterprises module with authenticated endpoints GET /api/v1/enterprises/my and POST /api/v1/enterprises.
- Added Prisma enterprise model/migration and wired frontend pages so create submits to backend and list reads backend data.

### 2026-08-12 - Enterprise status removed
- Removed enterprise status chips from /my-enterprises UI.
- Dropped enterprise status field from backend API contracts and Prisma Enterprise model, with migration removing column/index/enum.

### 2026-08-15 - Mensa Empresarios admin UI mock pass
- Added UI scope for a split admin experience with Mathesis admin tabs and a separate Mensa Empresarios admin dashboard.
- Established mock localStorage-driven data model for badge requests, ME admin assignment, and badge/role state before backend persistence exists.
- The Mathesis admin can manage ME admin assignment and review pending badge requests; the ME admin dashboard shows badge-request rows with combined name + surname and profile links.

### 2026-08-15 - Mensa Empresarios full backend + frontend integration
- Added `mensaEmpresariosAdminAt` column to `users` table and new `mensa_badge_requests` table with `MensaBadgeRequestStatus` enum.
- Added backend `companies` module under `src/modules/companies/` with service, schemas, controller, and routes.
- Registered routes at `GET/POST/DELETE /api/v1/admin/companies/*`.
- ME admin access: `mensaEmpresariosAdminAt IS NOT NULL` for the companies dashboard routes.
- Removed all mock localStorage data from admin UI and wired admin/page.tsx Mensa tab and companies-admin/page.tsx to real API.
- Deleted `src/lib/utils/admin-mock.ts` from frontend.

### 2026-08-15 - Companies dashboard access hardening
- Tightened companies dashboard authorization to ME-admin-only.
- Mathesis admin role alone no longer grants access to `/api/v1/admin/companies/badge-requests`, `/api/v1/admin/companies/members`, or `/api/v1/admin/companies/access-check`.

### 2026-08-15 - Home Mensa membership CTA state machine
- Added state-driven CTA behavior in Home for Mensa Empresarios membership.
- CTA states are: `Solicitar membresía` (no badge, no pending request), `Cancelar solicitud` (pending request open), and `Ir a Mensa Empresarios` (active badge).
- Added authenticated membership endpoints for self-service state/read/create/cancel to support this CTA from multiple UI locations.

### 2026-08-16 - Temporary ME admin topbar shortcut
- Added a temporary topbar shortcut for users with Mensa Empresarios admin access.
- The shortcut links directly to `/admin/companies-admin` and is hidden for users who do not pass the ME admin access check.

### 2026-08-16 - Ateneo explore groups first UI pass
- Added a new Ateneo navigation entry that opens `/ateneo` directly from desktop topbar and mobile drawer.
- Implemented the first Ateneo screen (`Explorar Grupos`) with mock-only structures and data, including search plus tabbed sections (`Tus grupos`, `Descubrir`, `Grupos que administrás`) replacing stacked section blocks.
- Added reusable mock icon-catalog entries for future create-group and related Ateneo forms.

### 2026-08-16 - Ateneo create-group route (mock functional redirect)
- Wired all `Crear grupo` triggers in `/ateneo` to route to `/ateneo/create`.
- Implemented `/ateneo/create` as a mock functional form with the requested fields: icon, name, description, rules, language, badges (multi-checkbox), official-group toggle, create-topics mode, and comments mode.
- Submit flow is UI-only for now and redirects back to `/ateneo` after mock creation.

### 2026-08-16 - Ateneo member-group navigation
- Added member-group navigation from `/ateneo` cards so groups where the user is currently a member route to a dedicated group URL (`/ateneo/groups/:groupId`).
- Added a first-pass group page shell (mock only) with group header, visible rules section, and a placeholder `Crear tema` action.

### 2026-08-16 - Ateneo group view 3-column desktop pass
- Updated `/ateneo/groups/:groupId` desktop composition to a three-column layout: left placeholder panel (`Coming soon`), middle group view with rules and popular topics feed cards, and right `Descubrí Mathesis` cards.
- Mobile keeps a single-column focus on the middle content while hiding left/right columns.

### 2026-08-18 - Ateneo new-topic composer UI mock pass
- Added a mock local composer to the middle group-feed view so the `+ Nuevo tema` CTA opens a draft form, accepts title/description/tone values, and prepends a new topic item to the visible feed list without persistence.
- Current behavior is intentionally frontend-only and does not yet hit backend storage or create a persisted discussion record.

### 2026-08-17 - Ateneo feed/new-topic page split
- Split the group middle experience into two dedicated route-level pages that share the same 3-column layout shell.
- `/ateneo/groups/:groupId` now hosts the feed-focused middle component, while `/ateneo/groups/:groupId/new-topic` hosts the new-topic middle component.
- Left (`AteneoExploreGroups`) and right (`DiscoverMathesis`) columns remain shared across both pages.

### 2026-08-17 - Ateneo topic detail view
- Replaced the mock topic composer with a feed-like single-post detail experience for the middle column on `/ateneo/groups/:groupId/new-topic`.
- The card keeps the persistent left/right columns and focuses the middle area on the post content, feed-style reaction buttons, and a bookmark action that triggers a "Coming soon" toast.
- Reaction and comments follow the current feed UI language while the detailed evaluation list uses a lightweight, coherent selector pattern consistent with the existing platform aesthetic.

### 2026-08-19 - Ateneo non-member group preview and join
- Enabled discover/non-member group navigation to open `/ateneo/groups/:groupId` instead of blocking click-through.
- Added non-member group preview mode in middle column showing basic group data and rules, with a real `Unirse al grupo` action.
- Added backend join endpoint and post-join refresh flow so the preview seamlessly transitions into full member topic feed access.

### 2026-08-19 - Ateneo admin-only topic/comment permissions
- Added admin-only topic creation and comment creation enforcement to group settings.
- The create-topic route and topic discussion UI now hide their corresponding action buttons for non-admin members when a group is configured for admins-only interaction.
- Backend bypass attempts for topic and comment creation are rejected even if the user skips the UI.

### 2026-08-19 - Ateneo group header actions and edit page
- Added the group info, members, and admin-only edit actions to the middle-column header area.
- Added backend group members and group update endpoints to support the members list page and the prefilled group-edit page.
- Reused the new-group form for the edit screen so the configuration page keeps the same UI while loading the current values.

### 2026-08-26 - Blocked users full-scope kickoff
- Approved first-pass block policy for implementation: one-sided block action with mutual enforcement while active and optional reason note.
- Confirmed scope split: direct/group chat keeps message delivery in shared groups, while Ateneo content visibility is filtered mutually for blocked pairs.
- Confirmed unblock behavior and audit expectations: unblock restores normal behavior immediately and backend retains block audit trail.
