# Contributing to iCal Manager

Thank you for your interest in contributing to iCal Manager! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Where to Get Help](#where-to-get-help)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher (we recommend using the LTS version)
- **npm**: Version 9.0.0 or higher
- **Git**: For version control

Check your versions:

```bash
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0
```

### Fork and Clone

1. **Fork the repository** on GitHub by clicking the "Fork" button

2. **Clone your fork** locally:

```bash
git clone https://github.com/YOUR_USERNAME/iCal.git
cd iCal
```

3. **Add the upstream repository** as a remote:

```bash
git remote add upstream https://github.com/ddttom/iCal.git
```

### Installation

Install project dependencies:

```bash
npm install
```

This will install all required dependencies listed in `package.json`.

## Development Workflow

### Branch Naming Conventions

Create a new branch for your work following these conventions:

- `feature/description-of-feature` - For new features
- `bugfix/description-of-bug` - For bug fixes
- `docs/description-of-docs` - For documentation updates
- `refactor/description` - For code refactoring
- `test/description` - For test additions/improvements

Example:

```bash
git checkout -b feature/add-recurring-events
```

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

**Examples:**

```
feat(cli): add support for recurring events
fix(server): handle missing startDate in POST /api/events
docs(readme): update installation instructions
test(calendar): add tests for deleteEvent method
```

### Running the Application Locally

**CLI Tool:**

```bash
# List events
node index.js list -f calendar.ics

# Search events
node index.js search "Meeting" -f calendar.ics

# Add event (interactive)
node index.js add -f calendar.ics

# Delete event
node index.js delete <UID> -f calendar.ics
```

**Web Server:**

```bash
# Start the Express server
node server.js

# Or use the npm script
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests

We use Jest for testing. Run tests with:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

**Coverage Requirements:**
- Minimum 70% coverage across all metrics (branches, functions, lines, statements)
- New code should have accompanying tests

### Running the Linter

We use ESLint to maintain code quality:

```bash
# Check for linting errors
npm run lint

# Automatically fix linting errors
npm run lint:fix
```

**Important:** All code must pass linting before being merged.

## Code Style

### JavaScript Style Guidelines

- **Indentation**: 4 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Naming**:
  - camelCase for variables and functions
  - PascalCase for classes
  - UPPER_SNAKE_CASE for constants

### ESLint Configuration

Our `.eslintrc.json` enforces these rules. Key rules:

```json
{
  "indent": ["error", 4],
  "quotes": ["error", "single"],
  "semi": ["error", "always"],
  "no-unused-vars": ["warn"],
  "no-console": "off"
}
```

### Code Documentation

- Add JSDoc comments for all public functions and classes
- Include parameter types and return types
- Provide examples for complex functions

Example:

```javascript
/**
 * Searches for events matching a query string
 * @param {string} query - The search query
 * @returns {Array} Array of matching event objects
 */
function searchEvents(query) {
    // Implementation
}
```

## Testing Guidelines

### Writing Unit Tests

- Place tests in the `test/` directory
- Name test files with `.test.js` suffix
- Group related tests using `describe` blocks
- Use descriptive test names with `it` blocks

Example test structure:

```javascript
describe('CalendarManager', () => {
    describe('addEvent', () => {
        it('should add event to empty calendar', () => {
            // Test implementation
        });

        it('should generate unique UIDs', () => {
            // Test implementation
        });
    });
});
```

### Writing Integration Tests

- Test API endpoints using supertest
- Test complete workflows (create, read, update, delete)
- Mock file system operations when appropriate

### Test Coverage

- Aim for 100% coverage of new code
- Minimum 70% overall coverage required
- Cover both success and error paths
- Test edge cases and boundary conditions

## Pull Request Process

### Before Submitting

1. **Update your branch** with the latest changes from main:

```bash
git fetch upstream
git rebase upstream/main
```

2. **Run all checks** locally:

```bash
npm run lint        # Must pass
npm test            # Must pass
npm run test:coverage  # Check coverage
```

3. **Update documentation** if needed:
   - Update README.md for user-facing changes
   - Update CHANGELOG.md following Keep a Changelog format
   - Add JSDoc comments for new functions

### Submitting Your Pull Request

1. **Push your branch** to your fork:

```bash
git push origin feature/your-feature-name
```

2. **Open a Pull Request** on GitHub from your fork to the main repository

3. **Fill out the PR template** completely:
   - Describe your changes
   - Link related issues
   - Complete the testing checklist
   - Add screenshots if applicable

4. **Wait for review**:
   - Respond to feedback promptly
   - Make requested changes
   - Push updates to the same branch

### Review Process

- All PRs require at least one approval
- CI checks must pass (lint, tests, security)
- Code will be reviewed for:
  - Functionality and correctness
  - Test coverage and quality
  - Code style and documentation
  - Security and performance

### Merge Strategy

- We use squash merging for clean history
- Your PR title should follow Conventional Commits format
- All commits will be squashed into a single commit

## Where to Get Help

### Resources

- **GitHub Discussions**: Ask questions and discuss ideas
  - [https://github.com/ddttom/iCal/discussions](https://github.com/ddttom/iCal/discussions)

- **GitHub Issues**: Report bugs or request features
  - [https://github.com/ddttom/iCal/issues](https://github.com/ddttom/iCal/issues)

- **GitHub Wiki**: Read extended documentation
  - [https://github.com/ddttom/iCal/wiki](https://github.com/ddttom/iCal/wiki)

### Communication Guidelines

- Be respectful and professional
- Follow our [Code of Conduct](CODE_OF_CONDUCT.md)
- Provide clear and detailed information
- Be patient and constructive in feedback

## Development Tips

### Keeping Your Fork Updated

Regularly sync your fork with the upstream repository:

```bash
# Fetch latest changes
git fetch upstream

# Update your main branch
git checkout main
git merge upstream/main
git push origin main

# Rebase your feature branch
git checkout feature/your-feature
git rebase main
```

### Debugging

- Use `console.log` for debugging (remove before committing)
- Use Node.js debugger for complex issues
- Check server logs when debugging API endpoints
- Validate .ics files with online validators

### Common Issues

**Tests failing locally:**
- Ensure all dependencies are installed (`npm install`)
- Clear Jest cache: `npm test -- --clearCache`
- Check Node.js version compatibility

**ESLint errors:**
- Run `npm run lint:fix` to auto-fix formatting issues
- Manually fix remaining errors
- Check ESLint configuration in `.eslintrc.json`

**Coverage below threshold:**
- Run `npm run test:coverage` to see coverage report
- Add tests for uncovered lines
- Focus on critical paths first

## Recognition

Contributors will be recognized in several ways:

- Listed in GitHub contributors page
- Mentioned in release notes for significant contributions
- Credit in documentation for major features

Thank you for contributing to iCal Manager! Your efforts help make this project better for everyone.
