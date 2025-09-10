# OneEats E2E Test Suite

[![Playwright](https://img.shields.io/badge/Playwright-45ba4b?logo=playwright&logoColor=white)](https://playwright.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-green)](.)

## 📋 Overview

Professional end-to-end test suite for the OneEats food delivery platform, built with Playwright and TypeScript. Tests cover restaurant dashboard functionality, API integration, and responsive design validation.

## 🏗️ Architecture

### Directory Structure

```
tests/specs/
├── restaurant/                     # Restaurant Dashboard Tests
│   ├── authentication.spec.ts      # Login & session management
│   ├── menu-management.spec.ts     # Menu CRUD operations
│   ├── order-management.spec.ts    # Order processing & workflow
│   ├── restaurant-settings.spec.ts # Profile & configuration
│   └── dashboard-responsive.spec.ts # Mobile & responsive design
├── api/                            # API Integration Tests
│   ├── restaurant-api.spec.ts      # Restaurant API endpoints
│   └── menu-api.spec.ts           # Menu API operations
└── integration/                    # End-to-End Workflows
    └── end-to-end-workflows.spec.ts # Complete user journeys
```

### Test Categories

| Category | Purpose | Test Count |
|----------|---------|------------|
| **Authentication** | Login flows, session management | 3 tests |
| **Menu Management** | CRUD operations, availability | 8 tests |
| **Order Management** | Order processing, status updates | 4 tests |
| **Settings** | Profile config, operating hours | 5 tests |
| **Responsive Design** | Cross-device compatibility | 6 tests |

## 🚀 Quick Start

### Prerequisites

```bash
# Install dependencies
cd tests
npm install
```

### Running Tests

```bash
# Run all restaurant dashboard tests
npx playwright test restaurant/

# Run specific test suite
npx playwright test restaurant/menu-management.spec.ts

# Run with browser visible
npx playwright test restaurant/ --headed

# Run on specific browser
npx playwright test restaurant/ --project=chromium
```

### Test Configuration

Tests are configured in `playwright.config.ts` with the following projects:

- `restaurant-dashboard`: All restaurant functionality tests
- `api-backend`: API integration tests
- `integration`: End-to-end workflow tests

## 📊 Test Coverage

### Restaurant Dashboard Features

#### ✅ Menu Management (`menu-management.spec.ts`)
- **Item Creation**: Appetizers, mains, desserts with full form validation
- **Availability Toggle**: Real-time status updates and UI synchronization
- **Search & Filtering**: Category filters and text search functionality
- **Responsive Design**: Mobile, tablet, desktop compatibility
- **Data Persistence**: Cross-session data integrity validation

#### ✅ Authentication (`authentication.spec.ts`)
- **Login Flow**: Email/password authentication with redirect validation
- **Session Management**: Cross-page navigation session persistence
- **Access Control**: Restaurant-specific feature protection

#### ✅ Order Management (`order-management.spec.ts`)
- **Order Display**: Order cards with status and action buttons
- **Status Filtering**: Filter by order status (pending, in-progress, ready)
- **Dashboard Customization**: Design theme selection and preferences
- **Performance**: Rapid navigation and real-time updates

#### ✅ Settings (`restaurant-settings.spec.ts`)
- **Profile Configuration**: Restaurant info, contact details, description
- **Operating Hours**: Day-by-day schedule configuration
- **Data Mapping**: API field mapping and bidirectional sync
- **Error Handling**: Graceful error recovery and validation

#### ✅ Responsive Design (`dashboard-responsive.spec.ts`)
- **Cross-Device**: Mobile (375px), tablet (768px), desktop (1920px+)
- **Touch Interactions**: Mobile-optimized button sizes and gestures
- **Performance**: Load time validation across viewport sizes
- **Layout Adaptation**: Grid systems and responsive navigation

## 🔧 Test Design Principles

### 1. **Professional Naming Convention**
```typescript
// ✅ Good: Descriptive, behavior-focused
test('should create menu item and update availability status', async ({ page }) => {

// ❌ Avoid: Generic, numbered tests
test('Test 1.1 : Création d\'un menu complet', async ({ page }) => {
```

### 2. **Robust Selectors**
```typescript
// ✅ Good: Data attributes and semantic selectors
page.locator('[data-testid="menu-item-card"]')
page.locator('button').filter({ hasText: 'Save' })

// ❌ Avoid: Fragile CSS selectors
page.locator('.btn.btn-primary.save-button')
```

### 3. **Comprehensive JSDoc Documentation**
```typescript
/**
 * @fileoverview Restaurant Menu Management E2E Tests
 * @description Comprehensive testing of menu item CRUD operations
 * @author OneEats Development Team
 * @since 2025-09-10
 */
```

### 4. **Structured Test Organization**
```typescript
test.describe('Menu Item Creation', () => {
  test.describe('Form Validation', () => {
    test('should validate required fields', async ({ page }) => {
      // Test implementation
    });
  });
});
```

## 📈 Reporting and CI/CD

### Test Reports

Tests generate comprehensive reports in multiple formats:

```bash
# HTML Report (interactive)
npx playwright show-report

# JSON Report (CI integration)
cat tests/reports/results.json

# JUnit XML (CI systems)
cat tests/reports/junit.xml
```

### Continuous Integration

```yaml
# Example GitHub Actions workflow
- name: Run E2E Tests
  run: |
    cd tests
    npx playwright test restaurant/
    npx playwright show-report
```

## 🛠️ Development Guidelines

### Adding New Tests

1. **Choose appropriate directory** (`restaurant/`, `api/`, `integration/`)
2. **Follow naming convention**: `feature-name.spec.ts`
3. **Include JSDoc header** with file description
4. **Use descriptive test names** with `should` statements
5. **Group related tests** with `test.describe()`

### Best Practices

- **Wait Strategies**: Use `waitForLoadState('networkidle')` for SPA routing
- **Error Handling**: Include try/catch for flaky interactions
- **Data Isolation**: Each test should be independent
- **Performance**: Include timing assertions where relevant
- **Accessibility**: Test keyboard navigation and screen reader compatibility

### Test Data Management

```typescript
// Centralized test data
const TEST_MENU_ITEMS = {
  appetizers: [
    { name: 'Caesar Salad', category: 'Appetizer', price: '8.50' }
  ]
};
```

## 🔍 Debugging

### Debug Mode

```bash
# Run with debug mode
npx playwright test --debug restaurant/menu-management.spec.ts

# Slow motion execution
npx playwright test --slow-mo=1000 restaurant/

# Video recording
npx playwright test --video=on restaurant/
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Flaky selectors | Use `data-testid` attributes |
| Timing issues | Add `waitForTimeout()` or `waitForSelector()` |
| Modal interactions | Ensure modal is visible before interaction |
| Mobile testing | Set viewport size before navigation |

## 📞 Support

- **Documentation**: [Playwright Docs](https://playwright.dev)
- **Issues**: Create GitHub issue with test reproduction steps
- **Team**: OneEats Development Team

---

> **Note**: These tests are designed for the OneEats Quarkus + React application with Quinoa integration. Ensure the backend is running on port 8080 before executing tests.

*Last updated: September 10, 2025*