# 🔐 Salt & Hash Examples

This directory contains cryptographic examples demonstrating salt generation, hashing, and key derivation techniques used with Secure-JWT.

## 📚 Examples

### 🚀 Basic Operations (`basic.ts`)

Fundamental cryptographic operations including salt generation, hashing, and key derivation.

**Features:**
- **Salt generation** - Random salt creation with different lengths
- **Hashing algorithms** - SHA-256 and SHA-512 demonstrations
- **Key derivation** - Scrypt and PBKDF2 methods
- **Performance comparison** - Speed benchmarks between algorithms
- **Security best practices** - Salt length and password strength guidelines
- **Secure-JWT integration** - Using derived keys with JWT operations

**What you'll learn:**
- How to generate cryptographically secure salts
- Different hashing algorithms and their use cases
- Key derivation functions (KDF) for password-based encryption
- Performance characteristics of different algorithms
- Security best practices for salt and password management

### 🔄 Key Rotation (`key-rotation.ts`)

Advanced key rotation patterns for production JWT systems.

**Features:**
- **Key rotation manager** - Seamless key transitions
- **Backward compatibility** - Old tokens continue to work
- **Version control** - Prevents downgrade attacks
- **Multiple key support** - Handle multiple key versions
- **Production patterns** - Real-world key rotation strategies

**What you'll learn:**
- How to implement secure key rotation
- Maintaining backward compatibility during key changes
- Version control for cryptographic keys
- Production-ready key management patterns

## 🚀 Quick Start

### Run Basic Operations
```bash
npx tsx examples/salt-hash/basic.ts
```

### Run Key Rotation
```bash
npx tsx examples/salt-hash/key-rotation.ts
```

## 🔒 Security Features

- **Cryptographically secure** - Uses Node.js built-in crypto module
- **Multiple algorithms** - SHA-256, SHA-512, Scrypt, PBKDF2
- **Salt best practices** - Proper salt generation and storage
- **Key derivation** - Secure password-based key generation
- **Performance optimized** - Efficient algorithms for production use

## 📊 Algorithm Comparison

| Algorithm | Use Case | Security | Performance | Memory |
|-----------|----------|----------|-------------|---------|
| SHA-256 | Data hashing | High | Fast | Low |
| SHA-512 | Data hashing | Higher | Fast | Low |
| Scrypt | Key derivation | High | Slow | High |
| PBKDF2 | Key derivation | High | Medium | Low |

## 🛡️ Security Best Practices

### Salt Generation
- **Minimum length**: 16 bytes (128 bits)
- **Recommended length**: 32 bytes (256 bits)
- **Generate unique salt** for each password
- **Store salt alongside** the hash
- **Never reuse salts** across different passwords

### Password Strength
- **Minimum length**: 12 characters
- **Include complexity**: Uppercase, lowercase, numbers, symbols
- **Avoid common patterns**: Dictionary words, sequences
- **Use passphrases**: Multiple words with separators

### Key Derivation
- **Use appropriate iterations**: 100,000+ for PBKDF2
- **Choose right algorithm**: Scrypt for memory-hard operations
- **Store parameters**: Salt, iterations, algorithm version
- **Regular rotation**: Change keys periodically

## 💡 Example Outputs

### Salt Generation
```
Salt (hex): 5a579247b28f60daf837f95acf79e962e34df2ecc468557c0d49baa74c8f1a29
Salt length: 32 bytes
```

### Key Derivation
```
Password: my-secure-password
Salt: 5a579247b28f60daf837f95acf79e962e34df2ecc468557c0d49baa74c8f1a29
Scrypt key: c4972a34c76aa15f8753a67b8dbc4c0a584f02579da642661b82284e27eccfe4
```

### JWT Integration
```
JWT Secret (from scrypt): c4972a34c76aa15f...
Generated token: eyJlbmNyeXB0ZWQiOiJjNTdiZjExNDYxZTE3M2I5YWFkMjhiMj...
Token valid: true
Decoded data: { userId: 123, role: 'admin' }
```

## 🏭 Production Considerations

- **Environment variables** - Store secrets securely
- **Key management** - Use dedicated key management services
- **Monitoring** - Track key usage and rotation events
- **Backup strategies** - Secure key backup and recovery
- **Compliance** - Meet security standards (PCI DSS, SOC 2)
- **Regular rotation** - Implement automated key rotation

## 🔧 Integration with Secure-JWT

These examples show how to:

1. **Generate secure secrets** for JWT operations
2. **Derive keys** from passwords using industry standards
3. **Implement key rotation** without service interruption
4. **Maintain security** through proper salt and hash practices

Perfect for understanding the cryptographic foundations that power Secure-JWT! 🚀

