# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x - 2.x.x  | ✅          |
| < 1.0   | ❌                 |

## Security Features

### Encryption Algorithms
- **AES-256-GCM**: Industry-standard encryption with hardware acceleration
- **ChaCha20-Poly1305**: High-performance encryption, 2x faster than AES
- **Authentication Tags**: Prevent tampering and ensure data integrity
- **Random IVs**: Unique initialization vectors for each encryption

### Security Validations
- **Secret Key Length**: 8-255 characters minimum
- **Secret Key Characters**: Only printable ASCII characters (32-126) allowed
- **Expiration Limits**: Maximum 1 year token lifetime
- **Cache Limits**: Maximum 10,000 tokens to prevent memory exhaustion
- **Payload Size**: Maximum 8KB to prevent DoS attacks
- **Version Validation**: Prevents downgrade attacks
- **Key Derivation**: PBKDF2 with 50K iterations for secure key generation
- **Token Format**: Strict base64 validation with length and padding checks
- **IV Format**: Hexadecimal validation for initialization vectors
- **Auth Tag Format**: 32-character hex validation for authentication tags

### Tamper Protection
- **Authentication Tags**: Cryptographic verification of data integrity
- **Version-based AAD**: Additional authenticated data prevents version manipulation
- **Timestamp Validation**: Encrypted timestamps prevent expiration manipulation
- **Algorithm Detection**: Automatic algorithm detection prevents cross-algorithm attacks
- **Token Structure Validation**: Comprehensive validation of all token components
- **Timestamp Consistency**: Payload and token timestamps must match exactly
- **Data Type Validation**: Strict validation of all input data types

---

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 1. **DO NOT** create a public GitHub issue
Security vulnerabilities should be reported privately to prevent exploitation.

### 2. Email us directly
Send details to: **me@neabyte.com**

Include the following information:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested fix (if any)
- Your contact information

### 3. Response Timeline
- **Acknowledgment**: Within 7 days
- **Initial Assessment**: Within 14 days
- **Resolution**: Within 60 days (depending on complexity)

### 4. Responsible Disclosure
- We will work with you to verify and fix the vulnerability
- We will credit you in our security advisories (unless you prefer to remain anonymous)
- We will coordinate the public disclosure timeline with you

---

## Security Best Practices

### For Developers
- **Use Strong Secrets**: Generate cryptographically secure secret keys
- **Rotate Keys Regularly**: Change secret keys periodically
- **Validate Inputs**: Always validate token data before use
- **Monitor Expiration**: Implement proper token expiration handling
- **Use HTTPS**: Always transmit tokens over secure connections

### For Production
- **Environment Variables**: Store secrets in environment variables, not code
- **Key Management**: Use proper key management systems
- **Logging**: Log security events without exposing sensitive data
- **Monitoring**: Monitor for unusual token patterns
- **Updates**: Keep the library updated to the latest version

---

## Security Audit

This library has been tested against common attack vectors:

- ✅ **Token Manipulation**: Tamper detection prevents modification
- ✅ **Algorithm Downgrade**: Algorithm validation prevents downgrade attacks
- ✅ **Version Manipulation**: Version checking prevents version attacks
- ✅ **Timing Attacks**: Consistent response times prevent timing analysis
- ✅ **Cache Poisoning**: Proper cache validation prevents poisoning
- ✅ **Secret Key Attacks**: Strong encryption prevents weak key exploitation
- ✅ **Expiration Manipulation**: Encrypted timestamps prevent manipulation

---

## Security Updates

Security updates are released as:
- **Patch versions** (1.3.1, 1.3.2, etc.) for critical security fixes
- **Minor versions** (1.4.0, 1.5.0, etc.) for security improvements
- **Major versions** (2.0.0, 3.0.0, etc.) for breaking security changes

---

## Contact

For security-related questions or concerns:
- **Email**: me@neabyte.com
- **Response Time**: Within 7 days
- **Encryption**: PGP key available upon request
