# Testing Guide for SmartQueue System

This document provides comprehensive information about running tests for both the frontend and backend components of the SmartQueue system.

## Table of Contents

- [Frontend Testing](#frontend-testing)
- [Backend Testing](#backend-testing)
- [Test Coverage](#test-coverage)
- [Running Specific Tests](#running-specific-tests)
- [Test Structure](#test-structure)
- [Writing New Tests](#writing-new-tests)

## Frontend Testing

The frontend uses Jest and React Testing Library for comprehensive testing of React components.

### Prerequisites

Make sure you have the testing dependencies installed:

```bash
cd frontend
pnpm install
```

### Running Frontend Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode (recommended for development)
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage
```

### Frontend Test Structure

```
frontend/
├── __tests__/
│   ├── utils/
│   │   └── test-utils.tsx          # Test utilities and custom render
│   ├── app/
│   │   └── login/
│   │       └── page.test.tsx       # Login page component tests
│   ├── contexts/
│   │   └── auth-context.test.tsx   # Authentication context tests
│   └── lib/
│       └── auth.test.ts            # Authentication library tests
├── jest.config.js                  # Jest configuration
└── jest.setup.js                   # Jest setup and mocks
```

### Frontend Test Categories

1. **Component Tests** (`page.test.tsx`)
   - UI rendering
   - User interactions
   - Form submissions
   - Error handling
   - Accessibility

2. **Context Tests** (`auth-context.test.tsx`)
   - State management
   - Authentication flow
   - localStorage persistence
   - Error handling

3. **Library Tests** (`auth.test.ts`)
   - API integration
   - Data transformation
   - Error handling
   - Edge cases

## Backend Testing

The backend uses pytest with FastAPI TestClient for comprehensive API and service testing.

### Prerequisites

Make sure you have the testing dependencies installed:

```bash
cd backend
pip install -r requirements.txt
```

### Running Backend Tests

```bash
# Run all tests
python run_tests.py

# Run tests with specific marker
python run_tests.py auth
python run_tests.py api
python run_tests.py unit
python run_tests.py integration

# Run specific test file
python run_tests.py test_auth_api.py

# Run with pytest directly
pytest tests/ -v --cov=app --cov-report=term-missing
```

### Backend Test Structure

```
backend/
├── tests/
│   ├── conftest.py                 # Pytest configuration and fixtures
│   ├── test_auth_api.py           # Authentication API tests
│   └── test_user_service.py       # User service layer tests
├── pytest.ini                     # Pytest configuration
└── run_tests.py                   # Test runner script
```

### Backend Test Categories

1. **API Tests** (`test_auth_api.py`)
   - HTTP endpoint testing
   - Request/response validation
   - Error handling
   - Authentication flow

2. **Service Tests** (`test_user_service.py`)
   - Business logic testing
   - Database operations
   - Data validation
   - Error scenarios

## Test Coverage

### Frontend Coverage

The frontend tests aim for comprehensive coverage of:
- Component rendering and interactions
- Authentication flow
- Form validation
- Error handling
- Accessibility features

### Backend Coverage

The backend tests aim for 80%+ coverage of:
- API endpoints
- Service layer logic
- Database operations
- Authentication mechanisms
- Error handling

## Running Specific Tests

### Frontend Specific Tests

```bash
# Run only login page tests
pnpm test login

# Run only auth context tests
pnpm test auth-context

# Run tests matching a pattern
pnpm test -- --testNamePattern="login"
```

### Backend Specific Tests

```bash
# Run only authentication tests
python run_tests.py auth

# Run only API tests
python run_tests.py api

# Run only unit tests
python run_tests.py unit

# Run specific test file
python run_tests.py test_auth_api.py

# Run specific test function
pytest tests/test_auth_api.py::TestAuthAPI::test_login_success_visitor -v
```

## Test Structure

### Frontend Test Structure

Each frontend test file follows this structure:

```typescript
import { render, screen, waitFor } from '@/__tests__/utils/test-utils'
import userEvent from '@testing-library/user-event'

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup mocks and test data
  })

  describe('Feature Category', () => {
    it('should do something specific', async () => {
      // Arrange
      // Act
      // Assert
    })
  })
})
```

### Backend Test Structure

Each backend test file follows this structure:

```python
import pytest
from fastapi import status

class TestComponentName:
    """Test cases for component functionality."""
    
    @pytest.mark.category
    def test_specific_functionality(self, client, db_session, sample_data):
        """Test description."""
        # Arrange
        # Act
        # Assert
```

## Writing New Tests

### Frontend Test Guidelines

1. **Use the custom render function** from `test-utils.tsx`
2. **Mock external dependencies** (API calls, localStorage, etc.)
3. **Test user interactions** using `userEvent`
4. **Test accessibility** with proper ARIA attributes
5. **Test error scenarios** and edge cases
6. **Use descriptive test names** that explain the behavior

Example:

```typescript
it('should show error message when login fails', async () => {
  const user = userEvent.setup()
  mockLogin.mockResolvedValue(false)
  
  render(<LoginPage />)
  
  await user.type(screen.getByLabelText(/email/i), 'test@example.com')
  await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
  await user.click(screen.getByRole('button', { name: /sign in/i }))
  
  await waitFor(() => {
    expect(screen.getByText(/login failed/i)).toBeInTheDocument()
  })
})
```

### Backend Test Guidelines

1. **Use fixtures** for common test data
2. **Test both success and failure scenarios**
3. **Verify database state** after operations
4. **Test input validation** and error handling
5. **Use appropriate pytest markers**
6. **Test API responses** thoroughly

Example:

```python
@pytest.mark.auth
@pytest.mark.api
def test_login_invalid_credentials(self, client, db_session, sample_user_data):
    """Test login with invalid credentials."""
    # Create user first
    user_create = UserCreate(**sample_user_data)
    user_service.create_user(db=db_session, user_data=user_create)
    
    # Test login with wrong password
    login_data = {
        "email": sample_user_data["email"],
        "password": "wrongpassword"
    }
    
    response = client.post("/users/login", json=login_data)
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    data = response.json()
    assert "Invalid credentials" in data["detail"]
```

## Test Data and Fixtures

### Frontend Test Data

- Mock data is defined in test files
- API responses are mocked using Jest
- User interactions are simulated with `userEvent`

### Backend Test Data

- Fixtures are defined in `conftest.py`
- Sample data includes users, institutions, and other entities
- Database is reset between tests using SQLite in-memory database

## Continuous Integration

Tests should be run automatically in CI/CD pipelines:

```yaml
# Frontend CI
- name: Run Frontend Tests
  run: |
    cd frontend
    pnpm test:coverage

# Backend CI
- name: Run Backend Tests
  run: |
    cd backend
    python run_tests.py
```

## Debugging Tests

### Frontend Test Debugging

```bash
# Run tests in debug mode
pnpm test -- --verbose --no-coverage

# Run specific test with debugging
pnpm test -- --testNamePattern="login" --verbose
```

### Backend Test Debugging

```bash
# Run tests with detailed output
pytest tests/ -v -s

# Run specific test with debugging
pytest tests/test_auth_api.py::TestAuthAPI::test_login_success_visitor -v -s
```

## Best Practices

1. **Keep tests focused** - Each test should verify one specific behavior
2. **Use descriptive names** - Test names should explain what is being tested
3. **Arrange-Act-Assert** - Structure tests with clear sections
4. **Test edge cases** - Don't just test happy paths
5. **Mock external dependencies** - Tests should be isolated
6. **Maintain test data** - Keep fixtures and mock data up to date
7. **Run tests frequently** - Run tests during development
8. **Review coverage** - Ensure adequate test coverage

## Troubleshooting

### Common Frontend Issues

1. **Mock not working** - Check import paths and mock setup
2. **Async test failures** - Use `waitFor` for async operations
3. **Component not rendering** - Check custom render function usage

### Common Backend Issues

1. **Database connection errors** - Check SQLite configuration
2. **Import errors** - Verify Python path and dependencies
3. **Test isolation** - Ensure database is reset between tests

For more specific issues, check the test output and error messages for guidance.
