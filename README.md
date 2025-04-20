# LifeTracker Pro

A comprehensive life tracking application to help users monitor health, fitness, habits, and personal development goals.

## Features

- **Authentication** - Secure login with Azure AD B2C
- **User Profiles** - Personal information management
- **Fitness Tracking** - Set and monitor workout and health goals
- **Habit Building** - Track daily habits and streaks
- **Personal Development** - Journal entries, skill tracking, and learning management

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
- Webpack for bundling
- Jest for testing

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
npm start  # starts dev server on 3000 (ensure no other process is using port 3000)
```

This will start the development server at http://localhost:3000.

### Backend

```bash
cd backend
npm install
npm run dev  # starts dev server with ts-node-dev on port 4000 (ensure port 4000 is free)
```

This will start the API server at http://localhost:4000.

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
npm test
```

### Backend Tests

```bash
cd backend
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 