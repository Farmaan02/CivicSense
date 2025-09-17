# CivicCare Platform - Milestone 07 Complete

A comprehensive civic issue reporting platform that allows community members to report problems in their neighborhood, view them on an interactive map, and track their resolution through a modern web interface with AI-powered analysis, real-time notifications, and internationalization support.

## Features

### Core Platform
- **Landing Page**: Clean, accessible interface with prominent "Report an Issue" button
- **Report Modal**: Comprehensive form for submitting issues with photo/video upload, location detection, and contact options
- **Interactive Map**: Real-time visualization of reported issues with clustering and filtering
- **Reports Dashboard**: Browse, search, and filter community reports with detailed views
- **Navigation System**: Responsive navigation with mobile-friendly design

### Internationalization (NEW in Milestone 07)
- **Multi-language Support**: English and Hindi language support with seamless switching
- **Language Toggle**: Visible language switcher in navigation for easy access
- **Localized Content**: All user-facing text translated including forms, buttons, and notifications
- **Persistent Language Preference**: User language choice saved in localStorage
- **Fallback System**: Automatic fallback to English if translation keys are missing

### Media & Location
- **Enhanced Media Upload**: Support for images, videos, and audio files with validation
- **Camera Integration**: Direct camera capture for mobile devices
- **Location Services**: Automatic GPS detection with manual override capability
- **Address Resolution**: Convert coordinates to human-readable addresses

### AI Integration
- **Gemini AI Service**: Intelligent image analysis with mock fallbacks when API key is not configured
- **Auto-Classification**: Automatic issue type detection (infrastructure, safety, environment, public-services, other)
- **Severity Assessment**: AI-powered priority assignment (low, medium, high, urgent)
- **Smart Descriptions**: Auto-generated titles and descriptions based on uploaded media
- **Confidence Scoring**: AI confidence levels displayed to users (e.g., "AI confidence: 88%")
- **Audio Transcription**: Voice-to-text capabilities with language detection and translation
- **Seamless Fallbacks**: Mock responses when GEMINI_KEY is not available for development

### Notifications System
- **In-App Notifications**: Real-time toast notifications for report status changes
- **Email Queue**: Placeholder system for email notifications (ready for integration)
- **WhatsApp Integration**: Webhook skeleton for WhatsApp Business API
- **Notification Service**: Centralized notification management with queue processing
- **Event-Driven Architecture**: Automatic notifications on report creation and status updates

### Testing & Development
- **Jest Testing Suite**: Comprehensive API tests with Supertest integration
- **Postman Collection**: Complete API documentation and testing collection
- **Docker Support**: Full containerization with development and production configurations
- **MongoDB Integration**: Database setup with Docker Compose orchestration
- **Health Monitoring**: Service status endpoints and health checks

### Backend API
- **Express.js Server**: Robust API with enhanced error handling and validation
- **File Management**: Secure media upload with type validation and size limits
- **Report Management**: Full CRUD operations with filtering and search capabilities
- **AI Service Integration**: Gemini AI endpoints with intelligent fallback system
- **Webhook Support**: WhatsApp webhook endpoints for future bot integration
- **Health Monitoring**: Server status and diagnostics endpoints

## Quick Start

### Option 1: Docker (Recommended)

#### Production Environment
\`\`\`bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
\`\`\`

#### Development Environment with Hot Reloading
\`\`\`bash
# Start development environment
docker-compose -f docker-compose.dev.yml up --build

# Or run in background
docker-compose -f docker-compose.dev.yml up -d --build
\`\`\`

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- MongoDB: localhost:27017

### Option 2: Local Development

#### Frontend (Next.js)
\`\`\`bash
npm run dev
\`\`\`
The frontend will be available at http://localhost:3000

#### Backend (Express.js)
\`\`\`bash
cd scripts
npm install
npm run start:dev
\`\`\`
The backend API will be available at http://localhost:3001

#### Health Check
\`\`\`bash
npm run health
\`\`\`
Run the health check utility to verify environment configuration and system requirements.

#### Testing
\`\`\`bash
cd scripts
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
\`\`\`

## API Endpoints

### Core Endpoints
- `GET /health` - Health check with report count and server status
- `POST /reports` - Create new issue report with enhanced validation
- `GET /reports` - Get all reports with filtering options (?format=map&status=reported&severity=high&limit=50)
- `GET /reports/:trackingId` - Get specific report by tracking ID

### Admin Endpoints
- `GET /admin/reports` - Get all reports with admin privileges (requires authentication)
- `PATCH /reports/:id/assign` - Assign report to team (requires authentication)
- `PATCH /reports/:id/status` - Update report status (requires authentication)

### Media Endpoints
- `POST /media/upload` - Upload media files (images/videos/audio) with enhanced validation
- `GET /media/info/:filename` - Get media file information and metadata
- `DELETE /media/:filename` - Delete media file (cleanup endpoint)

### AI Endpoints
- `POST /ai/analyze-image` - Analyze uploaded images for issue classification and description generation
- `POST /ai/generate-description` - Generate detailed descriptions from media and optional text context
- `POST /ai/transcribe` - Transcribe audio files with language detection and translation
- `GET /ai/status` - Check AI service configuration and available features

### Notification Endpoints
- `GET /notifications/status` - Check notification queue status and service health

### Webhook Endpoints
- `POST /webhooks/whatsapp` - WhatsApp webhook for receiving messages
- `GET /webhooks/whatsapp` - WhatsApp webhook verification endpoint

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout with navigation and notifications
│   ├── map/               # Interactive map page
│   ├── reports/           # Reports dashboard page
│   ├── about/             # About page
│   └── globals.css        # Global styles with CivicCare theme
├── components/            # React components
│   ├── landing-hero.tsx   # Main landing page component with i18n
│   ├── report-button.tsx  # Report CTA button with translations
│   ├── report-modal/      # Enhanced report form components with AI integration
│   ├── media-upload/      # Media upload and camera components
│   ├── location/          # Location detection components
│   ├── map/               # Interactive map components
│   ├── navigation/        # App navigation components with language toggle
│   ├── notifications/     # Notification system components
│   ├── language-toggle.tsx # Language switcher component (NEW)
│   └── ui/                # Reusable UI components
├── i18n/                  # Internationalization (NEW)
│   ├── en.json           # English translations
│   └── hi.json           # Hindi translations
├── lib/                   # Utility libraries
│   └── i18n.ts           # i18n hook and translation utilities (NEW)
├── scripts/               # Backend server and utilities
│   ├── backend-server.js  # Enhanced Express.js API server with notifications
│   ├── routes/            # Modular API route handlers
│   │   ├── ai.js          # AI service endpoints
│   │   ├── auth.js        # Authentication routes
│   │   ├── teams.js       # Team management routes
│   │   ├── analytics.js   # Analytics endpoints
│   │   └── webhooks.js    # Webhook endpoints
│   ├── services/          # Service layer
│   │   ├── geminiService.ts # Gemini AI integration with mock fallbacks
│   │   └── notificationService.js # Notification management service
│   ├── tests/             # Test suite
│   │   ├── reports.spec.js # API endpoint tests
│   │   ├── notifications.spec.js # Notification service tests
│   │   └── setup.js       # Test configuration
│   ├── db/                # Database configuration
│   │   └── init-mongo.js  # MongoDB initialization script
│   ├── seed-database.js   # Database seeding utilities
│   ├── models/           # Enhanced Mongoose models with AI fields
│   └── package.json      # Backend dependencies with testing
├── hooks/                 # Custom React hooks
│   └── use-notifications.ts # Notification management hook
├── db/seed/              # Seed data
│   └── seed-reports.json # Sample reports with location data
├── utils/                # Frontend utilities
│   └── api.ts            # Enhanced API client with AI endpoints
├── uploads/              # Media file storage (created automatically)
├── Dockerfile.frontend   # Frontend Docker configuration
├── Dockerfile.backend    # Backend Docker configuration
├── docker-compose.yml    # Production Docker Compose
├── docker-compose.dev.yml # Development Docker Compose
├── postman_collection.json # Complete API testing collection
├── QA_CHECKLIST.md       # Quality assurance checklist (NEW)
└── .env.example          # Environment variables template
\`\`\`

## Color Scheme

The platform uses a light olive color scheme optimized for accessibility:
- **Primary**: #A3B18A (Light olive green)
- **Accent**: #588157 (Darker olive green)
- **Light**: #DAD7CD (Light neutral)
- **Dark**: #344E41 (Dark olive)

## Environment Variables

The following environment variables are supported:

### Required
- `NEXT_PUBLIC_API_URL` - Backend API URL (defaults to http://localhost:3001)
- `PORT` - Backend server port (defaults to 3001)
- `MONGODB_URI` - MongoDB connection string (for Docker: mongodb://admin:password123@mongo:27017/civiccare?authSource=admin)

### Optional (AI Features)
- `GEMINI_KEY` - Google Gemini API key for AI analysis features
  - **When provided**: Enables real Gemini AI analysis for image classification, description generation, and audio transcription
  - **When missing**: Uses intelligent mock responses for development and testing
  - **Setup**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Optional (Notifications)
- `WHATSAPP_API` - WhatsApp Business API credentials (TODO: Set up integration)
- `WHATSAPP_VERIFY_TOKEN` - WhatsApp webhook verification token (TODO: Set up integration)

### Development
- `NODE_ENV` - Environment mode (development/production)
- `NEXT_TELEMETRY_DISABLED` - Disable Next.js telemetry (set to 1)

## Docker Commands

### Production Deployment
\`\`\`bash
# Start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
\`\`\`

### Development
\`\`\`bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development environment
docker-compose -f docker-compose.dev.yml down
\`\`\`

### Individual Services
\`\`\`bash
# Build and run backend only
docker-compose up -d --build backend mongo

# Build and run frontend only
docker-compose up -d --build frontend

# Restart a specific service
docker-compose restart backend
\`\`\`

## Testing

### API Testing with Jest
\`\`\`bash
cd scripts
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
\`\`\`

### API Testing with Postman
1. Import `postman_collection.json` into Postman
2. Set the `base_url` variable to your API URL (default: http://localhost:3001)
3. Run the "Admin Login" request to get an authentication token
4. Use the collection to test all API endpoints

## Postman Collection Curl Examples

### Health Check
\`\`\`bash
curl -X GET "http://localhost:3001/health"
\`\`\`

### Create Report
\`\`\`bash
curl -X POST "http://localhost:3001/reports" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Pothole on Main Street",
    "contactInfo": "user@example.com",
    "anonymous": false,
    "useLocation": true,
    "location": {
      "lat": 40.7128,
      "lng": -74.0060,
      "address": "Main Street, New York, NY"
    }
  }'
\`\`\`

### Get All Reports
\`\`\`bash
curl -X GET "http://localhost:3001/reports?limit=10&status=reported"
\`\`\`

### Upload Media
\`\`\`bash
curl -X POST "http://localhost:3001/media/upload" \
  -F "media=@/path/to/image.jpg"
\`\`\`

### AI Image Analysis
\`\`\`bash
curl -X POST "http://localhost:3001/ai/analyze-image" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "http://localhost:3001/uploads/image.jpg"
  }'
\`\`\`

### Admin Login
\`\`\`bash
curl -X POST "http://localhost:3001/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@civiccare.com",
    "password": "admin123"
  }'
\`\`\`

### Update Report Status (Admin)
\`\`\`bash
curl -X PATCH "http://localhost:3001/reports/TRACK123/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "in-progress",
    "notes": "Work has begun on this issue"
  }'
\`\`\`

## Files with TODO Environment Variables

The following files contain placeholder environment variables that need to be configured:

### Backend Configuration
- **GEMINI_KEY**: Required for AI features (image analysis, transcription)
  - File: `scripts/services/geminiService.ts`
  - Setup: Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
  - Fallback: Mock responses when not configured

### WhatsApp Integration
- **WHATSAPP_API**: WhatsApp Business API credentials
  - Files: `scripts/services/notificationService.js`, `scripts/routes/webhooks.js`
  - Status: Placeholder for future implementation
  
- **WHATSAPP_VERIFY_TOKEN**: Webhook verification token
  - File: `scripts/routes/webhooks.js`
  - Status: Placeholder for future implementation

## GitHub Repository

This project is ready to be deployed to GitHub with the following files included:

- `.env.example` - Example environment variables file
- `LICENSE` - MIT License
- `CONTRIBUTING.md` - Contribution guidelines
- `CODE_OF_CONDUCT.md` - Code of conduct for contributors
- `DEVELOPMENT.md` - Detailed development guide
- `SECURITY.md` - Security policy and best practices
- `.github/ISSUE_TEMPLATE/` - Issue templates for bug reports and feature requests
- `.github/PULL_REQUEST_TEMPLATE.md` - Pull request template

### Preparing for GitHub

1. Initialize git repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: CivicCare Platform"
   ```

2. Create a new repository on GitHub

3. Push to GitHub:
   ```bash
   git remote add origin https://github.com/your-username/civicsense.git
   git branch -M main
   git push -u origin main
   ```

### Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Development Notes

### Frontend
- Responsive design with mobile-first approach
- Interactive map using Leaflet with custom markers
- Enhanced form validation and error handling
- Real-time location detection with fallback options
- Comprehensive media upload with preview capabilities
- AI-powered form suggestions with user override capabilities
- Real-time notification system with toast messages
- Multi-language support with persistent user preferences

### Backend
- Enhanced API with comprehensive error handling
- File upload validation with multiple format support
- Location data validation and processing
- Modular route structure for maintainability
- Health monitoring and diagnostics
- AI service integration with intelligent fallback system
- Notification service with email and WhatsApp queue management
- Webhook support for external integrations

### Data Management
- MongoDB integration with Docker Compose
- Location-aware report filtering with geospatial indexes
- Media file management with cleanup capabilities
- Report status and priority tracking
- AI analysis results storage and retrieval
- Notification queue management and processing

### Testing
- Comprehensive Jest test suite for API endpoints
- Supertest integration for HTTP testing
- Mock services for external dependencies
- Test coverage reporting
- Postman collection for manual API testing

## Quality Assurance

See `QA_CHECKLIST.md` for comprehensive testing checklist covering all milestones and acceptance criteria.

## Next Steps (Future Milestones)

- [ ] Real-time WebSocket notifications
- [ ] Email service integration (SendGrid/Nodemailer)
- [ ] WhatsApp Business API integration
- [ ] User authentication and role-based access control
- [ ] Advanced admin dashboard with analytics
- [ ] Mobile app development (React Native)
- [ ] Advanced AI features (sentiment analysis, priority prediction)
- [ ] Performance monitoring and logging
- [ ] Automated deployment pipelines
- [ ] Additional language support (Spanish, French, etc.)

## Milestone 07 Acceptance Criteria ✅

1. ✅ Language switch toggles UI strings (English ↔ Hindi)
2. ✅ README contains:
   - ✅ Environment variable list with setup instructions
   - ✅ docker-compose up command with development and production options
   - ✅ Postman collection path and curl examples
   - ✅ Which files contain TODO placeholders for API keys
3. ✅ QA checklist present and all items correspond to earlier milestones

## Previous Milestones

### Milestone 06 ✅
1. ✅ Postman collection present and importable with all API endpoints
2. ✅ Tests run: `npm test` executes Jest tests with passing results
3. ✅ docker-compose up --build starts services + mongo; frontend and backend accessible locally
4. ✅ Notifications: create report triggers in-app toast notification
5. ✅ Backend notification hooks for report.created and report.status_changed events
6. ✅ WhatsApp webhook skeleton endpoints for future bot integration
7. ✅ Environment variable placeholders documented in README
8. ✅ Docker configuration for both development and production environments

### Milestone 05 ✅
1. ✅ Admin authentication system with JWT tokens and role-based permissions
2. ✅ Team management system with CRUD operations and report assignment
3. ✅ Enhanced admin dashboard with report management capabilities
4. ✅ Analytics endpoints with comprehensive reporting metrics
5. ✅ Report assignment and status update workflows
6. ✅ Secure API endpoints with proper authentication middleware

### Milestone 04 ✅
1. ✅ Enhanced map interface with clustering and advanced filtering
2. ✅ Comprehensive reports dashboard with search and pagination
3. ✅ Report detail views with status tracking and update history
4. ✅ Improved navigation system with responsive design
5. ✅ Advanced API filtering and sorting capabilities
6. ✅ Enhanced error handling and user feedback systems

### Milestone 03 ✅
1. ✅ POST /ai/analyze-image returns mock object when GEMINI_KEY absent
2. ✅ Frontend displays AI-suggested issue type & description and allows user edit
3. ✅ Created report stores AI fields (issueType, severity, aiGeneratedDescription) in DB
4. ✅ AI confidence score displayed on detail cards with user-friendly copy
5. ✅ Seamless fallback system ensures functionality without API key
6. ✅ Enhanced database models support comprehensive AI analysis data
7. ✅ Auto-classification and description generation integrated into report flow

### Milestone 02 ✅
1. ✅ Enhanced media upload with camera integration and multiple file format support
2. ✅ Location detection with GPS and manual override capabilities
3. ✅ Interactive map view showing all reports with clustering and filtering
4. ✅ Enhanced backend APIs with comprehensive validation and error handling
5. ✅ Reports dashboard with search, filtering, and detailed views
6. ✅ Responsive navigation system across all pages
7. ✅ Improved API client with robust error handling and type safety

### Milestone 01 ✅
1. ✅ `npm run dev` (frontend) and `npm run start:dev` (backend) run successfully
2. ✅ Landing page shows prominent "Report an Issue" button
3. ✅ Clicking Report button opens modal with all required form fields
4. ✅ Form submission calls POST /reports and returns tracking ID
5. ✅ Reports are saved and visible via GET /reports (includes seed data)
