# LifeTracker Pro Frontend

React TypeScript frontend for the LifeTracker Pro application.

## ✨ Features

- **Responsive Design** - Mobile and desktop-friendly UI with Material UI
- **Theme Support** - Light/dark mode with localStorage persistence
- **Routing** - Centralized route configuration with React Router and protected routes
- **Authentication** - Azure AD B2C integration
- **API Integration** - Axios for backend communication
- **State Management** - React Context API and React Query
- **Testing** - Jest, React Testing Library, and Cypress
- **Accessibility** - axe-core integration for automated a11y testing
- **Notifications** - Toast notifications via react-hot-toast

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will be available at http://localhost:3000

## 📋 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run unit tests
- `npm run cy:open` - Open Cypress test runner
- `npm run cy:run` - Run Cypress tests headlessly
- `npm run test:e2e` - Start server and run E2E tests
- `npm run lint` - Check for linting issues
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier

## 🏗️ Project Structure

```
frontend/
├── cypress/             # E2E tests
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # Reusable components
│   │   ├── common/      # Shared components
│   │   ├── auth/        # Authentication components
│   │   ├── profile/     # Profile-related components
│   │   └── dashboard/   # Dashboard components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API services
│   │   └── toastService.ts # Toast notifications service
│   ├── theme/           # Theme configuration
│   ├── App.tsx          # Main App component
│   ├── routes.tsx       # Centralized route configuration
│   ├── config.ts        # Centralized app configuration
│   ├── index.tsx        # Entry point
│   └── themeContext.tsx # Theme provider
├── .eslintrc.js         # ESLint configuration
├── .prettierrc          # Prettier configuration
├── jest.config.js       # Jest configuration
├── tsconfig.json        # TypeScript configuration
└── webpack.config.js    # Webpack configuration
```

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### E2E Tests

```bash
# Start the dev server and run tests
npm run test:e2e

# Or run tests against an already running server
npm run cy:run
```

#### Cypress Testing Tips

Our E2E tests are designed to be resilient by:
- Using appropriate timeouts for asynchronous operations
- Implementing multiple selector strategies to find elements
- Providing fallback assertions when primary ones might be flaky
- Cleaning up session state between tests
- Using session storage directly when needed to avoid UI interaction variability

## 🔧 Configuration

Environment variables can be set in a `.env` file:

```
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_AZURE_AD_B2C_API_SCOPE=https://YOUR_TENANT.onmicrosoft.com/api/user.read
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_NOTIFICATIONS=false
```

## 🚧 Development Guidelines

- Follow the existing code style and architecture
- Add unit tests for new components
- Update E2E tests for new features
- Use the centralized route configuration in `routes.tsx` for adding or modifying routes
  - Update the RouteConfig interface if additional properties are needed
  - Use the exported helper functions for filtered routes (getAuthorizedRoutes, getNavigationRoutes, etc.)
- Store configuration in `config.ts`
- Keep components small and focused
- Use React.memo for performance optimization when appropriate
- Use toastService for notifications:
  ```typescript
  import { toastService } from '../services/toastService';
  
  // Display success toast
  toastService.success('Operation completed successfully');
  
  // Display error toast
  toastService.error('Something went wrong');
  
  // Show loading toast that updates on completion
  const toastId = toastService.loading('Processing...');
  // Later update it:
  toastService.update(toastId, 'success', 'Process completed!');
  
  // Track a promise with toast notifications
  toastService.promise(fetchData(), {
    loading: 'Fetching data...',
    success: 'Data loaded successfully',
    error: 'Failed to load data'
  });
  ```

## 🛠️ Built With

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Material UI](https://mui.com/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
- [React Query](https://tanstack.com/query/latest)
- [React Hot Toast](https://react-hot-toast.com/)
- [Jest](https://jestjs.io/)
- [Cypress](https://www.cypress.io/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/) 