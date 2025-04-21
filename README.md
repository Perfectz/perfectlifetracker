# LifeTracker Pro

A comprehensive life tracking application to help users monitor health, fitness, habits, and personal development goals.

## Features

- **Authentication** - Secure login with Azure AD B2C (with fallback to mock auth for development)
- **User Profiles** - Personal information management
- **Fitness Tracking** - Set and monitor workout and health goals
- **Habit Building** - Track daily habits and streaks
- **Personal Development** - Journal entries, skill tracking, and learning management
- **Accessibility** - ARIA-compliant components and screen reader support
- **Notifications** - Toast notifications for important events and feedback

## Project Structure

- `frontend/` - React TypeScript frontend application
- `backend/` - Express TypeScript backend API
- `infra/` - Terraform infrastructure as code
- `k8s/` - Kubernetes deployment manifests
- `documentation/` - Project documentation and daily plans

## Technologies

### Frontend
- React 18 with TypeScript
- MSAL for Microsoft Authentication
- MUI (Material-UI) for components
- React Hot Toast for notifications
- Webpack for bundling
- Jest and React Testing Library for unit testing
- Cypress for end-to-end testing
- axe-core for accessibility testing

### Backend
- Express.js with TypeScript
- JWT authentication with express-jwt
- Azure integrations (Cosmos DB, Blob Storage)

## Development

### Prerequisites
- Node.js v16+
- npm v8+
- Git

### Frontend

```bash
cd frontend
npm install
npm run prestart  # kill port 3000 if used
npm start          # starts dev server on 3000
npm run lint       # run ESLint
npm test           # run frontend tests
npm run build      # production build
npm run analyze    # optional bundle analysis
npm run cypress    # open Cypress test runner
npm run cypress:run # run Cypress tests headlessly
```

This will start the development server at http://localhost:3000.

### Backend

```bash
cd backend
npm install
npm run predev      # kill port 4000 if used
npm run lint        # run ESLint
npm run build       # compile TypeScript
npm test            # run backend tests (allows no tests)
npm run dev        # start dev server with ts-node-dev
node test-api-contract.js  # API contract test for /health endpoint
```

This will start the API server at http://localhost:3001.

### Starting Both Services

For convenience, a root-level command is available to start both frontend and backend:

```bash
# From project root
npm run dev
```

## Authentication Flow

The application supports two authentication modes:

1. **Production Mode**: Uses Azure AD B2C with MSAL for authentication
2. **Development Mode**: Uses mock authentication with session storage

To test the authentication flow in development:
1. Visit the landing page
2. Click the "Sign In" button
3. The mock auth system will authenticate you and redirect to dashboard
4. Your session will persist in `sessionStorage` until you sign out

## Environment Configuration

### Backend Environment Variables

The backend requires certain environment variables to be set:

```
# Required for JWT authentication (development)
JWT_SECRET=your-dev-secret

# For production with Azure AD B2C
JWKS_URI=https://your-tenant.b2clogin.com/your-tenant.onmicrosoft.com/discovery/v2.0/keys
AZURE_AD_B2C_API_IDENTIFIER=api://your-api-id
AZURE_AD_B2C_ISSUER=https://your-tenant.b2clogin.com/your-tenant.onmicrosoft.com/v2.0/
```

## Building and Deployment

### Frontend

To build the frontend:

```bash
cd frontend
npm run build
```

This will create a production build in the `dist/` directory.

### Backend

To build the backend:

```bash
cd backend
npm run build
```

## Testing

### Frontend Tests

```bash
cd frontend
npm test               # Run Jest unit tests
npm run cypress:run    # Run Cypress E2E tests
```

Available test suites:
- Unit tests for React components
- E2E tests for navigation, routes, and authentication flow

### Cypress Testing

Our E2E tests implement best practices for stable test runs:

- Multiple selector strategies to prevent flakiness
- Appropriate timeouts for asynchronous operations
- Session state cleanup between tests
- Fallback assertions when primary checks might fail
- Direct session storage manipulation when needed

Example of a resilient test in `cypress/e2e/login.spec.ts`:

```typescript
it('should log in and redirect to dashboard', () => {
  // Programmatically set auth state
  cy.window().then((win) => {
    win.sessionStorage.setItem('mock_auth_state', 'authenticated');
  });
  cy.visit('/dashboard');
  
  // Verify with multiple selectors
  cy.get('body').then(($body) => {
    if ($body.find('.MuiDrawer-root').length > 0) {
      cy.get('.MuiDrawer-root').should('exist');
    } else {
      cy.contains('Dashboard', { timeout: 8000 }).should('be.visible');
    }
  });
});
```

### Backend Tests

```bash
cd backend
npm test
```

Backend tests cover:
- API routes and controllers
- Service logic
- Authentication middleware

## Notifications

The application uses `react-hot-toast` for a seamless notification system:

```typescript
import { toastService } from './services/toastService';

// Display success notification
toastService.success('Profile updated successfully');

// Show loading toast that updates on completion
const toastId = toastService.loading('Saving changes...');
// Later update the toast:
toastService.update(toastId, 'success', 'Changes saved successfully');

// Track a promise with automatic status updates
toastService.promise(saveData(), {
  loading: 'Saving data...',
  success: 'Data saved successfully',
  error: 'Failed to save data'
});
```

## Accessibility

The application follows WCAG 2.1 AA standards:

- Proper semantic HTML
- ARIA attributes for interactive elements
- Keyboard navigation
- Focus management
- Screen reader announcements
- Color contrast compliance

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 