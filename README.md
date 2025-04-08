# PerfectLifeTrack Pro

PerfectLifeTrack Pro is a comprehensive AI-powered personal assistant application designed to help users track fitness goals, personal development activities, and daily tasks. The application runs on both web and mobile platforms using Azure services, React, and React Native with a modern Material UI interface.

## 🚀 Features

- **Fitness Tracking**: Log workouts, track progress, and set fitness goals
- **Personal Development**: Monitor habits, set personal goals, and track achievements
- **Task Management**: Create and manage daily tasks with priority and deadline tracking
- **AI Insights**: Get personalized recommendations and performance analysis
- **Cross-Platform**: Access your data seamlessly across web and mobile devices

## 🛠 Tech Stack

### Frontend
- React 18+ with TypeScript
- Material UI 5+
- React Router 6+
- Redux Toolkit for state management

### Backend
- Node.js 18+
- Azure Functions
- Azure Cosmos DB
- Azure OpenAI Service

### Mobile
- React Native 0.70+
- iOS 15+ and Android 11+ support
- Cross-platform compatibility

### DevOps
- Azure Kubernetes Service
- Docker containers
- GitHub Actions for CI/CD
- Azure DevOps for deployment

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Azure account (for deployment)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/perfectlifetrack-pro.git
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

4. Set up environment variables:
```bash
# Frontend
cp frontend/.env.example frontend/.env
# Backend
cp backend/.env.example backend/.env
```

5. Start the development servers:
```bash
# Frontend
cd frontend
npm start

# Backend (in a new terminal)
cd backend
npm run dev
```

## 📝 Contributing

This project follows the GitHub Flow model for development:

1. Create a feature branch from `main`
2. Make your changes
3. Push to your feature branch
4. Create a Pull Request
5. Wait for CI checks to pass
6. Merge after review

### Branch Protection Rules
- All changes must go through Pull Requests
- CI checks must pass before merging
- No direct pushes to `main`
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

[![Azure Pipeline Status](https://dev.azure.com/your-org/perfectlifetrack-pro/_apis/build/status/perfectlifetrack-pro?branchName=main)](https://dev.azure.com/your-org/perfectlifetrack-pro/_build/latest?definitionId=1&branchName=main)

## 📱 Mobile App Status

[![iOS Build Status](https://img.shields.io/badge/iOS-Beta-orange)](https://testflight.apple.com/join/your-code)
[![Android Build Status](https://img.shields.io/badge/Android-Beta-green)](https://play.google.com/store/apps/details?id=com.perfectlifetrack) 