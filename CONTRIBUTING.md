# Contributing to Claude Project Bundle

Thank you for your interest in contributing to Claude Project Bundle (CPB)! This document provides guidelines and information to help you contribute effectively.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/cpb.git
   cd cpb
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Process

Our development process emphasizes code quality and maintainability:

1. Write tests for new features using Node.js's built-in test runner
2. Ensure all tests pass before submitting changes
3. Follow the existing code style and formatting guidelines
4. Document new features or changes
5. Update the README.md if necessary

## Running Tests

Run the test suite:
```bash
npm test
```

## Code Style

We use ESLint and Prettier to maintain consistent code style. Before committing:

1. Format your code:
   ```bash
   npm run format
   ```
2. Check for linting issues:
   ```bash
   npm run lint
   ```

## Pull Request Process

1. Update the README.md with details of significant changes
2. Add or update tests as needed
3. Ensure all tests pass and the code is properly formatted
4. Update documentation if you're adding or changing features
5. Submit a pull request with a clear description of your changes

## Creating Issues

When creating issues, please:

1. Use a clear and descriptive title
2. Provide a detailed description of the issue or feature request
3. Include steps to reproduce for bugs
4. Add relevant labels

## Code of Conduct

This project follows the Contributor Covenant Code of Conduct. By participating, you are expected to uphold this code.

## Questions or Problems?

If you have questions or run into problems:

1. Check existing issues first
2. Create a new issue if needed
3. Join our discussions

## Commit Guidelines

Write clear, meaningful commit messages:

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and pull requests in commit messages

Example:
```
Add file type detection for Python projects

- Add recognition of common Python file extensions
- Include handling for requirements.txt and setup.py
- Update tests to cover Python project detection

Fixes #123
```

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.