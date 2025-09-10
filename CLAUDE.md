# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BCFK is a modern full-stack web application for managing weekly schedules and member assignments for an association. The system features a Svelte 5 SPA frontend with advanced animations, a Node.js/Express backend, and SQLite database with Docker deployment support.

## Development Commands

```bash
npm run dev            # Start both backend (port 3001) and frontend (port 5173) in development mode
npm run dev:server     # Start only the backend with nodemon
npm run dev:svelte     # Start only the frontend with Vite
npm run build          # Build the Svelte frontend for production
npm run seed           # Initialize/seed the SQLite database with sample data
npm start              # Start production server (backend only)
npm run cleanup        # Kill processes running on port 3001
npm run sync           # Sync local data to remote server (https://bcfk.bini.io/api)
```

## Architecture

### Modern Stack Structure
- **Backend**: Node.js + Express on port 3001 (`/api/*` routes)
- **Frontend**: Svelte 5 SPA served by Vite on port 5173 (development)
- **Database**: SQLite3 with custom Database wrapper class, Docker volume persistence
- **Styling**: Tailwind CSS with dark theme, mobile-first responsive design
- **Deployment**: Docker Compose with data persistence

### Key Directories
```
src/                   # Svelte 5 frontend
├── pages/            # Route components (HomePage, AssignmentsPage, AbsencesPage)
├── components/       # Reusable components with animations
│   ├── absences/     # Absence management components (AbsenceForm, AbsenceList, etc.)
│   ├── assignments/  # Assignment components (SlotEditionCell, SlotWarning, etc.)
│   ├── audit/        # Audit log components (AuditLogCard, AuditLogsList, etc.)
│   ├── common/       # Common UI components (Avatar, FormField, SubmitButton, etc.)
│   ├── help/         # Help and legend components (Legend, LegendModal, etc.)
│   ├── layout/       # Layout components (PageHeader, ContentWrapper, etc.)
│   ├── members/      # Member-related components (MemberTag, AddMemberButton, etc.)
│   ├── modals/       # Modal components with transitions
│   ├── navigation/   # Navigation components (DesktopNavigation, MobileMenu, etc.)
│   ├── schedule/     # Schedule grid components (ScheduleGrid, SlotCell, etc.)
│   └── table/        # Table components (WeeklyScheduleGrid, ColumnHeader, etc.)
├── stores/           # Svelte stores for state management
└── lib/              # Utilities (API client, icons)

Backend root files:
├── app.js            # Express application setup
├── database.js       # SQLite wrapper with promise-based methods (data/ directory)
├── controllers/      # Route handlers
├── services/         # Business logic layer
├── routes/           # API route definitions
└── data/            # Database files (Docker volume)
```

## Core Domain Model

**Database Schema (SQLite)**:
- `members` - Association members (first_name, last_name)
- `recurring_assignments` - Recurring weekly assignments by weekday (0=Monday, 6=Sunday) and slot_type ('ouverture'/'fermeture')
- `specific_assignments` - Slot schedule for specific dates with source tracking ('manual'/'generated')
- `absences` - Member absences with date ranges (start_date, end_date)

**Key Concepts**:
- **Weekdays**: 0-6 (Monday=0, Sunday=6)
- **Slot Types**: 'ouverture' (opening) and 'fermeture' (closing)
- **Two Assignment Types**: Recurring assignments (weekly patterns) and specific assignments (particular dates)
- **Absence Management**: Date range-based absence tracking

## State Management Patterns

### Backend
- **Service Layer**: Business logic in services/ (memberService, planningService, assignmentService, absenceService)
- **Database Class**: Custom SQLite wrapper with promise-based methods (`db.all()`, `db.run()`, `db.get()`)
- **Error Handling**: Centralized middleware in `middleware/errorHandler.js`
- **Data Persistence**: Database stored in `/app/data/` for Docker volume mounting

### Frontend (Svelte 5)
- **Stores**: Global state in `stores/` (assignments.js, absences.js, toast.js, legend.js)
- **Runes**: New Svelte 5 syntax with `$state`, `$derived`, `$props`
- **Optimistic Updates**: UI updates immediately, then syncs with backend
- **Component Events**: Custom events for parent-child communication
- **Animations**: Smooth transitions with coordinated week navigation

## Important Conventions

### API Patterns
- All API routes start with `/api/`
- Assignment endpoints use weekday integers (0-6) and slot_type strings
- Member data always includes `first_name` (displayed) and optional `last_name`
- French localization throughout (UI text, date formatting)
- Date format: 'YYYY-MM-DD' for all date fields

### Frontend Patterns
- **CSS Grid Layout**: 8-column grid for weekly schedules with sticky headers on mobile
- **Dark Theme**: Default dark mode with Tailwind CSS gradients and glassmorphism
- **Responsive Design**: Mobile-first approach with burger menu navigation
- **Component Organization**: Domain-driven folder structure (absences/, assignments/, members/, etc.)
- **Animations**: Coordinated sliding animations for week navigation
  - PageHeader date range slides horizontally
  - DayHeaderCell dates slide with week changes
  - Modal entrance/exit animations with fade + fly transitions
- **Component Props**: Use `$props()` rune, `createEventDispatcher()` for events
- **Accessibility**: Proper ARIA labels, keyboard navigation, screen reader support

### Animation System
- **Week Navigation**: Coordinated animations when changing weeks
  - Date range in PageHeader slides left/right
  - Individual day dates slide across full cell width
  - Navigation direction determines slide direction
- **Modal Animations**: Consistent fade + fly transitions across all modals
- **Member Tags**: Two-phase animations (scale then translate) with glow effects
- **Responsive Behavior**: Different animations for mobile vs desktop

### Database Patterns
- **Promise Wrappers**: All database methods return promises despite SQLite's callback nature
- **Foreign Keys**: member_id references members.id in assignment/absence tables
- **Date Format**: 'YYYY-MM-DD' string format for all date fields
- **Data Directory**: Database stored in `data/` folder for Docker persistence

## Development Setup

The application requires both backend and frontend to run simultaneously. Use `npm run dev` to start both servers with hot reload. The frontend development server (Vite) proxies API requests to the backend.

Database is automatically created on first run in the `data/` directory. Use `npm run seed` to populate with sample data.

## Build and Deployment

Frontend builds to `public/dist/` directory. Production setup serves static files from Express and runs only the backend server (`npm start`).

### Docker Deployment
- Database persists in Docker volume mounted to `/app/data`
- Static files served from `/app/public/dist`
- Production URL: https://bcfk.bini.io
- Sync script available to replicate local data to remote server

## Mobile Optimization

- **Responsive Grid**: Sticky first row/column on mobile for better navigation
- **Touch Interactions**: Click-based interactions instead of hover for mobile compatibility
- **Burger Menu**: Mobile navigation with slide-out menu
- **Optimized Spacing**: Reduced padding and font sizes for mobile screens
- **Horizontal Scroll**: Custom scrollbars for horizontal table navigation

## Key Features

- **Week Navigation**: Animated navigation between weeks with smooth transitions
- **Member Management**: Add, edit, and assign members to recurring or specific slots
- **Absence Tracking**: Date range-based absence management with conflict detection
- **Responsive Design**: Mobile-optimized interface with touch-friendly interactions
- **Data Synchronization**: Sync between local development and remote production
- **Docker Ready**: Containerized deployment with persistent data storage