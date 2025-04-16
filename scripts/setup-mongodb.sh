#!/bin/bash
# MongoDB setup script for Perfect LifeTracker Pro
# This script helps set up MongoDB locally or in a Docker container

# Check if MongoDB is already running
check_mongodb() {
  echo "Checking if MongoDB is running..."
  if mongo --eval "db.version()" > /dev/null 2>&1; then
    echo "MongoDB is already running."
    return 0
  else
    echo "MongoDB is not running."
    return 1
  fi
}

# Setup MongoDB via Docker
setup_docker_mongodb() {
  echo "Setting up MongoDB using Docker..."
  
  # Check if MongoDB container is already running
  if docker ps | grep -q "mongo"; then
    echo "MongoDB container is already running."
  else
    # Check if MongoDB image exists
    if ! docker image ls | grep -q "mongo"; then
      echo "Pulling MongoDB Docker image..."
      docker pull mongo:latest
    fi
    
    # Start MongoDB container
    echo "Starting MongoDB container..."
    docker run -d \
      --name perfectltp-mongodb \
      -p 27017:27017 \
      -v mongodb-data:/data/db \
      --restart unless-stopped \
      mongo:latest
    
    # Wait for MongoDB to start
    echo "Waiting for MongoDB to start..."
    sleep 5
  fi
  
  # Create database and collections
  echo "Creating database and collections..."
  docker exec perfectltp-mongodb mongo --eval "
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
  "
}

# Main script
echo "Perfect LifeTracker Pro - MongoDB Setup"
echo "======================================"

# Check if Docker is installed
if command -v docker > /dev/null 2>&1; then
  echo "Docker is installed. Using Docker for MongoDB setup..."
  setup_docker_mongodb
else
  echo "Docker not found. Please install Docker or set up MongoDB manually."
  echo "MongoDB URI: mongodb://localhost:27017/perfectltp"
fi

echo ""
echo "Setup Complete!"
echo "To use MongoDB instead of the mock database:"
echo "1. Update the USE_MOCK_DATABASE=false in your .env file"
echo "2. Ensure MONGODB_URI is set correctly in your .env file" 