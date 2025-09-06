# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.4.2] - 2025-09-06

### Added
- **Integration examples**: HTTP server and cryptographic utility examples
- **HTTP server example**: Complete Node.js server with JWT authentication and RBAC
- **Salt & hash examples**: Key rotation patterns and cryptographic utilities
- **Documentation table**: Organized documentation section with examples

### Enhanced
- **README description**: More detailed and technical description
- **Configuration tables**: Simplified algorithm and key derivation option descriptions
- **Documentation structure**: Better organized with hyperlinked documentation table
- **Examples documentation**: Detailed README files for each example category

### Technical
- **Zero-dependency examples**: All examples use only Node.js built-in modules
- **Educational content**: Learning-focused examples with security best practices

---

## [1.4.1] - 2025-09-06

### Added
- **Error class exports**: Export custom error classes for advanced error handling
- **Interface type exports**: Export TypeScript interfaces for type safety and development
- **Advanced error handling documentation**: Examples with import statements and instanceof checks

### Changed
- **Type safety**: Exported interfaces enable better TypeScript development experience

---

## [1.4.0] - 2025-09-06

### Added
- **Key derivation options**: Choose between `basic` (fast) and `pbkdf2` (secure) key generation methods
- **PBKDF2 key derivation**: 50K iterations with SHA-256 for enterprise-grade security
- **Basic key derivation**: Fast salt + secret concatenation for high-performance applications
- **Key derivation validation**: Validation for key derivation method selection
- **Key derivation documentation**: Updated README with Key Derivation Options table
- **Architecture documentation**: Separate ARCHITECTURE.md with detailed diagrams
- **External references**: Links to ARCHITECTURE.md and BENCHMARK.md

### Enhanced
- **Security flexibility**: Configurable key derivation methods based on use case requirements
- **Performance options**: Basic key derivation for speed, PBKDF2 for maximum security
- **API consistency**: New `keyDerivation` option follows existing constructor pattern
- **Documentation**: Enhanced README with clear key derivation guidance and examples
- **Test coverage**: Improved from 98.28% to 98.32% with key derivation tests
- **Documentation structure**: Cleaner README with better navigation and external references

### Technical
- **Algorithm abstraction**: Extended `Algorithms` class with key derivation methods
- **Type safety**: Added `KeyDerivationAlgo` type for compile-time validation
- **Error handling**: Error messages for invalid key derivation methods
- **Backward compatibility**: Default `basic` key derivation maintains existing behavior

---

## [1.3.0] - 2025-09-06

### Added
- **Dual encryption algorithms**: AES-256-GCM and ChaCha20-Poly1305 support
- **Algorithm selection**: Choose between AES-256-GCM (default) or ChaCha20-Poly1305
- **Factory pattern**: Scalable algorithm management system
- **Algorithm unit tests**: Unit test coverage for both algorithms
- **Performance comparison**: ChaCha20-Poly1305 is 2-3x faster for verification
- **Algorithm documentation**: Updated README with algorithm selection guide

### Changed
- **SecureJWT constructor**: Added optional `algorithm` parameter
- **Encryption abstraction**: Refactored to use algorithm factory pattern
- **README updates**: Enhanced with dual algorithm documentation and performance metrics
- **Coverage badge**: Updated to 98.28%

### Technical
- **Algorithm interface**: Created `IEncryptionAlgo` interface for algorithm abstraction
- **Factory implementation**: `Algorithms` class for algorithm instance management
- **TypeScript support**: Added path aliases for algorithm modules
- **Jest configuration**: Updated to support new algorithm test files

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
