# UI Spec Live

Purpose: Keep backend and frontend aligned with the current HTML source of truth and track implementation deltas by HTML filename version.

## Active Spec Source
- HTML file: html/Mathesis_MVP_Unificado_v0.2.html
- Version source of truth: filename suffix only (v0.2, v0.3, ...)
- Last sync date: 2026-08-05
- Scope owner: backend + frontend

## Implementation Scope (Current)
- Profile core: name, surname, date of birth, nationality, headline, current company, about, location.
- Profile badges: render active user badges below profile name in /perfil hero header.
- Experience section: editable operations and read-only rendering.
- Academics/Education section: editable operations and read-only rendering.
- Authentication: forgot-password flow (Page 1 request view implemented; Page 2 sent view implemented; Page 3 reset-password view implemented; dark/light parity required per page) and authenticated change-password flow implemented end-to-end.
- Platform navigation: desktop topbar profile menu (avatar-triggered panel), with profile header bound to user profile data and first-pass interaction limits (logout functional, route-backed entries functional, placeholder entries visible without route behavior).
- Configuration: main settings page only, reached from the topbar menu at /account/configuration, with the first pass covering both desktop and mobile. Mobile entry must match the provided screenshot; desktop should follow the HTML v0.2 settings reference. Dark-mode control moves from the topbar into this page.

## Profile Field Matrix
| Section | Field | Backend status | Frontend status | Notes |
|---|---|---|---|---|
| Core | firstName | implemented | implemented | |
| Core | lastName | implemented | implemented | |
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

## Rules For Version Updates
1. When a new HTML file is added, update Active Spec Source immediately.
2. Keep older entries in Changelog; do not delete historical scope notes.
3. If implementation deviates from spec, document a short rationale in Notes.
4. Every profile-related task must update this file when statuses change.

## Changelog
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
