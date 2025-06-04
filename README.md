# Perfect LifeTracker Pro

Perfect LifeTracker Pro is an AI-powered personal assistant application for tracking fitness goals, personal development, and daily tasks.

## Project Overview

This application helps users track:
- Fitness goals and metrics
- Personal development activities
- Daily tasks and to-dos
- Custom goals and achievements

## Tech Stack

- **Frontend**: React with TypeScript, Material UI
- **Backend**: Express.js with TypeScript
- **Database**: Azure Cosmos DB (with MongoDB API compatibility)
- **Authentication**: Microsoft Entra ID (Azure AD)
- **Storage**: Azure Blob Storage
- **Deployment**: Docker, Kubernetes on Azure

## Development Setup

### Prerequisites

- Node.js (v20+)
- npm (v9+)
- Docker and Docker Compose (for containerized development)
- PowerShell (for Windows users)

### Environment Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd PerfectLTP
   ```

2. Create `.env` files:
   - Create `.env` in the root directory
   - Create `frontend/.env` 
   - Create `backend/.env`

   You can use the following templates and adjust as needed:

   **Root .env**:
   ```
   FRONTEND_PORT=8080
   BACKEND_PORT=3001
   AZURE_CLIENT_ID=d9764c39-1eb9-4963-83a0-e8ba859c8965
   AZURE_AUTHORITY=https://login.microsoftonline.com/78e9993f-a208-4c38-9d9d-6b15f0d2407d
   AZURE_REDIRECT_URI=http://localhost:8080
   USE_MOCK_DATABASE=true
   ```

   **Frontend .env**:
   ```
   VITE_REACT_APP_AZURE_CLIENT_ID=d9764c39-1eb9-4963-83a0-e8ba859c8965
   VITE_REACT_APP_AZURE_AUTHORITY=https://login.microsoftonline.com/78e9993f-a208-4c38-9d9d-6b15f0d2407d
   VITE_REACT_APP_AZURE_REDIRECT_URI=http://localhost:3000
   VITE_API_URL=http://localhost:3001
   ```

   **Backend .env**:
   ```
   PORT=3001
   NODE_ENV=development
   USE_MOCK_DATABASE=true
   COSMOS_DB_ENDPOINT=https://localhost:8081
   COSMOS_DB_KEY=dummy-key-for-development
   COSMOS_DB_DATABASE=lifetracker
   MONGODB_URI=mongodb://localhost:27017/perfectltp
   AZURE_CLIENT_ID=d9764c39-1eb9-4963-83a0-e8ba859c8965
   AZURE_AUTHORITY=https://login.microsoftonline.com/78e9993f-a208-4c38-9d9d-6b15f0d2407d
   FRONTEND_URL=http://localhost:3000
   ```

3. Install dependencies:
   ```
   npm run install:all
   ```

### Running the Application

#### Development Mode

To run both frontend and backend in development mode:

```
npm run dev
```

If you encounter "port already in use" errors, use:

```
npm run dev:clean
```

#### Running in Docker

For docker-based development:

```
npm run start:dev
```

For production mode:

```
npm run start
```

To clean up Docker containers and start fresh:

```
npm run start:clean:dev
```

### Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Health Check: http://localhost:3001/api/health

## Project Structure

```
PerfectLTP/
├── frontend/           # React frontend application
│   ├── public/         # Static assets
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── services/   # Service layer (API, Auth)
│   │   ├── hooks/      # Custom React hooks
│   │   └── utils/      # Utility functions
│   └── package.json    # Frontend dependencies
│
├── backend/            # Express.js backend API
│   ├── src/            # Source code
│   │   ├── routes/     # API route definitions
│   │   ├── models/     # Data models
│   │   ├── utils/      # Utility functions
│   │   └── config/     # Configuration files
│   └── package.json    # Backend dependencies
│
├── docker-compose.yml  # Docker composition config
└── package.json        # Root package.json
```

## Authentication

The application uses Microsoft Entra ID (formerly Azure AD) for authentication. This includes:

- Microsoft account login
- Google login (federated through Entra ID)
- Multi-factor authentication support
- Single sign-on capabilities

## License

ISC License

## 🚀 Features

- **Fitness Tracking**: Log workouts, track progress, and set fitness goals
- **Personal Development**: Monitor habits, set personal goals, and track achievements
- **Task Management**: Create and manage daily tasks with priority and deadline tracking
- **AI Insights**: Get personalized recommendations and performance analysis
- **Cross-Platform**: Access your data seamlessly across web and mobile devices
- **Dark/Light Theme**: Customizable UI experience with theme switching
- **File Upload**: Secure file uploads with Azure Blob Storage integration

## 🛠 Tech Stack

### Frontend
- **React 19+** with TypeScript for type safety
- **Material UI 7+** for modern, responsive UI components
- **React Router 7+** for seamless navigation
- **Emotion** for styling components

### Backend
- **Node.js 20+** with Express
- **TypeScript** for type-safe backend development
- **Azure Functions** for serverless API endpoints
- **Azure Cosmos DB** for scalable, globally distributed database
- **Azure Blob Storage** for secure file storage

### AI Integration
- **Azure OpenAI Service** for advanced natural language processing
- **Azure Machine Learning** for personalized recommendations
- **Azure Cognitive Services** for data analysis and insights

### DevOps & Infrastructure
- **GitHub** for version control
- **GitHub Actions** for CI workflow
- **Azure DevOps** for CI/CD pipelines
- **Self-hosted agent** for build automation
- **Docker** for containerized development
- **Terraform** for infrastructure as code
- **Azure Static Web Apps** for frontend hosting
- **Azure App Service** for backend API
- **Azure Cosmos DB** for database storage

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Git
- Docker and Docker Compose (optional)
- Terraform (optional, for infrastructure deployment)
- Azure CLI (optional, for Azure deployments)

### Installation and Setup

1. Clone the repository:
```bash
git clone https://github.com/Perfectz/perfectlifetrack-pro.git
cd perfectlifetrack-pro
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

4. Start the frontend development server:
```bash
# In the frontend directory
npm run dev
```
The frontend will be available at http://localhost:3000

5. Start the backend development server:
```bash
# In the backend directory
npm run dev
```
The backend API will be available at http://localhost:3001

### Running Tests and Lint Checks

Run all frontend and backend tests from the project root:
```bash
npm test
```

Run ESLint for both projects:
```bash
npm run lint
```

### Current Implementation Status

- ✅ Frontend React application with TypeScript
- ✅ Material UI integration with light/dark theme toggle
- ✅ React Router setup with basic page navigation
- ✅ Vite build system for improved development experience
- ✅ Docker development environment
- ✅ GitHub Actions CI workflow
- ✅ Azure DevOps pipeline configuration
- ✅ Self-hosted agent configuration with troubleshooting tools
- ✅ PowerShell scripts for React process management
- ✅ Terraform configuration for Azure infrastructure
- ✅ Azure Blob Storage integration for file uploads
- ⏳ User authentication system (Coming soon)
- ⏳ Database integration (Coming soon)
- ⏳ Feature components development (Coming soon)
- ⏳ AI recommendation features (Coming soon)

## 📝 Contributing

### Development Workflow

This project follows the GitHub Flow model for development:

1. Create a feature branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes, ensuring they follow the project's coding standards
   - Use TypeScript strict mode
   - Follow Material UI component patterns
   - Implement proper error handling
   - Write meaningful commit messages

3. Push your changes to GitHub
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request and describe your changes in detail
   - Link any related issues
   - Explain the purpose and impact of your changes
   - Provide steps to test your changes

5. Wait for CI checks to pass and request review

6. After approval, merge your changes to `main`

### Coding Standards

- **TypeScript**: Use strict mode and proper typing
- **React**: Use functional components with hooks
- **Material UI**: Follow Material UI component patterns and use the theme
- **File Structure**: Place components in appropriate directories
- **Documentation**: Add JSDoc comments for functions and components
- **Testing**: Add tests for new features when applicable

### Branch Protection Rules

- All changes must go through Pull Requests
- CI checks must pass before merging

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## 📚 Documentation

- [System Requirements](documentation/system_requirements.md)
- [Architecture Design](documentation/architecture_design.md)
- [Decisions Log](documentation/decisions_log.md)

## 🔄 CI/CD Status

[![Azure Pipeline Status](https://dev.azure.com/Perfectz/perfectlifetrack-pro/_apis/build/status/perfectlifetrack-pro?branchName=master)](https://dev.azure.com/Perfectz/perfectlifetrack-pro/_build/latest?definitionId=1&branchName=master)

### Recent Build Improvements

- Enhanced CI pipeline reliability with pre-checkout cleanup scripts
- Updated TypeScript configuration for compatibility with Azure DevOps build environment
- Fixed theme and color definitions to ensure consistent builds
- Implemented node_modules cleanup in pipeline to prevent corruption issues

## 👨‍💻 Authors and Acknowledgment

- **Perfect LifeTracker Pro Team** - Initial development and maintenance

## 🔭 Future Plans

- User profile management
- Data visualization for progress tracking
- Mobile app using React Native
- Enhanced AI recommendations
- Integration with fitness wearables 
