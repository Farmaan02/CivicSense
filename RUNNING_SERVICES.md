# Running Services

## Frontend Server
- **URL**: http://localhost:3000
- **Status**: ✅ Running
- **Technology**: Next.js 15.2.4
- **Features**: 
  - Responsive sidebar with mobile drawer functionality
  - Authentication system (Login/Signup pages)
  - Guest access option
  - All existing CivicPulse features

## Backend Server
- **URL**: http://localhost:3001
- **Status**: ✅ Running
- **Technology**: Node.js with Express
- **Features**:
  - REST API endpoints for reports, authentication, teams, analytics
  - MongoDB integration (with fallback to in-memory storage)
  - Media upload handling
  - AI service integration (mock mode)
  - Admin authentication and authorization
  - Notification services

## API Endpoints

### Authentication
- `POST /auth/login` - Admin login
- `POST /auth/guest` - Guest admin token
- `GET /auth/verify` - Verify admin token

### Reports
- `POST /reports` - Create new report
- `GET /reports` - Get all reports
- `GET /reports/:trackingId` - Get specific report
- `GET /admin/reports` - Get all reports (admin view)
- `PATCH /reports/:id/assign` - Assign report to team
- `PATCH /reports/:id/status` - Update report status

### Teams
- `GET /teams` - Get all teams
- `POST /teams` - Create new team
- `PATCH /teams/:id/assign` - Assign reports to team

### Media
- `POST /media/upload` - Upload media files

### AI Services
- `POST /ai/analyze-image` - AI image analysis
- `POST /ai/generate-description` - AI description generation
- `POST /ai/transcribe` - AI audio transcription
- `GET /ai/status` - AI service status

### Webhooks
- `POST /webhooks/whatsapp` - WhatsApp webhook
- `GET /webhooks/whatsapp` - WhatsApp webhook verification

### Utilities
- `GET /health` - Health check
- `GET /notifications/status` - Notification queue status

## Test Credentials

### Admin Login
- **Username**: admin
- **Password**: admin123

### Moderator Login
- **Username**: moderator
- **Password**: mod123

### Guest Access
- **Password**: guest123

## Environment
- **Node.js Version**: 18+
- **Frontend**: Next.js 15.2.4 with React 19
- **Backend**: Express.js with MongoDB
- **Database**: MongoDB Atlas (configured) with in-memory fallback

## Features Implemented

### Responsive Sidebar
- Desktop: Expanded by default with full navigation
- Mobile: Collapsed with hamburger menu trigger
- Drawer functionality with smooth animations
- Focus trap and keyboard navigation for accessibility

### Authentication System
- Login/Signup pages with email/password
- Shared AuthForm component for consistency
- Guest login functionality
- Token management with localStorage persistence
- Session restoration across page reloads

### Accessibility
- Keyboard navigation support
- Focus trap implementation
- ARIA attributes for screen readers
- Proper contrast ratios

## Verification Steps

1. Open browser and navigate to http://localhost:3000
2. Verify responsive sidebar behavior:
   - Desktop: Sidebar should be expanded with icons and labels
   - Mobile: Sidebar should be collapsed with hamburger menu
3. Test authentication flow:
   - Navigate to http://localhost:3000/login
   - Try "Continue as Guest" option
   - Test login with admin credentials
   - Test signup functionality
4. Verify backend API endpoints:
   - Visit http://localhost:3001/health to confirm backend is running
   - Test report creation via frontend
5. Test responsive behavior:
   - Resize browser window to verify responsive transitions
   - Test mobile drawer functionality