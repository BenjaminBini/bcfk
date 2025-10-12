# BCFK Development Commands

## Primary Development Commands

### Development
```bash
npm run dev            # Start both backend (port 3001) and frontend (port 5173) in development mode
npm run dev:server     # Start only the backend with nodemon and inspector
npm run dev:svelte     # Start only the frontend with Vite
```

### Production
```bash
npm run build          # Build the Svelte frontend for production
npm start              # Start production server (backend only)
```

### Database Management
```bash
npm run seed           # Initialize/seed the SQLite database with sample data
npm run sync           # Sync local data to remote server (https://bcfk.bini.io/api)
npm run sync:dry-run   # Preview sync changes without applying them
```

### Testing
```bash
npm test               # Run all Playwright tests
npm run test:absence   # Run specific absence system tests
npm run test:absence-api # Run absence API tests
npm run test:debug     # Run tests with Playwright inspector
npm run test:ui        # Run tests with Playwright UI mode
npm run test:headed    # Run tests with browser window visible
npm run test:report    # Show test results report
```

### Utilities
```bash
npm run cleanup        # Kill processes running on port 3001
```

## URLs
- **Development Frontend**: http://localhost:5173
- **Development Backend/API**: http://localhost:3001
- **Production**: http://localhost:3001

## Key Files to Know
- `app.js` - Express application setup
- `database.js` - SQLite wrapper with promise-based methods
- `src/App.svelte` - Main Svelte application entry point
- `package.json` - All available npm scripts
- `playwright.config.js` - Test configuration