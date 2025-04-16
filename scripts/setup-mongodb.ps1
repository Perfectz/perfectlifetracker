# MongoDB setup script for Perfect LifeTracker Pro (Windows version)
# This script helps set up MongoDB locally or in a Docker container

# Function to check if MongoDB is already running
function Check-MongoDB {
    Write-Host "Checking if MongoDB is running..."
    try {
        $null = Invoke-Expression "mongo --eval 'db.version()'" -ErrorAction SilentlyContinue
        Write-Host "MongoDB is already running."
        return $true
    } catch {
        Write-Host "MongoDB is not running."
        return $false
    }
}

# Function to set up MongoDB via Docker
function Setup-DockerMongoDB {
    Write-Host "Setting up MongoDB using Docker..."
    
    # Check if MongoDB container is already running
    $containerRunning = docker ps | Select-String -Pattern "mongo" -Quiet
    if ($containerRunning) {
        Write-Host "MongoDB container is already running."
    } else {
        # Check if MongoDB image exists
        $imageExists = docker image ls | Select-String -Pattern "mongo" -Quiet
        if (-not $imageExists) {
            Write-Host "Pulling MongoDB Docker image..."
            docker pull mongo:latest
        }
        
        # Start MongoDB container
        Write-Host "Starting MongoDB container..."
        docker run -d `
            --name perfectltp-mongodb `
            -p 27017:27017 `
            -v mongodb-data:/data/db `
            --restart unless-stopped `
            mongo:latest
        
        # Wait for MongoDB to start
        Write-Host "Waiting for MongoDB to start..."
        Start-Sleep -Seconds 5
    }
    
    # Create database and collections
    Write-Host "Creating database and collections..."
    $setupScript = @"
    use perfectltp;
    db.createCollection('users');
    db.createCollection('projects');
    db.createCollection('tasks');
    db.createCollection('comments');
    db.createCollection('notifications');
    db.createCollection('files');
    db.users.createIndex({ email: 1 }, { unique: true });
    db.users.createIndex({ username: 1 }, { unique: true });
    db.projects.createIndex({ id: 1 }, { unique: true });
    db.projects.createIndex({ ownerId: 1 });
    db.projects.createIndex({ 'members.userId': 1 });
    db.projects.createIndex({ status: 1 });
    db.tasks.createIndex({ id: 1 }, { unique: true });
    db.tasks.createIndex({ projectId: 1 });
    db.tasks.createIndex({ assigneeId: 1 });
    db.tasks.createIndex({ status: 1 });
    db.tasks.createIndex({ dueDate: 1 });
    db.files.createIndex({ id: 1 }, { unique: true });
    db.files.createIndex({ userId: 1 });
    db.files.createIndex({ relatedEntityId: 1 });
    db.files.createIndex({ category: 1 });
    db.files.createIndex({ blobName: 1 });
    print('Database setup complete.');
"@
    
    $setupScript | Out-File -FilePath "temp_mongo_setup.js" -Encoding utf8
    # Use docker exec to run the MongoDB script
    Get-Content "temp_mongo_setup.js" | docker exec -i perfectltp-mongodb mongo
    Remove-Item -Path "temp_mongo_setup.js"
}

# Main script
Write-Host "Perfect LifeTracker Pro - MongoDB Setup"
Write-Host "======================================"

# Check if Docker is installed
try {
    $null = Get-Command docker -ErrorAction Stop
    Write-Host "Docker is installed. Using Docker for MongoDB setup..."
    Setup-DockerMongoDB
} catch {
    Write-Host "Docker not found. Please install Docker or set up MongoDB manually."
    Write-Host "MongoDB URI: mongodb://localhost:27017/perfectltp"
}

Write-Host ""
Write-Host "Setup Complete!"
Write-Host "To use MongoDB instead of the mock database:"
Write-Host "1. Update the USE_MOCK_DATABASE=false in your .env file"
Write-Host "2. Ensure MONGODB_URI is set correctly in your .env file" 