# How to Run CivicPulse Locally

This guide provides detailed instructions for running the CivicPulse application locally in development mode.

## Prerequisites

- Node.js 20.x LTS (see [.nvmrc](.nvmrc))
- MongoDB (v7.0 or later recommended)
- npm package manager
- Docker (optional, for containerized setup)

## ⚠️ Important Note About OneDrive

**Do not run this project from a OneDrive folder!** Doing so may cause `EINVAL readlink` errors on Windows due to symbolic link issues. Move the project to a standard path such as:
```
~/projects/civicsense
# or
C:\projects\civicsense
```

## Option 1: Docker (Recommended for Quick Setup)

### Using Docker Compose

1. Ensure Docker is installed and running on your system
2. From the project root, run:
   ```bash
   docker-compose up --build
   ```
3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Development with Hot Reloading

For development with hot reloading:
```bash
docker-compose -f docker-compose.dev.yml up --build
```

## Option 2: Manual Setup

### 1. Environment Variables

Create `.env.local` files with the required environment variables:

**Root directory `.env.local`:**
```env
MONGODB_URI=mongodb://localhost:27017/civicsense
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters
NEXT_PUBLIC_API_URL=http://localhost:3001
GUEST_PASSWORD=guest123
```

**Scripts directory `.env.local`:**
```env
MONGODB_URI=mongodb://localhost:27017/civicsense
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters
GUEST_PASSWORD=guest123
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm ci

# Install backend dependencies
cd scripts
npm ci
cd ..
```

### 3. Start MongoDB

Ensure MongoDB is running locally on port 27017, or start it with Docker:
```bash
docker run -d -p 27017:27017 --name civicsense-mongo mongo:7.0
```

### 4. Run the Application

In separate terminal windows:

**Terminal 1 - Frontend:**
```bash
# Use the correct Node version
nvm use  # or nvm use 20.11.1

# Start the Next.js development server
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd scripts
npm run start:dev
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## Health Check

Run the health check script to verify your setup:
```bash
npm run health
```

This script will:
- Check for OneDrive path issues
- Verify environment variables
- Test MongoDB connection
- Validate Node.js version
- Check static assets

## Testing

### Frontend Tests
```bash
npm run test:frontend
```

### Backend Tests
```bash
npm test
```

### End-to-End Tests
```bash
npx playwright test
```

### Watch Mode
```bash
# Frontend tests in watch mode
npm run test:frontend -- --watch

# Backend tests in watch mode
cd scripts
npm run test:watch
```

## Common Issues and Solutions

### 1. EINVAL readlink Error
**Cause:** Running project from OneDrive folder on Windows
**Solution:** Move project to non-OneDrive path

### 2. MongoDB Connection Failed
**Cause:** MongoDB not running or incorrect URI
**Solution:** 
- Ensure MongoDB is running on localhost:27017
- Verify MONGODB_URI in .env.local files

### 3. Port Already in Use
**Cause:** Another process using ports 3000 or 3001
**Solution:** Kill the processes or change ports in configuration

### 4. Missing Environment Variables
**Symptoms:** Authentication errors, database connection failures
**Solution:** Ensure all required environment variables are set in .env.local files

### 5. Build Errors
**Cause:** Node.js version mismatch
**Solution:** Use the Node.js version specified in [.nvmrc](.nvmrc):
```bash
nvm use
```

## Project Structure

- **Frontend:** Next.js application in root directory
- **Backend:** Express.js API in [scripts](scripts) directory
- **Database:** MongoDB (local or Docker)
- **Uploads:** Media files stored in [uploads](uploads) directory
- **Tests:** Frontend tests in [__tests__](__tests__), backend tests in [scripts/tests](scripts/tests)

## API Endpoints

- **Health Check:** `GET /health`
- **Create Report:** `POST /reports`
- **Get Reports:** `GET /reports`
- **User Authentication:** `POST /auth/login`, `POST /auth/guest`
- **Media Upload:** `POST /media/upload`

For complete API documentation, see the Postman collection at [postman_collection.json](postman_collection.json).

## Development Workflow

1. **Branching:** Create feature branches from `develop`
2. **Commits:** Follow conventional commit messages
3. **Pre-commit Hooks:** Code will be linted and tested automatically before commit
4. **Pull Requests:** Use the PR template and ensure all checklist items are completed

## Production Deployment

For production deployment, use the multi-stage Dockerfiles:
- [Dockerfile](Dockerfile) for frontend
- [Dockerfile.backend](Dockerfile.backend) for backend

Build and run with:
```bash
docker-compose up --build
```