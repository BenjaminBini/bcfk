# BCFK Task Completion Checklist

## When a Development Task is Completed

### Testing Requirements
1. **Run tests** - Always run the relevant Playwright tests:
   ```bash
   npm test                # All tests
   npm run test:absence    # For absence-related changes
   npm run test:absence-api # For absence API changes
   ```

2. **No linting/formatting** - The project does not use ESLint, Prettier, or similar tools
   - No automated linting or formatting commands to run
   - Code style should follow existing patterns in the codebase

### Build Verification
1. **Development build** - Ensure both servers start correctly:
   ```bash
   npm run dev  # Start both backend and frontend
   ```

2. **Production build** - For significant changes:
   ```bash
   npm run build  # Build frontend for production
   npm start      # Test production server
   ```

### Database Considerations
1. **Database changes** - If schema or data changes were made:
   ```bash
   npm run seed   # Reseed database if needed
   ```

2. **Data persistence** - Verify changes work with existing data

### Manual Testing Checklist
1. **Cross-browser compatibility** - Tests run on Firefox (configured in Playwright)
2. **Mobile responsiveness** - Test on mobile viewport sizes
3. **Dark theme** - Verify styling works with the default dark theme
4. **Animation behavior** - Check week navigation and modal animations
5. **French localization** - Ensure UI text remains in French

### No Additional Tools Required
- **No TypeScript compilation** - Project uses plain JavaScript
- **No Svelte-check** - No type checking tools configured
- **No bundle analysis** - Standard Vite build process

### Key Areas to Test Manually
1. **Week navigation** - Smooth animations and date updates
2. **Member assignments** - Both recurring and specific assignments
3. **Absence management** - Date range validation and conflict detection
4. **Modal interactions** - All modal open/close behaviors
5. **Responsive design** - Mobile burger menu and grid layouts
6. **API functionality** - Backend endpoints respond correctly

### Final Verification
- All Playwright tests pass
- Development server starts without errors
- Production build completes successfully
- Core functionality works as expected
- No console errors in browser developer tools