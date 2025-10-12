# BCFK Codebase Structure

## Root Directory Structure
```
├── src/                   # Svelte 5 frontend application
├── controllers/           # Express route handlers
├── services/             # Business logic layer
├── routes/               # API route definitions
├── middleware/           # Express middleware
├── data/                 # SQLite database files (Docker volume)
├── tests/                # Playwright end-to-end tests
├── public/               # Static files and build output
├── scripts/              # Utility scripts
├── docs/                 # Documentation
├── config/               # Configuration files
└── dist/                 # Build artifacts
```

## Frontend Structure (src/)
```
src/
├── pages/                # Route components
│   ├── HomePage.svelte           # Main planning view
│   ├── AssignmentsPage.svelte    # Recurring assignments management
│   ├── AbsencesPage.svelte       # Absence management
│   ├── AuditLogsPage.svelte      # System audit log
│   └── TestUnifiedPage.svelte    # Development testing page
├── components/           # Reusable UI components
│   ├── absences/         # Absence management components
│   ├── assignments/      # Assignment components
│   ├── audit/           # Audit log components
│   ├── common/          # Common UI components
│   ├── help/            # Help and legend components
│   ├── layout/          # Layout components
│   ├── members/         # Member-related components
│   ├── modals/          # Modal components
│   ├── navigation/      # Navigation components
│   ├── schedule/        # Schedule grid components
│   └── table/           # Table components
├── stores/              # Svelte stores for state management
│   ├── assignments.js    # Assignment state
│   ├── absences.js      # Absence state
│   ├── toast.js         # Toast notifications
│   ├── legend.js        # Legend modal state
│   └── auditLogs.js     # Audit log state
├── lib/                 # Utilities and helpers
│   ├── absence/         # Absence-specific utilities
│   ├── api.js           # API client functions
│   ├── dateUtils.js     # Date manipulation utilities
│   ├── icons.js         # Icon definitions
│   └── constants.js     # Application constants
├── App.svelte           # Main application component
└── main.js              # Application entry point
```

## Backend Structure
```
├── app.js               # Express application setup and configuration
├── database.js          # SQLite wrapper with promise-based methods
├── server.js            # Server entry point
├── controllers/         # HTTP request handlers
│   ├── absenceController.js      # Absence endpoints
│   ├── assignmentController.js   # Assignment endpoints
│   └── planningController.js     # Planning endpoints
├── services/            # Business logic layer
│   ├── absenceService.js         # Absence business logic
│   ├── assignmentService.js      # Assignment business logic
│   ├── memberService.js          # Member business logic
│   ├── planningService.js        # Planning business logic
│   └── auditService.js           # Audit logging service
├── routes/              # API route definitions
└── middleware/          # Express middleware
    └── errorHandler.js           # Centralized error handling
```

## Key Files and Their Purposes

### Core Application Files
- `app.js` - Express application setup, middleware configuration, route mounting
- `database.js` - SQLite database wrapper with promise-based methods and schema initialization
- `src/App.svelte` - Main Svelte application with routing and global components
- `src/main.js` - Frontend application entry point

### Configuration Files
- `package.json` - Dependencies and npm scripts
- `playwright.config.js` - End-to-end test configuration
- `vite.config.mjs` - Frontend build configuration
- `tailwind.config.js` - CSS framework configuration
- `docker-compose.yml` - Container orchestration

### Database and Data
- `data/planning.db` - Main SQLite database (created automatically)
- `test-data/planning-test.db` - Test database (created for tests)
- Database schema: members, recurring_assignments, specific_assignments, absences, audit_logs

## Import Patterns
- **Relative imports** for local modules: `./components/common/Avatar.svelte`
- **Absolute imports** from node_modules: `import express from 'express'`
- **Svelte store imports**: `import { writable } from 'svelte/store'`
- **API client usage**: `import { api } from '../lib/api.js'`