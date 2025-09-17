# Development Guide

This document provides detailed information about developing and contributing to the CivicSense platform.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Frontend Development](#frontend-development)
- [Backend Development](#backend-development)
- [Database](#database)
- [AI Integration](#ai-integration)
- [Internationalization](#internationalization)
- [Testing](#testing)
- [Deployment](#deployment)
- [Docker Configuration](#docker-configuration)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)

## Project Overview

CivicSense is a comprehensive civic issue reporting platform built with modern web technologies. It allows community members to report problems in their neighborhood, view them on an interactive map, and track their resolution.

### Key Features

- Interactive map visualization with clustering
- Multi-language support (English and Hindi)
- AI-powered image analysis and classification
- Real-time notifications
- Admin dashboard with report management
- Team assignment and workflow management
- Analytics and reporting

## Architecture

The application follows a modern full-stack architecture:

```
┌─────────────────┐    ┌──────────────────┐
│   Frontend      │    │    Backend       │
│   (Next.js)     │◄──►│   (Express.js)   │
└─────────────────┘    └──────────────────┘
                              │
                              ▼
                       ┌─────────────┐
                       │  Database   │
                       │ (MongoDB)   │
                       └─────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Radix UI Components
- Leaflet for mapping
- Recharts for analytics

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Google Gemini AI (optional)

**Development Tools:**
- Jest for testing
- Postman for API testing
- Docker for containerization
- ESLint and Prettier for code quality

## Frontend Development

### Project Structure

```
app/                    # Next.js app directory
├── page.tsx           # Landing page
├── layout.tsx         # Root layout
├── admin/             # Admin dashboard
├── map/               # Interactive map page
└── reports/           # Reports dashboard

components/            # React components
├── ui/                # Reusable UI components
├── landing-hero.tsx   # Main landing page component
├── report-modal/      # Report form components
├── media-upload/      # Media upload components
├── location/          # Location components
├── map/               # Map components
├── navigation/        # Navigation components
└── notifications/     # Notification components

hooks/                 # Custom React hooks
├── use-admin-auth.tsx # Admin authentication hook
├── use-notifications.ts # Notification management hook
└── use-mobile.ts      # Mobile detection hook

i18n/                  # Internationalization
├── en.json           # English translations
└── hi.json           # Hindi translations

lib/                   # Utility libraries
└── i18n.ts           # i18n utilities

utils/                 # Frontend utilities
└── api.ts            # API client
```

### Component Development Guidelines

1. **Use TypeScript** for all new components
2. **Follow the existing component structure** with proper typing
3. **Use functional components** with hooks instead of class components
4. **Implement proper error handling** and loading states
5. **Use the existing UI component library** (Radix UI + custom components)
6. **Follow accessibility guidelines** (ARIA labels, keyboard navigation)

### Styling

- Use Tailwind CSS for styling
- Follow the existing color scheme:
  - Primary: #A3B18A (Light olive green)
  - Accent: #588157 (Darker olive green)
  - Light: #DAD7CD (Light neutral)
  - Dark: #344E41 (Dark olive)
- Use responsive design principles
- Implement proper focus states and hover effects

## Backend Development

### Project Structure

```
scripts/               # Backend server and utilities
├── backend-server.js  # Main server file
├── routes/            # API route handlers
│   ├── ai.js          # AI service endpoints
│   ├── auth.js        # Authentication routes
│   ├── teams.js       # Team management routes
│   ├── analytics.js   # Analytics endpoints
│   ├── reports.js     # Report management routes
│   └── webhooks.js    # Webhook endpoints
├── middleware/        # Express middleware
│   └── adminAuth.js   # Admin authentication middleware
├── models/            # Mongoose models
│   └── report.js      # Report model
├── services/          # Service layer
│   ├── geminiService.ts # AI service
│   └── notificationService.js # Notification service
├── tests/             # Test suite
│   ├── reports.spec.js # API tests
│   └── setup.js       # Test setup
└── db/                # Database utilities
    └── init-mongo.js  # MongoDB initialization
```

### API Development Guidelines

1. **Use RESTful principles** for API design
2. **Implement proper error handling** with consistent error responses
3. **Use middleware** for authentication and validation
4. **Document all endpoints** in the README and Postman collection
5. **Follow consistent naming conventions** for routes and parameters
6. **Implement proper logging** for debugging and monitoring

### Authentication

The backend uses JWT-based authentication for admin routes:

1. **Login**: POST `/auth/login` with username/password
2. **Token Verification**: GET `/auth/verify` with Bearer token
3. **Protected Routes**: Use `authenticateAdmin` middleware
4. **Permissions**: Use `requirePermission` middleware for granular access control

## Database

### MongoDB Schema

The application uses MongoDB with the following main collections:

**Reports Collection:**
- trackingId (unique identifier)
- description (report description)
- location (geospatial data)
- media (uploaded files)
- status (report status)
- priority (urgency level)
- assignedTo (team assignment)
- updates (status change history)

### Database Operations

1. **Connection**: Uses Mongoose for MongoDB operations
2. **Seeding**: Sample data is automatically seeded on first run
3. **Indexes**: Geospatial indexes for location-based queries
4. **Validation**: Schema validation at the database level

## AI Integration

### Google Gemini AI

The platform integrates with Google Gemini AI for:

1. **Image Analysis**: Automatic classification of issue types
2. **Severity Assessment**: Priority assignment based on image content
3. **Description Generation**: Auto-generated descriptions from images
4. **Audio Transcription**: Voice-to-text capabilities

### Fallback System

When the GEMINI_KEY environment variable is not set, the system uses intelligent mock responses to ensure functionality during development.

## Internationalization

### Language Support

The platform supports multiple languages through a JSON-based translation system:

1. **English** (default)
2. **Hindi**

### Implementation

1. **Translation Files**: Located in `i18n/` directory
2. **Language Switcher**: Component in navigation bar
3. **Persistent Storage**: User preference saved in localStorage
4. **Fallback System**: Automatic fallback to English for missing translations

## Testing

### Test Structure

```
scripts/tests/
├── reports.spec.js     # Report API tests
├── notifications.spec.js # Notification service tests
└── setup.js           # Test environment setup
```

### Running Tests

```bash
cd scripts
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
```

### Test Guidelines

1. **Use Jest** for all backend tests
2. **Use Supertest** for API endpoint testing
3. **Mock external services** (AI, notifications)
4. **Test edge cases** and error conditions
5. **Maintain high test coverage** (>80%)

## Deployment

### Production Deployment

1. **Environment Variables**: Set all required environment variables
2. **MongoDB**: Ensure MongoDB is accessible
3. **Build**: Run `npm run build` for frontend
4. **Start**: Run `npm start` for frontend and backend

### Docker Deployment

The application includes Docker configurations for both development and production:

```bash
# Production
docker-compose up --build

# Development with hot reloading
docker-compose -f docker-compose.dev.yml up --build
```

## Docker Configuration

### Files

- `Dockerfile.frontend`: Frontend Docker configuration
- `Dockerfile.backend`: Backend Docker configuration
- `docker-compose.yml`: Production Docker Compose
- `docker-compose.dev.yml`: Development Docker Compose

### Services

1. **Frontend**: Next.js application
2. **Backend**: Express.js API server
3. **MongoDB**: Database service

## Environment Variables

### Required Variables

```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Backend
PORT=3001
MONGODB_URI=mongodb://localhost:27017/civiccare
JWT_SECRET=your_jwt_secret_key_here

# AI (Optional)
GEMINI_KEY=your_google_gemini_api_key
```

### Development Variables

```env
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
```

## API Documentation

### Core Endpoints

- `GET /health` - Health check
- `POST /reports` - Create new report
- `GET /reports` - Get all reports
- `GET /reports/:trackingId` - Get specific report

### Admin Endpoints

- `POST /auth/login` - Admin login
- `GET /admin/reports` - Get all reports (admin)
- `PATCH /reports/:id/assign` - Assign report to team
- `PATCH /reports/:id/status` - Update report status

### AI Endpoints

- `POST /ai/analyze-image` - Analyze image
- `POST /ai/generate-description` - Generate description
- `POST /ai/transcribe` - Transcribe audio

### Testing with Postman

A comprehensive Postman collection is included:
- File: `postman_collection.json`
- Import into Postman for complete API testing
- Includes examples for all endpoints

## Development Tools

### Health Check

Run the health check utility to verify environment configuration:
```bash
npm run health
```

### Code Quality

- ESLint for JavaScript/TypeScript linting
- Prettier for code formatting
- Husky for git hooks (if configured)

### Debugging

- Use console.log for debugging (remove before commit)
- Use browser developer tools for frontend debugging
- Use Node.js inspector for backend debugging

## Common Development Tasks

### Adding a New Feature

1. Create a new branch: `git checkout -b feature/your-feature`
2. Implement the feature following guidelines
3. Write tests for new functionality
4. Update documentation if needed
5. Run all tests to ensure nothing is broken
6. Create a pull request

### Fixing a Bug

1. Create a new branch: `git checkout -b fix/bug-description`
2. Implement the fix
3. Add tests to prevent regression
4. Update documentation if needed
5. Run all tests
6. Create a pull request

### Adding a New Language

1. Create a new translation file in `i18n/`
2. Add the language to the language switcher component
3. Update the i18n utility functions
4. Test the new language thoroughly