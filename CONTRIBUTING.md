# Contributing to CivicSense

Thank you for your interest in contributing to CivicSense! This document provides guidelines and information to help you contribute effectively to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

This project adheres to a Code of Conduct that we expect all contributors to follow. Please read and understand it before participating.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm
- MongoDB (v4.4 or higher)
- Docker (optional, for containerized development)

### Installation

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/civicsense.git
   ```
3. Install dependencies:
   ```bash
   cd civicsense
   npm install
   cd scripts
   npm install
   cd ..
   ```
4. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
5. Configure your environment variables in `.env.local`

### Running the Application

#### Development Mode
```bash
# Terminal 1: Start the backend
cd scripts
npm run start:dev

# Terminal 2: Start the frontend
npm run dev
```

#### Docker Mode (Recommended)
```bash
# Development with hot reloading
docker-compose -f docker-compose.dev.yml up --build

# Production mode
docker-compose up --build
```

## Project Structure

```
civicsense/
├── app/                 # Next.js frontend pages and layouts
├── components/          # React UI components
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── i18n/                # Internationalization files
├── public/              # Static assets
├── scripts/             # Backend Express.js server
├── styles/              # Global styles
├── utils/               # Frontend utility functions
├── uploads/             # Media uploads (gitignored)
└── db/                  # Database seed files
```

## Development Workflow

1. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Run tests to ensure nothing is broken
4. Commit your changes using conventional commit messages
5. Push to your fork
6. Create a pull request

## Coding Standards

### JavaScript/TypeScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Use functional components with hooks over class components
- Prefer arrow functions
- Use meaningful variable and function names

### React Components
- Use functional components with hooks
- Implement proper error boundaries
- Use TypeScript interfaces for props
- Follow component composition patterns
- Keep components small and focused

### Backend (Node.js/Express)
- Use async/await instead of callbacks
- Implement proper error handling
- Use environment variables for configuration
- Follow REST API best practices
- Validate all inputs

### Styling
- Use Tailwind CSS for styling
- Follow the existing color scheme
- Use responsive design principles
- Implement proper accessibility attributes

## Testing

### Running Tests

```bash
# Run all tests
cd scripts
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests
- Write unit tests for new functionality
- Use Jest for backend testing
- Test edge cases and error conditions
- Keep tests focused and isolated
- Use descriptive test names

## Documentation

### Code Documentation
- Document all public APIs
- Use JSDoc/TypeDoc for functions and classes
- Include examples for complex functionality
- Keep documentation up to date with code changes

### README Updates
- Update README.md when adding new features
- Include usage examples for new functionality
- Document any breaking changes

## Pull Request Process

1. Ensure your code follows the coding standards
2. Run all tests and ensure they pass
3. Update documentation if needed
4. Write a clear, descriptive pull request title
5. Include a detailed description of changes
6. Link any related issues
7. Request review from maintainers

### Pull Request Guidelines
- Keep PRs small and focused
- Include tests for new functionality
- Update documentation as needed
- Follow the conventional commit format
- Be responsive to feedback

## Reporting Issues

### Bug Reports
When reporting a bug, please include:
- A clear and descriptive title
- Steps to reproduce the issue
- Expected vs. actual behavior
- Screenshots if applicable
- Environment information (OS, browser, Node.js version)

### Feature Requests
For feature requests, please include:
- A clear and descriptive title
- Detailed explanation of the feature
- Use cases and benefits
- Potential implementation approaches

## Additional Resources

- [README.md](README.md) - Project overview and setup instructions
- [PERMANENT_FIXES.md](PERMANENT_FIXES.md) - Information about permanent fixes
- [QA_CHECKLIST.md](QA_CHECKLIST.md) - Quality assurance checklist
- [Postman Collection](postman_collection.json) - API testing collection

Thank you for contributing to CivicSense!