# E2E Tests for Absence System

This directory contains comprehensive end-to-end tests for the BCFK absence management system using Playwright.

## Test Structure

### Test Files

- **`absence-system.spec.js`** - Main functional tests for absence system
  - Navigation and page access
  - Creating absences from absence page and schedule grid
  - Absence display and validation
  - Deleting absences
  - Form validation
  - Schedule integration

- **`absence-api.spec.js`** - API integration tests
  - Request validation
  - Response handling
  - Error scenarios
  - Data persistence
  - Concurrent operations

### Helper Files

- **`helpers/test-helpers.js`** - Utility functions and test data
  - Navigation helpers
  - Form filling utilities
  - API mocking functions
  - Test data generation

- **`test.config.js`** - Test configuration and constants
  - Timeouts and selectors
  - Test scenarios
  - Environment settings

## Running Tests

### Prerequisites

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Ensure the application is running at `http://localhost:5173`

### Test Commands

```bash
# Run all tests
npm test

# Run only absence system tests
npm run test:absence

# Run only API tests
npm run test:absence-api

# Run tests in debug mode
npm run test:debug

# Run tests with UI mode
npm run test:ui

# Run tests in headed mode (visible browser)
npm run test:headed

# View test report
npm run test:report
```

## Test Scenarios Covered

### 1. Navigation and Page Access
- Navigate to absences page
- Display member absence panels
- Load data correctly

### 2. Creating Absences

#### From Absence Page
- Simple single-day absence
- Multi-day absence with specific slots
- Slot-specific same-day absence

#### From Schedule Grid
- Create absence via member tag interaction
- Slot-specific absence from schedule
- Full-day absence from schedule

### 3. Absence Display and Validation
- Display created absences in member panels
- Show correct absence period information
- Validate absence data formatting

### 4. Deleting Absences
- Delete absence with confirmation dialog
- Verify absence removal from UI
- Handle deletion errors

### 5. Form Validation
- Required field validation
- Date range validation (end before start)
- Invalid same-day slot configuration
- API error handling

### 6. API Integration
- Correct request formatting
- Response handling
- Error scenarios (network, server errors)
- Data persistence
- Concurrent operations
- Error recovery

## Test Data

Tests use dynamic test data generation to avoid conflicts:

```javascript
// Helper function generates future dates
const futureDate = TEST_DATA.dates.future(7); // 7 days from now

// Test absence configurations
const testAbsence = TestHelpers.getTestAbsenceData('simple');
```

## Mocking and Error Simulation

Tests include comprehensive API mocking:

```javascript
// Mock successful API responses
await TestHelpers.mockAbsenceAPI(page, {
  getAbsences: [...],
  createAbsence: {...}
});

// Simulate network errors
await TestHelpers.simulateNetworkError(page);

// Simulate server errors
await TestHelpers.simulateServerError(page, '**/api/absences', 500);
```

## Screenshots and Debugging

- Screenshots are automatically captured on test failures
- Video recording on failure retention
- Debug mode available for step-by-step test execution
- UI mode for interactive test development

## Key Selectors Used

Tests rely on data-testid attributes for reliable element selection:

- `[data-testid="absence-form-modal"]`
- `[data-testid="member-absence-panel"]`
- `[data-testid="absence-item"]`
- `[data-testid="slot-absence-modal"]`

## Environment Considerations

- Tests automatically adjust timeouts in CI environment
- Development server detection
- Network error simulation for offline testing
- Browser selection (currently Firefox for stability)

## Adding New Tests

When adding new tests:

1. Use the TestHelpers utility functions
2. Follow the existing naming conventions
3. Add appropriate test data to test.config.js
4. Include both positive and negative test cases
5. Mock API responses for consistent testing
6. Use data-testid attributes for element selection

## Common Issues

### Test Flakiness
- Tests include proper waits for network operations
- Use `waitForLoadState('networkidle')` for API-dependent operations
- Implement retry logic for unstable operations

### Element Selection
- Prefer data-testid attributes over CSS classes
- Use text content matching for user-facing elements
- Wait for element visibility before interaction

### API Testing
- Always mock API responses for predictable testing
- Test both success and error scenarios
- Verify request payloads and response handling

## Continuous Integration

Tests are configured for CI environments with:
- Increased timeouts
- Retry logic for flaky tests
- Headless browser execution
- Artifact collection (screenshots, videos, traces)