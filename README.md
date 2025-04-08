# Perfect LifeTracker Pro

Perfect LifeTracker Pro is a comprehensive AI-powered personal assistant application designed to help users track fitness goals, personal development activities, and daily tasks. The application leverages artificial intelligence to provide personalized recommendations, analyze progress patterns, and offer actionable insights to help users achieve their goals more effectively.

With an intuitive interface built on Material UI, Perfect LifeTracker Pro offers a seamless experience across both web and mobile platforms, allowing users to stay connected to their goals wherever they are.

## 🚀 Features

- **Fitness Tracking**: Log workouts, track progress, and set fitness goals
- **Personal Development**: Monitor habits, set personal goals, and track achievements
- **Task Management**: Create and manage daily tasks with priority and deadline tracking
- **AI Insights**: Get personalized recommendations and performance analysis
- **Cross-Platform**: Access your data seamlessly across web and mobile devices
- **Dark/Light Theme**: Customizable UI experience with theme switching

## 🛠 Tech Stack

### Frontend
- **React 18+** with TypeScript for type safety
- **Material UI 7+** for modern, responsive UI components
- **React Router 7+** for seamless navigation
- **Emotion** for styling components

### Backend
- **Node.js 18+** with Express
- **TypeScript** for type-safe backend development
- **Azure Functions** for serverless API endpoints
- **Azure Cosmos DB** for scalable, globally distributed database

### AI Integration
- **Azure OpenAI Service** for advanced natural language processing
- **Azure Machine Learning** for personalized recommendations
- **Azure Cognitive Services** for data analysis and insights

### DevOps
- **GitHub** for version control
- **Azure DevOps** for CI/CD pipelines
- **Self-hosted agent** for build automation
- **Azure Kubernetes Service** for containerized deployment

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

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
npm start
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
- ✅ Basic backend Express server
- ✅ CI/CD pipeline with Azure DevOps
- ✅ Self-hosted agent configuration
- ⏳ User authentication system (Coming soon)
- ⏳ Database integration (Coming soon)
- ⏳ Feature components development (Coming soon)
- ⏳ AI recommendation features (Coming soon)

## 📝 Contributing

### Development Workflow

This project follows the GitHub Flow model for development:

1. Create a feature branch from `master`
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

6. After approval, merge your changes to `master`

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
- No direct pushes to `master`
- At least one approval required

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

## 👨‍💻 Authors and Acknowledgment

- **Perfect LifeTracker Pro Team** - Initial development and maintenance

## 🔭 Future Plans

- User profile management
- Data visualization for progress tracking
- Mobile app using React Native
- Enhanced AI recommendations
- Integration with fitness wearables 