# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2025-09-06

### Breaking Changes
- `secret` parameter is now required in constructor
- `JWTOptions.secret` changed from optional (`secret?: string`) to required (`secret: string`)

### Security
- Added cache size validation (max 10,000 tokens)
- Added time expiration limit (max 1 year)
- Made secret parameter required for enhanced security
- Enhanced secret key validation (8-255 characters)

### Added
- Cache size validation with configurable limits
- Time expiration validation with 1-year maximum
- Enhanced error messages for better debugging
- Comprehensive test coverage for new validations

### Changed
- Updated README documentation to reflect required secret parameter
- Fixed architecture diagram (Key Preparation vs Key Derivation)
- Simplified JSDoc comments across multiple files
- Enhanced error handling and validation coverage

### Fixed
- Test suite updated to handle required secret parameter
- Architecture diagram accuracy improved
- Documentation consistency across all files

---

## [1.1.1] - 2025-09-06

### Security
- Fixed memory dump vulnerability by implementing private fields
- Fixed cache poisoning vulnerability by making caches private
- Enhanced input validation to reject empty strings
- Converted all sensitive properties to private fields (#secret, #payloadCache, #verifyCache, #expireInMs, #version)

### Bug Fixes
- Added validation for empty string inputs
- Improved error handling and messages
- Enhanced code encapsulation and security

### Documentation
- Added TypeScript badge to README
- Fixed license badge URL with proper .svg extension
- Enhanced usage examples with version parameter
- Added examples for different data types (strings, numbers, arrays)
- Added Mermaid architecture diagrams for JWT encoding process
- Added security layers visualization
- Improved README structure and readability

### Internal
- Better encapsulation of sensitive data
- Improved security posture
- Enhanced error message coverage

---

## [1.1.0] - 2025-09-06

### Added
- Caching system with LRU eviction
- Cache configuration documentation
- `cached` option in constructor for cache size configuration
- Separate caches for verification results and payload data
- Access count tracking for eviction decisions
- TTL-based cache expiration

### Performance
- Speed improvements for `verify()` and `decode()` operations
- Cached operations reduce processing time from ~2ms to ~0.1ms
- Automatic cleanup of expired cache entries
- LRU eviction for memory management

### API
- New constructor option: `cached?: number` (default: 1000)
- Cache size parameter for memory usage control
- Backward compatible - existing code works without changes

### Documentation
- Updated README with caching documentation
- Performance benchmarks and configuration examples
- Updated usage examples with caching options

### Testing
- Cache unit tests with 41 test cases
- LRU eviction algorithm testing
- TTL expiration testing
- Performance and stress testing
- Edge case validation for cache operations
- 100% statement, line, and function coverage for Cache class
- Overall test coverage improved to 99.08%

---

## [1.0.0] - 2025-09-06

### Added
- Initial release of Secure-JWT library
- AES-256-GCM encryption for JWT tokens
- Tamper detection with authentication tags
- Automatic token expiration handling
- Version compatibility checking
- Payload size validation (8KB maximum)
- TypeScript support with type definitions
- ES Modules and CommonJS support
- Zero external dependencies
- Error handling with specific error types
- Time format parsing (ms, s, m, h, d, M, y)
- Secret key validation and strengthening
- Token integrity validation
- Base64 encoding/decoding validation
- JSON parsing validation
- Timestamp consistency checking

### Security
- AES-256-GCM encryption
- Random IV generation for each token
- Authentication tags prevent tampering
- Secret key salting for weak passwords
- Input sanitization
- Timing attack resistance
- Version downgrade protection

### API
- `sign(data: unknown): string` - Create encrypted JWT token
- `verify(token: string): boolean` - Validate token (returns boolean)
- `verifyStrict(token: string): void` - Validate token (throws errors)
- `decode(token: string): unknown` - Extract data from token
- Constructor options: `secret`, `expireIn`, `version`

### Error Types
- `ValidationError` - Input validation failures
- `EncryptionError` - Encryption operation failures
- `DecryptionError` - Decryption operation failures
- `TokenExpiredError` - Token has expired
- `VersionMismatchError` - Version incompatibility
- `PayloadTooLargeError` - Payload exceeds 8KB limit
- `TimeFormatError` - Invalid time format
- `SecretKeyError` - Invalid secret key
- `TokenInvalidError` - Invalid token format

### Documentation
- Installation instructions
- Multi-format usage (ESM, CommonJS, TypeScript)
- API reference documentation
- README with usage examples
- Error handling examples
- Security features overview

### Testing
- 241 passing tests
- 6 test suites
- 98.88% code coverage
- Unit tests for all utilities
- Integration tests for main functionality
- Error path testing
- Edge case validation
- Package installation testing

### CI/CD
- GitHub Actions workflow
- Automated testing on Node.js 22.16.0
- Code quality checks (ESLint, Prettier, TypeScript)
- Package building and testing
- Multi-format module testing
- Automated validation pipeline

---

## [Unreleased]

### Added
- Nothing yet

### Changed
- Nothing yet

### Deprecated
- Nothing yet

### Removed
- Nothing yet

### Fixed
- Nothing yet

### Security
- Nothing yet
