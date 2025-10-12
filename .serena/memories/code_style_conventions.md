# BCFK Code Style and Conventions

## General Conventions
- **No linting/formatting tools** - No ESLint, Prettier, or similar tools configured
- **French localization** - UI text, comments, and documentation primarily in French
- **Date format**: 'YYYY-MM-DD' for all date fields consistently
- **No explicit code comments** - Code is self-documenting with descriptive names

## Frontend (Svelte 5) Conventions

### Component Structure
- **Domain-driven organization**: Components organized by feature (absences/, assignments/, members/, etc.)
- **Svelte 5 runes**: Use `$state`, `$derived`, `$props()` instead of legacy syntax
- **Props definition**: `let { prop1, prop2 = defaultValue } = $props();`
- **Event handling**: Use `createEventDispatcher()` for parent-child communication

### Component Naming
- **PascalCase** for component files (e.g., `AbsenceFormModal.svelte`)
- **Descriptive names** that indicate domain and function
- **Consistent prefixes**: Modal components end with "Modal", Form components with "Form"

### CSS and Styling
- **Tailwind CSS** - Utility-first approach with extensive use of utility classes
- **Dark theme default** - Gradients and glassmorphism effects
- **Responsive design** - Mobile-first approach with burger menu navigation
- **CSS Grid Layout** - 8-column grid for weekly schedules
- **Animation patterns**: Coordinated sliding animations for week navigation

### JavaScript Patterns
- **JSDoc annotations** for component props: `@typedef {Object} Props`
- **Async/await** for API calls
- **Promise-based** database operations
- **Store patterns** - Svelte stores for global state management

## Backend (Node.js) Conventions

### File Organization
- **MVC-like structure**: controllers/, services/, routes/ separation
- **Service layer** - Business logic in service classes
- **Database wrapper** - Custom Database class with promise-based methods
- **Middleware** - Centralized error handling

### Class and Method Patterns
- **Class-based services**: `class MemberService`, `class Database`
- **Promise wrappers**: All database methods return promises despite SQLite callbacks
- **Async/await**: Preferred for asynchronous operations
- **Error handling**: Comprehensive try-catch blocks

### Database Conventions
- **Snake_case** for column names (first_name, last_name, start_date)
- **Foreign key naming**: `member_id` references `members.id`
- **Audit logging**: All mutations tracked in audit_logs table
- **Transaction patterns**: Explicit BEGIN/COMMIT/ROLLBACK for complex operations

## Naming Conventions

### Variables and Functions
- **camelCase** for JavaScript variables and functions
- **PascalCase** for classes and Svelte components
- **UPPERCASE** for constants
- **Descriptive names**: `handleShowLegend`, `generateDisplayNames`, `isMemberAbsentForSlot`

### Database Fields
- **snake_case** for column names
- **Consistent patterns**: `start_date`/`end_date`, `created_at`, `member_id`
- **Self-documenting**: Field names indicate their purpose and type

## API Patterns
- **REST-like endpoints** starting with `/api/`
- **Weekday integers** (0-6) in API parameters
- **JSON responses** with consistent error handling
- **French field names** in responses when user-facing