# BCFK Project Overview

## Purpose
BCFK is a modern full-stack web application for managing weekly schedules and member assignments for an association. It handles:
- Weekly planning with opening/closing slots (ouverture/fermeture)
- Member management and assignments
- Absence tracking with date ranges
- Audit logging of all changes

## Tech Stack

### Frontend
- **Svelte 5** - Modern reactive framework with new runes syntax (`$state`, `$derived`, `$props`)
- **Vite** - Development server and build tool
- **Tailwind CSS** - Utility-first CSS framework with dark theme
- **svelte-spa-router** - Client-side routing

### Backend
- **Node.js + Express** - Server framework
- **SQLite3** - Database with custom Database wrapper class
- **Custom middleware** - Error handling and request processing

### Development & Testing
- **Playwright** - End-to-end testing framework (Firefox browser)
- **Concurrently** - Run multiple processes simultaneously
- **Nodemon** - Development server with auto-reload

### Deployment
- **Docker + Docker Compose** - Containerized deployment
- **Data persistence** - SQLite database in Docker volumes

## Architecture

### Database Schema
- `members` - Association members (first_name, last_name)
- `recurring_assignments` - Weekly recurring assignments by weekday (0=Monday, 6=Sunday) and slot_type
- `specific_assignments` - Date-specific assignments with source tracking ('manual'/'generated')
- `absences` - Member absences with date ranges and slot-level granularity
- `audit_logs` - Complete audit trail of all system changes

### Key Domain Concepts
- **Weekdays**: 0-6 (Monday=0, Sunday=6)
- **Slot Types**: 'ouverture' (opening) and 'fermeture' (closing)
- **Two Assignment Types**: Recurring (weekly patterns) vs Specific (particular dates)
- **Date Format**: 'YYYY-MM-DD' throughout the system