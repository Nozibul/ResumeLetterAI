# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | ✅                 |
| < 1.0   | ❌                 |

## Reporting a Vulnerability

We take the security of ResumeLetterAI seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do Not Disclose Publicly
Please do not open a public GitHub issue for security vulnerabilities.

### 2. Contact Us Directly
Report vulnerabilities by emailing us at: **[nozibulislamspi@gmail.com](mailto:nozibulislamspi@gmail.com)**

Include the following information:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Any suggested fixes (if applicable)

### 3. Response Timeline
- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution**: We aim to release a patch within 30 days for confirmed vulnerabilities

## Security Best Practices

### Authentication & Authorization
- JWT tokens with secure expiration times
- Password hashing using industry-standard algorithms (bcrypt/argon2)
- Role-based access control (RBAC) for enterprise users
- Session management with secure cookies

### Data Protection
- Encryption of sensitive data at rest and in transit (TLS/SSL)
- Secure file upload validation and sanitization
- PII (Personally Identifiable Information) handling compliance
- Regular database backups with encryption

### API Security
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration for trusted domains only
- API key rotation policies for enterprise clients

### Infrastructure
- Environment variables for sensitive configuration
- Secure dependency management (regular updates)
- Protection against common vulnerabilities (XSS, CSRF, SQL Injection)
- Security headers implementation (CSP, HSTS, etc.)

### Monitoring & Logging
- Security event logging
- Audit trails for sensitive operations
- Anomaly detection for suspicious activities
- Regular security audits

## Compliance

ResumeLetterAI follows industry-standard security practices and aims to comply with:
- GDPR (General Data Protection Regulation)
- SOC 2 Type II principles
- OWASP Top 10 security guidelines

## Third-Party Dependencies

We regularly monitor and update dependencies to patch known vulnerabilities. We use automated tools like:
- Dependabot for dependency updates
- npm audit / yarn audit for vulnerability scanning
- Snyk for continuous security monitoring

## Security Updates

Security patches are released as soon as possible after a vulnerability is confirmed. Users will be notified through:
- GitHub Security Advisories
- Email notifications for enterprise clients
- Release notes and changelog

## Bug Bounty Program

We currently do not offer a formal bug bounty program, but we appreciate responsible disclosure and will acknowledge contributors in our release notes.

## Contact

For any security-related questions or concerns:
- **Email**: [nozibulislamspi@gmail.com](mailto:nozibulislamspi@gmail.com)
- **Response Time**: Within 48 hours

---

**Last Updated**: September 30, 2025