# UI Spec Live

Purpose: Keep backend and frontend aligned with the current HTML source of truth and track implementation deltas by HTML filename version.

## Active Spec Source
- HTML file: html/Mathesis_MVP_Unificado_v0.2.html
- Version source of truth: filename suffix only (v0.2, v0.3, ...)
- Last sync date: 2026-08-05
- Scope owner: backend + frontend

## Implementation Scope (Current)
- Profile core: name, surname, date of birth, nationality, headline, current company, about, location.
- Experience section: editable operations and read-only rendering.
- Academics/Education section: editable operations and read-only rendering.

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
