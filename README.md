# Perfect LifeTracker Pro

A comprehensive AI-powered personal assistant application designed to help users track fitness goals, personal development activities, and daily tasks.

## Project Structure

The project is organized into three main components:

- **Frontend**: React with TypeScript, Material UI (Vite)
- **Backend**: Azure Functions (Node.js)
- **Infrastructure**: Terraform configuration for Azure resources

## Getting Started

### Running the Frontend

The frontend uses Vite for faster development and builds:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Or using Docker:

```bash
# Build and run with Docker Compose
docker-compose up
```

### Running the Backend

The backend uses Azure Functions:

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Start the development server
npm start
```

### Infrastructure as Code

The project uses Terraform to define and manage Azure infrastructure:

```bash
# Navigate to the terraform directory
cd terraform

# Initialize Terraform
terraform init

# Plan the deployment
terraform plan -out=tfplan

# Apply the configuration
terraform apply tfplan
```

## Development Workflow

1. Make your changes
2. Test locally
3. Commit your changes
4. Push to the repository
5. The CI/CD pipeline will handle deployment

## Additional Documentation

For more detailed documentation, see:

- [Frontend Documentation](./frontend/README.md)
- [Architecture Design](./documentation/architecture_design.md)
- [System Requirements](./documentation/system_requirements.md)
- [Decisions Log](./documentation/decisions_log.md)
- [Terraform Infrastructure](./terraform/README.md)

## 🚀 Features

- **Fitness Tracking**: Log workouts, track progress, and set fitness goals
- **Personal Development**: Monitor habits, set personal goals, and track achievements
- **Task Management**: Create and manage daily tasks with priority and deadline tracking
- **AI Insights**: Get personalized recommendations and performance analysis
- **Cross-Platform**: Access your data seamlessly across web and mobile devices
- **Dark/Light Theme**: Customizable UI experience with theme switching

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