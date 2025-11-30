# Security Policy

## Supported Versions

The following versions of iCal Manager are currently being supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of iCal Manager seriously. If you discover a security vulnerability, please follow these steps:

### How to Report

1. **DO NOT** open a public GitHub issue for security vulnerabilities
2. Instead, use one of these methods:
   - Report via [GitHub Security Advisories](https://github.com/ddttom/iCal/security/advisories/new) (recommended)
   - Open a private issue and mark it as security-related
   - Contact the maintainers directly through GitHub

### What to Include

When reporting a vulnerability, please include:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Any suggested fixes (if applicable)
- Your contact information for follow-up

### Response Timeline

- **Initial Response**: Within 48 hours of report submission
- **Status Update**: Within 5 business days with assessment of the vulnerability
- **Fix Timeline**: Critical vulnerabilities will be addressed within 7 days; others based on severity

### Disclosure Policy

- We request that you do not publicly disclose the vulnerability until we have had time to address it
- Once a fix is released, we will credit you in the security advisory (unless you prefer to remain anonymous)
- We will coordinate with you on the disclosure timeline

## Security Update Policy

### Dependency Security

- We use Dependabot to monitor dependencies for known vulnerabilities
- Security updates for dependencies are prioritized and applied promptly
- Regular `npm audit` checks are performed as part of our CI/CD pipeline

### Code Security

- All code changes go through review before merging
- GitHub CodeQL security scanning runs on all pushes and pull requests
- We follow secure coding practices and OWASP guidelines

### Reporting Security Issues in Dependencies

If you discover a security issue in one of our dependencies:

1. Check if it's already reported on the dependency's repository
2. If not, report it to the dependency maintainers
3. Notify us so we can track and update when a fix is available

## Security Best Practices for Users

When using iCal Manager:

- Keep your installation up to date with the latest version
- Review and validate any .ics files from untrusted sources before processing
- Use environment variables for sensitive configuration (never commit secrets)
- Run the application with minimal necessary privileges
- Regularly update Node.js to the latest LTS version

## Known Security Considerations

- **File System Access**: The application reads and writes .ics files - ensure proper file permissions
- **Input Validation**: Always validate .ics file content from untrusted sources
- **Web Server**: The Express server should be run behind a reverse proxy in production
- **CORS**: Configure appropriate CORS settings for your use case

## Contact

For security-related questions or concerns, please use the reporting methods above or contact the project maintainers through GitHub.

Thank you for helping keep iCal Manager and its users safe!
