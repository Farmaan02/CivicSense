# Running CivicPulse Locally

This guide explains how to run the CivicPulse application locally for development and testing.

## Prerequisites

- Node.js 20.x or higher (check .nvmrc file)
- npm 9.x or higher
- MongoDB 7.x (for database functionality)

## OneDrive Warning

⚠️ **Important**: The project should not be run from a OneDrive folder as this can cause `EINVAL readlink` errors on Windows. Move the project to a non-OneDrive path (e.g., `~/projects/civicpulse`) before running.

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd civicpulse

# Install frontend dependencies
npm ci

# Install backend dependencies
cd scripts
npm ci
cd ..
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# JWT secret for authentication
JWT_SECRET=your-super-secret-jwt-key-here

# MongoDB connection string (optional, will use in-memory database if not set)
MONGODB_URI=mongodb://localhost:27017/civicpulse

# Google Gemini API key (optional, for AI features)
GEMINI_KEY=your-gemini-api-key-here

# WhatsApp API credentials (optional, for notifications)
WHATSAPP_API=your-whatsapp-api-key-here
WHATSAPP_VERIFY_TOKEN=your-whatsapp-verify-token-here
```

### 3. Start MongoDB (if using MongoDB)

If you have MongoDB installed locally:

```bash
mongod
```

Or use Docker to run MongoDB:

```bash
docker run -d -p 27017:27017 --name civicpulse-mongo mongo:7.0
```

### 4. Run the Application

#### Development Mode

```bash
# Start the frontend and backend together
npm run dev

# Or start them separately:
# Terminal 1: Start the backend
cd scripts
npm run start:dev

# Terminal 2: Start the frontend
npm run dev
```

#### Production Mode

```bash
# Build the frontend
npm run build

# Start the frontend
npm start

# Start the backend (in a separate terminal)
cd scripts
npm start
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Backend Health Check: http://localhost:3001/health

## Running Tests

### Unit and Integration Tests

```bash
npm test
```

### E2E Tests

```bash
# Run all E2E tests
npx playwright test

# Run E2E tests in headed mode
npx playwright test --headed

# Run specific test file
npx playwright test e2e/homepage.spec.ts
```

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Start services in detached mode
docker-compose up -d

# Stop services
docker-compose down
```

### Individual Docker Images

```bash
# Build the frontend image
docker build -t civicpulse-frontend .

# Build the backend image
cd scripts
docker build -t civicpulse-backend -f ../Dockerfile.backend .
cd ..
```

## Health Check

Run the health check script to verify the environment:

```bash
npm run health
```

This script will:
- Check for OneDrive path issues
- Verify environment variables
- Test MongoDB connection (if configured)
- Validate Node.js version

## Common Issues and Solutions

### 1. EINVAL readlink Error (Windows/OneDrive)

**Problem**: `EINVAL: invalid argument, readlink` error when building or running the app.

**Solution**: Move the project to a non-OneDrive directory.

### 2. MongoDB Connection Failed

**Problem**: Backend cannot connect to MongoDB.

**Solution**: 
- Ensure MongoDB is running
- Check the MONGODB_URI in your environment variables
- Verify MongoDB credentials if using authentication

### 3. Port Already in Use

**Problem**: Error that port 3000 or 3001 is already in use.

**Solution**: Kill the processes using those ports or change the PORT environment variable.

### 4. Missing Environment Variables

**Problem**: Application fails to start due to missing environment variables.

**Solution**: Ensure all required variables are set in `.env.local`.

## Project Structure

```
civicpulse/
├── app/                 # Next.js pages and routing
├── components/          # React components
├── lib/                 # Utility functions and libraries
├── scripts/             # Backend API server
├── public/              # Static assets
├── styles/              # Global styles
├── uploads/             # Uploaded media files
├── __tests__/           # Unit tests
├── e2e/                 # End-to-end tests
├── .github/workflows/   # CI/CD workflows
├── docker-compose.yml   # Docker Compose configuration
├── Dockerfile           # Frontend Docker configuration
├── Dockerfile.backend   # Backend Docker configuration
├── .env.local           # Local environment variables
├── .nvmrc               # Node.js version specification
└── package.json         # Project dependencies and scripts
```

## Available Scripts

### Frontend (root directory)

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run linter
- `npm test` - Run unit and integration tests
- `npm run health` - Run health check

### Backend (scripts directory)

- `npm start` - Start production server
- `npm run start:dev` - Start development server with auto-reload
- `npm test` - Run backend tests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests to ensure nothing is broken
5. Submit a pull request

## Support

For issues or questions, please open an issue on the GitHub repository.