# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within CivicSense, please send an email to [security@civicsense.org](mailto:security@civicsense.org) instead of using the public issue tracker.

All security vulnerabilities will be promptly addressed.

## Environment Variables and Secrets

### Required Environment Variables

The following environment variables are required for the application to function properly:

- `JWT_SECRET` - Secret key for JWT token generation (must be at least 32 characters)
- `MONGODB_URI` - MongoDB connection string

### Optional Environment Variables

The following environment variables are optional but recommended for production:

- `GEMINI_KEY` - Google Gemini API key for AI features
- `SENTRY_DSN` - Sentry DSN for error tracking
- `WHATSAPP_API` - WhatsApp Business API credentials
- `WHATSAPP_VERIFY_TOKEN` - WhatsApp webhook verification token

### Best Practices for Environment Variables

1. **Never commit secrets to version control**
   - All sensitive information should be stored in `.env.local` files
   - `.env.local` is included in `.gitignore` and will not be committed

2. **Use strong secrets**
   - JWT_SECRET should be at least 32 characters long
   - Use a password generator to create strong secrets

3. **Environment-specific configuration**
   - Use `.env.local` for local development
   - Use environment variables in production deployments
   - Never share `.env.local` files

4. **Regular rotation**
   - Rotate secrets regularly, especially JWT_SECRET
   - Update secrets immediately if they are compromised

### Example .env.local File

```env
# JWT secret for authentication (required, min 32 characters)
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters

# MongoDB connection string (required)
MONGODB_URI=mongodb://localhost:27017/civicsense

# Google Gemini API key (optional, for AI features)
GEMINI_KEY=your-gemini-api-key-here

# Sentry DSN for error tracking (optional)
SENTRY_DSN=your-sentry-dsn-here

# WhatsApp API credentials (optional, for notifications)
WHATSAPP_API=your-whatsapp-api-key-here
WHATSAPP_VERIFY_TOKEN=your-whatsapp-verify-token-here
```

## Data Protection

### User Data

- All user data is stored securely in MongoDB
- Passwords are hashed using bcrypt
- Personal information is only accessible to authorized users

### Report Data

- Community issue reports are stored in the database
- Location data is protected and only used for mapping purposes
- Media uploads are stored securely

## Authentication and Authorization

### JWT Tokens

- JWT tokens are used for user authentication
- Tokens are signed with the JWT_SECRET
- Tokens expire after a reasonable time period

### Role-Based Access Control

- Different user roles have different permissions
- Admin users have additional privileges
- Access to sensitive operations is restricted

## Network Security

### HTTPS

- All production deployments should use HTTPS
- SSL certificates should be properly configured

### CORS

- CORS policies are configured to prevent unauthorized cross-origin requests
- API endpoints are protected against CSRF attacks

## Dependencies

### Regular Updates

- Dependencies should be regularly updated to address security vulnerabilities
- Use `npm audit` to check for known vulnerabilities
- Subscribe to security advisories for key dependencies

### Dependency Verification

- Only use trusted, well-maintained dependencies
- Check the security track record of dependencies before adding them
- Pin dependency versions to prevent unexpected updates

## Logging and Monitoring

### Error Logging

- Errors are logged for debugging purposes
- Sensitive information is not logged
- Logs are rotated to prevent excessive disk usage

### Security Monitoring

- Suspicious activities are monitored
- Failed login attempts are tracked
- Rate limiting is implemented to prevent abuse

## Incident Response

### Detection

- Monitor logs for unusual activities
- Set up alerts for security events
- Regularly review access logs

### Response

- Contain the incident immediately
- Investigate the root cause
- Apply necessary patches or fixes
- Communicate with affected users if necessary

### Recovery

- Restore from clean backups if necessary
- Reset compromised credentials
- Implement additional security measures to prevent recurrence

## Compliance

### Data Privacy

- User data is handled in compliance with applicable privacy laws
- Users have the right to access, modify, or delete their data
- Data retention policies are implemented

### Accessibility

- The application follows WCAG 2.1 AA accessibility guidelines
- Regular accessibility audits are conducted
- Feedback from users with disabilities is welcomed