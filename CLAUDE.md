# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BCFK is a full-stack web application for managing weekly schedules and member assignments for an association. The system features both legacy EJS views and a modern Svelte SPA frontend with a Node.js/Express backend and SQLite database.

## Development Commands

```bash
npm run dev            # Start both backend (port 3001) and frontend (port 5173) in development mode
npm run dev:server     # Start only the backend with nodemon
npm run dev:svelte     # Start only the frontend with Vite
npm run build          # Build the Svelte frontend for production
npm run seed           # Initialize/seed the SQLite database with sample data
npm start              # Start production server (backend only)
npm run cleanup        # Kill processes running on port 3001
```

## Architecture

### Dual-Stack Structure
- **Backend**: Node.js + Express on port 3001 (`/api/*` routes)
- **Frontend**: Svelte SPA served by Vite on port 5173 (development)
- **Database**: SQLite3 with custom Database wrapper class
- **Views**: Hybrid - both EJS templates (`/planning`, `/assignments`) and Svelte SPA routes

### Key Directories
```
src/                   # Svelte frontend
├── pages/            # Route components (HomePage, AssignmentsPage)
├── components/       # Reusable components (MemberSelector, etc.)
├── stores/           # Svelte stores for state management
└── lib/              # Utilities (API client)

Backend root files:
├── app.js            # Express application setup
├── database.js       # SQLite wrapper with promise-based methods
├── controllers/      # Route handlers
├── services/         # Business logic layer
└── routes/           # API route definitions
```

## Core Domain Model

**Database Schema (SQLite)**:
- `members` - Association members (first_name, last_name)
- `recurring_assignments` - Recurring weekly assignments by weekday (0=Monday, 6=Sunday) and slot_type ('ouverture'/'fermeture')
- `specific_assignments` - Slot schedule for specific dates with source tracking ('manual'/'generated')

**Key Concepts**:
- **Weekdays**: 0-6 (Monday=0, Sunday=6)
- **Slot Types**: 'ouverture' (opening) and 'fermeture' (closing)
- **Two Assignment Types**: Recurring assignments (weekly patterns) and slot schedule (specific dates)

## State Management Patterns

### Backend
- **Service Layer**: Business logic in services/ (memberService, planningService, assignmentService)
- **Database Class**: Custom SQLite wrapper with promise-based methods (`db.all()`, `db.run()`, `db.get()`)
- **Error Handling**: Centralized middleware in `middleware/errorHandler.js`

### Frontend (Svelte)
- **Stores**: Global state in `stores/` (assignments.js, toast.js)
- **Optimistic Updates**: UI updates immediately, then syncs with backend
- **Component Events**: Custom events for parent-child communication (`dispatch('select', {memberId})`)

## Important Conventions

### API Patterns
- All API routes start with `/api/`
- Assignment endpoints use weekday integers (0-6) and slot_type strings
- Member data always includes `first_name` (displayed) and optional `last_name`
- French localization throughout (UI text, date formatting)

### Frontend Patterns
- **CSS Grid Layout**: 8-column grid for weekly schedules
- **Dark Theme**: Default dark mode with Tailwind CSS
- **Component Props**: Use `export let` for props, `createEventDispatcher()` for events
- **Responsive Design**: Mobile-first approach with Tailwind responsive classes

### Database Patterns
- **Promise Wrappers**: All database methods return promises despite SQLite's callback nature
- **Foreign Keys**: member_id references members.id in assignment tables
- **Date Format**: 'YYYY-MM-DD' string format for specific_assignments.date and sc

## Development Setup

The application requires both backend and frontend to run simultaneously. Use `npm run dev` to start both servers with hot reload. The frontend development server (Vite) proxies API requests to the backend.

Database is automatically created on first run. Use `npm run seed` to populate with sample data.

## Build and Deployment

Frontend builds to `public/dist/` directory. Production setup serves static files from Express and runs only the backend server (`npm start`).