# Security Policy

## Supported Versions

Currently, we only support the latest version of CivicSense. If you're using an older version, we recommend upgrading to the latest version to ensure you have the latest security patches.

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest| :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within CivicSense, please send an email to [security@your-domain.com] instead of using the public issue tracker. All security vulnerabilities will be promptly addressed.

Please include the following information in your email:

- Description of the vulnerability
- Steps to reproduce the vulnerability
- Potential impact of the vulnerability
- Any possible mitigations you've identified

## Security Best Practices

When deploying CivicSense, we recommend following these security best practices:

1. **Environment Variables**: Never commit sensitive information like API keys, passwords, or secrets to the repository. Use environment variables and ensure your `.env` files are in `.gitignore`.

2. **Dependencies**: Regularly update dependencies to ensure you have the latest security patches. Use `npm audit` or `pnpm audit` to check for known vulnerabilities.

3. **Authentication**: Use strong, unique passwords for all accounts. If using the default admin accounts, change the passwords immediately after deployment.

4. **HTTPS**: Always use HTTPS in production environments.

5. **MongoDB Security**: 
   - Use strong authentication for your MongoDB instance
   - Enable access control and authentication
   - Regularly update MongoDB to the latest stable version
   - Use firewalls to restrict access to your database

6. **File Uploads**: 
   - Validate all file uploads
   - Restrict file types to only those necessary
   - Store uploaded files outside of the web root when possible
   - Implement proper file size limits

7. **Input Validation**: Always validate and sanitize user inputs to prevent injection attacks.

8. **JWT Security**: 
   - Use a strong, random JWT secret
   - Set appropriate expiration times for tokens
   - Store tokens securely (HttpOnly cookies are preferred)

## Additional Security Resources

- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Next.js Security Documentation](https://nextjs.org/docs/advanced-features/security-headers)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

If you have any questions about security or need assistance with a security-related issue, please contact our security team at [security@your-domain.com].