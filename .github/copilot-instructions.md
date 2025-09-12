# Copilot Instructions for BCFK

This guide enables AI coding agents to be immediately productive in the BCFK codebase. It summarizes architecture, workflows, conventions, and key patterns unique to this project.

## 🏗️ Architecture Overview

- **Frontend:** Svelte 5 SPA (src/) with Tailwind CSS, Vite, and domain-driven components (absences/, assignments/, members/, etc.)
- **Backend:** Node.js + Express (app.js, controllers/, services/) with SQLite3 (database.js, data/)
- **API:** All endpoints under `/api/`, backend on port 3001, frontend dev on port 5173
- **Database:** SQLite, promise-based wrapper, schema in data/database.db
- **Deployment:** Docker Compose with persistent volumes; production at https://bcfk.bini.io

## ⚡ Developer Workflows

- **Install:** `npm install`
- **Dev (full stack):** `npm run dev` (starts backend + frontend)
- **Dev (backend only):** `npm run dev:server`
- **Dev (frontend only):** `npm run dev:svelte`
- **Build:** `npm run build` (frontend)
- **Start (prod):** `npm start` (backend + static frontend)
- **Seed DB:** `npm run seed`
- **Sync data:** `npm run sync` (local → remote)
- **Cleanup:** `npm run cleanup` (kill port 3001)

## 🗂️ Key Directories & Files

- `src/pages/` – Route components (HomePage, AssignmentsPage, AbsencesPage)
- `src/components/` – Reusable UI, domain-driven folders
- `src/stores/` – Svelte stores for global state
- `controllers/` – API route handlers
- `services/` – Business logic
- `database.js` – SQLite wrapper
- `data/` – Database files (Docker volume)
- `public/dist/` – Production frontend build

## 🧩 Project-Specific Patterns

- **Svelte 5 Runes:** Use `$state`, `$derived`, `$props()` for reactivity; see AbsenteesCell.svelte for example
- **Component Events:** Use `createEventDispatcher()` for parent-child communication
- **Optimistic UI:** Update UI before backend confirmation, then sync
- **Animations:** Coordinated week navigation, modal transitions (fade + fly), member tag effects
- **API Usage:** Weekdays as 0-6 (Mon-Sun), slot types as 'ouverture'/'fermeture', dates as 'YYYY-MM-DD'
- **French Localization:** All UI and data fields use French
- **Mobile-First:** Sticky headers, burger menu, touch interactions, custom scrollbars

## 🔗 Integration Points

- **Frontend <-> Backend:** API requests proxied in dev, static files served in prod
- **Database:** All methods return promises; foreign keys for member_id
- **Docker:** Data persists in `/app/data`; static files in `/app/public/dist`
- **Sync:** `npm run sync` replicates local DB to remote server

## 📝 Conventions & Gotchas

- **Error Handling:** Centralized in `middleware/errorHandler.js`
- **Date Handling:** Always use 'YYYY-MM-DD' format
- **Assignment Types:** Recurring (weekly) vs specific (date-based)
- **Absence Tracking:** Date ranges, conflict detection
- **Accessibility:** ARIA labels, keyboard navigation, screen reader support

## Example: Absence Management

- Absence data flows from backend (absenceService.js, absenceController.js) to frontend (AbsenceGroup.svelte, AbsenteesCell.svelte)
- State managed via Svelte stores (`stores/absences.js`)
- UI updates optimistically, then syncs with backend

---

For unclear or missing conventions, ask for clarification or review `README.md` and `CLAUDE.md` for additional context.
