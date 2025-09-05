# Contributing

Thank you for your interest in contributing to Secure-JWT!

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 8+
- Git

### Setup
1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/NeaByteLab/Secure-JWT.git
   cd Secure-JWT
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

---

## 🧪 Development

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Check formatting
npm run format:check

# Format code
npm run format

# Type check
npm run type-check
```

### Building
```bash
# Build the project
npm run build

# Test the built package
npm pack
```

---

## 📝 Pull Request Process

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the coding standards

3. **Run tests** to ensure everything works:
   ```bash
   npm run test:coverage
   npm run lint
   npm run type-check
   ```

4. **Commit your changes** with a clear message:
   ```bash
   git commit -m "feat(auth): add new feature :sparkles:"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** to the main branch

---

## 📋 Coding Standards

### TypeScript
- No `any` types allowed
- Use strict TypeScript settings
- Use descriptive variable names
- Add JSDoc comments for public functions

### Code Style
- 2-space indentation
- Single quotes for strings
- No semicolons
- No trailing commas
- Use `const` over `let` when possible

### Error Handling
- Use specific error types
- Provide meaningful error messages
- Handle all error cases
- Use try-catch blocks appropriately

### Testing
- Write tests for new features
- Maintain 98%+ test coverage
- Test both success and error cases
- Use descriptive test names

## 🐛 Bug Reports

When reporting bugs, please include:
- Node.js version
- Operating system
- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages (if any)

## ✨ Feature Requests

For feature requests, please:
- Check existing issues first
- Describe the use case
- Explain why it would be useful
- Consider backward compatibility

---

## 📄 Commit Message Format

Use conventional commits with scope and emoji:
- `feat(scope):` - New features :sparkles:
- `fix(scope):` - Bug fixes :bug:
- `docs(scope):` - Documentation changes :memo:
- `style(scope):` - Code style changes :art:
- `refactor(scope):` - Code refactoring :recycle:
- `test(scope):` - Test changes :white_check_mark:
- `chore(scope):` - Build/tooling changes :wrench:

**Format:** `type(scope): description :emoji:`

Examples:
```
feat(auth): add token refresh functionality :sparkles:
fix(validation): resolve memory leak in token validation :bug:
docs(readme): update README with new examples :memo:
refactor(utils): improve error handling logic :recycle:
test(coverage): add tests for new features :white_check_mark:
chore(build): update build configuration :wrench:
```

## 🔍 Code Review

All submissions require review. Please:
- Respond to feedback promptly
- Make requested changes
- Keep PRs focused and small
- Update documentation as needed

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project.
