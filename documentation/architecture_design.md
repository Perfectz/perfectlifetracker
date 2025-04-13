# Perfect LifeTracker Pro - Architecture Design

## System Architecture Overview

```mermaid
graph TD
    Client[Client Applications] --> API[API Gateway]
    API --> Auth[Authentication Service]
    API --> Fitness[Fitness Service]
    API --> Tasks[Task Service]
    API --> AI[AI Service]
    
    Auth --> DB[(Cosmos DB)]
    Fitness --> DB
    Tasks --> DB
    AI --> DB
    
    AI --> OpenAI[Azure OpenAI]
    AI --> ML[Azure ML]
```

## Component Architecture

### Frontend Architecture
```mermaid
graph TD
    App[React Application] --> Router[React Router]
    App --> State[State Management]
    App --> UI[Material UI]
    
    Router --> Pages[Page Components]
    State --> Context[React Context]
    State --> Redux[Redux Store]
    
    Pages --> Features[Feature Components]
    Features --> Shared[Shared Components]
```

### Backend Architecture
```mermaid
graph TD
    API[API Gateway] --> Auth[Auth Service]
    API --> Fitness[Fitness Service]
    API --> Tasks[Task Service]
    API --> AI[AI Service]
    
    Auth --> DB[(Cosmos DB)]
    Fitness --> DB
    Tasks --> DB
    AI --> DB
    
    AI --> OpenAI[Azure OpenAI]
    AI --> ML[Azure ML]
```

## Data Flow

### Authentication Flow
```mermaid
sequenceDiagram
    Client->>+Auth: Login Request
    Auth->>+DB: Verify Credentials
    DB-->>-Auth: User Data
    Auth->>+Client: JWT Token
    Client->>+API: Request with Token
    API->>+Auth: Validate Token
    Auth-->>-API: Validation Result
    API-->>-Client: Protected Resource
```

### AI Service Flow
```mermaid
sequenceDiagram
    Client->>+API: Request AI Analysis
    API->>+AI: Process Request
    AI->>+OpenAI: Generate Response
    OpenAI-->>-AI: AI Response
    AI->>+DB: Store Results
    DB-->>-AI: Confirmation
    AI-->>-API: Processed Response
    API-->>-Client: Final Result
```

## Deployment Architecture

### Kubernetes Deployment
```mermaid
graph TD
    Ingress[Ingress Controller] --> Frontend[Frontend Pods]
    Ingress --> Backend[Backend Pods]
    
    Frontend --> Redis[(Redis Cache)]
    Backend --> DB[(Cosmos DB)]
    
    Backend --> OpenAI[Azure OpenAI]
    Backend --> ML[Azure ML]
```

### Docker Development Environment
```mermaid
graph TD
    DockerCompose[Docker Compose] --> FrontendContainer[Frontend Container]
    DockerCompose --> BackendContainer[Backend Container]
    
    FrontendContainer --> ViteServer[Vite Dev Server]
    BackendContainer --> NodeJS[Node.js Express]
    
    ViteServer --> HotReload[Hot Module Replacement]
    NodeJS --> APIEndpoints[API Endpoints]
    
    FrontendContainer --> FrontendVolume[Source Code Volume]
    BackendContainer --> BackendVolume[Source Code Volume]
    
    FrontendContainer --> Port3000[Port 3000]
    BackendContainer --> Port3001[Port 3001]
```

## Security Architecture

### Authentication & Authorization
```mermaid
graph TD
    Client[Client] --> AzureAD[Azure AD B2C]
    AzureAD --> Token[Token Service]
    Token --> API[API Gateway]
    API --> Services[Microservices]
    
    Services --> RBAC[Role-Based Access]
    RBAC --> Resources[Protected Resources]
```

## Current Implementation Status

### Frontend Implementation
```mermaid
graph TD
    App[React App] --> Theme[MUI ThemeProvider]
    Theme --> Router[React Router]
    Router --> Pages[Page Components]
    Pages --> Home[HomePage]
    Pages --> Dashboard[DashboardPage]
    
    Theme --> LightTheme[Light Theme]
    Theme --> DarkTheme[Dark Theme]
    
    Home --> MUIComponents[MUI Components]
    Dashboard --> MUIComponents
    MUIComponents --> Typography[Typography]
    MUIComponents --> Box[Box]
    MUIComponents --> Paper[Paper]
    MUIComponents --> Container[Container]
    MUIComponents --> AppBar[AppBar]
```

### Current Component Structure
```mermaid
graph TD
    Root[index.tsx] --> BrowserRouter
    BrowserRouter --> App[App.tsx]
    App --> ThemeProvider
    ThemeProvider --> Routes
    Routes --> Home[HomePage]
    Routes --> Dashboard[DashboardPage]
    
    App --> Navbar[Navigation Bar]
    Navbar --> ThemeToggle[Theme Toggle]
    Navbar --> NavLinks[Navigation Links]
```

### Theme Implementation
```mermaid
graph TD
    ThemeFile[theme.ts] --> BaseOptions[Base Theme Options]
    BaseOptions --> LightTheme[Light Theme]
    BaseOptions --> DarkTheme[Dark Theme]
    
    App[App.tsx] --> ThemeState[Theme State]
    ThemeState --> ActiveTheme[Active Theme]
    ThemeState --> ToggleFunction[Theme Toggle Function]
    
    ActiveTheme --> ThemeProvider[MUI ThemeProvider]
    ThemeProvider --> Components[All Components]
```

### Development Workflow
```mermaid
graph TD
    Development[Development Process] --> CleanStart[Clean Start]
    Development --> Maintenance[Maintenance]
    Development --> DockerDev[Docker Development]
    
    CleanStart --> StartClean[start-clean.ps1]
    StartClean --> KillProcesses[Kill React Processes]
    StartClean --> StartReact[Start React Server]
    
    Maintenance --> KillScript[kill-react.ps1]
    KillScript --> DetectPorts[Detect Ports 3000-3002]
    KillScript --> FindReactProcesses[Find React Processes]
    KillScript --> TerminateProcesses[Terminate Processes]
    
    StartReact --> ViteServer[Vite Dev Server]
    ViteServer --> Browser[Browser Access]
    
    DockerDev --> DockerCompose[docker-compose up]
    DockerCompose --> FrontendContainer[Frontend Container]
    DockerCompose --> BackendContainer[Backend Container]
    FrontendContainer --> HMR[Hot Module Replacement]
    BackendContainer --> NodemonWatcher[Nodemon Auto-restart]
```

### Build Systems
```mermaid
graph TD
    BuildTools[Build Systems] --> LocalBuild[Local Build]
    BuildTools --> CIBuild[CI Build]
    BuildTools --> DockerBuild[Docker Build]
    
    LocalBuild --> ViteDev[Vite Dev Server]
    LocalBuild --> ViteBuild[Vite Production Build]
    
    CIBuild --> AzurePipeline[Azure DevOps Pipeline]
    AzurePipeline --> CleanupStep[Node Modules Cleanup]
    AzurePipeline --> BuildStep[Build Frontend/Backend]
    AzurePipeline --> TestStep[Test Frontend/Backend]
    AzurePipeline --> PublishStep[Publish Artifacts]
    
    DockerBuild --> DockerfileBuild[Frontend Dockerfile]
    DockerBuild --> MultiStage[Multi-stage Build]
    DockerBuild --> NodeAlpine[Node Alpine Base]
```

## Version History
| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2024-04-08 | 1.0.0 | Initial architecture design | Perfect LifeTracker Pro Team | 
| 2024-04-08 | 1.1.0 | Added frontend implementation details | Perfect LifeTracker Pro Team | 
| 2024-04-08 | 1.2.0 | Added development workflow with PowerShell scripts | Perfect LifeTracker Pro Team | 
| 2024-04-09 | 1.3.0 | Added Docker development environment and Vite build system | Perfect LifeTracker Pro Team |