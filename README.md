# 🔐 Secure-JWT

![npm version](https://img.shields.io/npm/v/@neabyte/secure-jwt)
![node version](https://img.shields.io/node/v/@neabyte/secure-jwt)
![typescript version](https://img.shields.io/badge/typeScript-5.9.2-blue.svg)
![coverage](https://img.shields.io/badge/coverage-98.48%25-brightgreen)
![license](https://img.shields.io/npm/l/@neabyte/secure-jwt.svg)

A secure JWT library implementation with multiple encryption algorithms, zero dependencies, and built-in security for Node.js applications. Designed for high performance and reliability with TypeScript support.

## ✨ Features

- 🔒 **Multi algorithms** - AES-256-GCM, ChaCha20-Poly1305, and more
- ⚙️ **Algorithm selection** - Choose the best encryption for your use case
- 🔑 **Key derivation options** - Basic (fast) or PBKDF2 (secure) key generation
- 🛡️ **Tamper detection** - Authentication tags prevent modification
- ⏰ **Automatic expiration** - Built-in token lifecycle management
- 🔄 **Version compatibility** - Prevents downgrade attacks
- 🚀 **Built-in caching** - LRU cache with TTL for performance
- 📏 **Payload size limits** - 8KB maximum to prevent DoS
- 📦 **Multi-format support** - ESM, CommonJS, and TypeScript
- ⚡ **Zero dependencies** - No external crypto libraries

---

## 📦 Installation

```bash
npm install @neabyte/secure-jwt
```

## 🚀 Usage

### JavaScript (CommonJS & ESM)

```javascript
// CommonJS
const SecureJWT = require('@neabyte/secure-jwt').default

// ES Modules (ESM)
import SecureJWT from '@neabyte/secure-jwt'

// Usage (same for both)
const jwt = new SecureJWT({
  secret: 'your-secret-key-here',
  algorithm: 'aes-128-gcm',        // Optional: Default 'aes-256-gcm'
  expireIn: '1h',
  version: '1.0.0',
  cached: 1000
})

// Encode any data type
const data = { userId: 123, role: 'admin' }
const token = jwt.sign(data)
const isValid = jwt.verify(token)
const decoded = jwt.decode(token)

// Also works with strings, numbers, arrays, etc.
const stringToken = jwt.sign('Hello World!')
const numberToken = jwt.sign(42)
const arrayToken = jwt.sign([1, 2, 3])
```

### TypeScript

```typescript
import SecureJWT from '@neabyte/secure-jwt'

const jwt = new SecureJWT({
  secret: 'your-secret-key-here',
  expireIn: '1h',
  version: '1.0.0',
  cached: 1000
})

// Encode any data type
const data: { userId: number; role: string } = { userId: 123, role: 'admin' }
const token: string = jwt.sign(data)
const isValid: boolean = jwt.verify(token)
const decoded: unknown = jwt.decode(token)

// Also works with strings, numbers, arrays, etc.
const stringToken: string = jwt.sign('Hello World!')
const numberToken: string = jwt.sign(42)
const arrayToken: string = jwt.sign([1, 2, 3])
```

---

## ⚙️ Configuration

### Constructor Options

```javascript
const jwt = new SecureJWT({
  algorithm: 'aes-256-gcm',      // Optional: Default 'aes-256-gcm'
  keyDerivation: 'basic',        // Optional: Default 'basic'
  secret: 'your-secret-key',     // Required: 8-255 characters
  expireIn: '1h',                // Required: Time string
  version: '1.0.0',              // Optional: Default '1.0.0'
  cached: 1000                   // Optional: Cache size (default: 1000)
})
```

### 🔧 Algorithm Options

| Value | Description |
|-------|-------------|
| `aes-128-gcm` | Fast 128-bit encryption, 4% faster than AES256 |
| `aes-256-gcm` | Hardware accelerated, industry standard |
| `chacha20-poly1305` | Software optimized, 2-3x faster than AES |

### 🔑 Key Derivation Options

| Value | Description |
|-------|-------------|
| `basic` | Fast salt + secret concatenation |
| `pbkdf2` | Secure 50K iterations with SHA-256 |

### ⏰ Time Format

```javascript
// Supported formats (1K ms / 1s minimum)
'1ms'    // 1 second (JWT minimum)
'500ms'  // 1 second (JWT minimum)
'1s'     // 1 second  
'1m'     // 1 minute
'1h'     // 1 hour
'1d'     // 1 day
'1M'     // 1 month (30 days)
'1y'     // 1 year (365 days)
```

---

## 📝 API Reference

### Constructor

```javascript
new SecureJWT(options: JWTOptions)
```

**Options:**
- `algorithm?:` - Encryption algorithm (default: 'aes-256-gcm')
- `keyDerivation?:` - Key derivation method (default: 'basic')
- `secret: string` - Secret key (8-255 chars, required for security)
- `expireIn: string` - Token expiration time (required for security)
- `version?: string` - Token version (default: '1.0.0')
- `cached?: number` - Cache size for performance (default: 1000)

### Methods

#### `sign(data: unknown): string`
Creates an encrypted JWT token from any data type.

**Parameters:**
- `data: unknown` - The data to encrypt (objects, strings, numbers, arrays, etc.)

**Returns:**
- `string` - Encrypted JWT token

**Example:**
```javascript
const token = jwt.sign({ userId: 123, role: 'admin' })
const stringToken = jwt.sign('Hello World!')
const numberToken = jwt.sign(42)
```

**Throws:**
- `PayloadTooLargeError` - If payload exceeds 8KB limit
- `EncryptionError` - If encryption fails

---

#### `verify(token: string): boolean`
Validates token integrity and expiration.

**Parameters:**
- `token: string` - The JWT token to validate

**Returns:**
- `boolean` - `true` if valid, `false` if invalid or expired

**Example:**
```javascript
const isValid = jwt.verify(token)
if (isValid) {
  console.log('Token is valid')
} else {
  console.log('Token is invalid or expired')
}
```

---

#### `verifyStrict(token: string): void`
Validates token and throws specific errors for detailed handling.

**Parameters:**
- `token: string` - The JWT token to validate

**Returns:**
- `void` - Throws error if invalid

**Example:**
```javascript
try {
  jwt.verifyStrict(token)
  console.log('Token is valid')
} catch (error) {
  console.log('Token error:', error.message)
}
```

**Throws:**
- `TokenExpiredError` - If token has expired
- `TokenInvalidError` - If token format is invalid
- `VersionMismatchError` - If token version doesn't match
- `DecryptionError` - If decryption fails

---

#### `decode(token: string): unknown`
Extracts and decrypts data from token.

**Parameters:**
- `token: string` - The JWT token to decode

**Returns:**
- `unknown` - The original data that was encrypted

**Example:**
```javascript
try {
  const data = jwt.decode(token)
  console.log('Decoded data:', data)
} catch (error) {
  console.log('Decode error:', error.message)
}
```

**Throws:**
- `TokenExpiredError` - If token has expired
- `TokenInvalidError` - If token format is invalid
- `VersionMismatchError` - If token version doesn't match
- `DecryptionError` - If decryption fails

---

## ❌ Error Handling

### Basic Error Handling

```javascript
// Using verify() - returns boolean
const isValid = jwt.verify(token)
if (!isValid) {
  console.log('Token is invalid or expired')
}

// Using verifyStrict() - throws errors
try {
  jwt.verifyStrict(token)
  console.log('Token is valid')
} catch (error) {
  console.log('Token error:', error.message)
}

// Using decode() - throws errors
try {
  const data = jwt.decode(token)
  console.log('Decoded data:', data)
} catch (error) {
  console.log('Decode error:', error.message)
}
```

### Advanced Error Handling

```javascript
import { 
  SecureJWT, 
  TokenExpiredError, 
  ValidationError,
  EncryptionError,
  DecryptionError,
  PayloadTooLargeError,
  TokenInvalidError,
  VersionMismatchError
} from '@neabyte/secure-jwt'

const jwt = new SecureJWT({
  secret: 'your-secret-key',
  expireIn: '1h'
})

// Specific error handling
try {
  jwt.verifyStrict(token)
  console.log('Token is valid')
} catch (error) {
  if (error instanceof TokenExpiredError) {
    console.log('Token expired:', error.message)
    // Handle expired token - redirect to login
  } else if (error instanceof ValidationError) {
    console.log('Invalid token format:', error.message)
    // Handle invalid format - show error message
  } else if (error instanceof VersionMismatchError) {
    console.log('Token version mismatch:', error.message)
    // Handle version mismatch - force re-login
  } else if (error instanceof PayloadTooLargeError) {
    console.log('Payload too large:', error.message)
    // Handle oversized payload - reduce data size
  } else {
    console.log('Unknown error:', error.message)
  }
}

// Error properties
try {
  jwt.verifyStrict(token)
} catch (error) {
  console.log('Error type:', error.constructor.name)
  console.log('Error code:', error.code)               // e.g., 'TOKEN_EXPIRED'
  console.log('Status code:', error.statusCode)        // e.g., 401
  console.log('Error message:', error.message)         // Human-readable message
}
```

---

## 📚 Documentation

| Topic | Description |
|-------|-------------|
| 🏗️ [ARCHITECTURE](ARCHITECTURE.md) | Technical implementation details and diagrams |
| ⚡ [BENCHMARK](BENCHMARK.md) | Benchmark results and performance metrics |
| 📚 [EXAMPLES](examples/) | Integration examples and usage patterns |
| | • [HTTP Server](examples/http-server/README.md) - Server middleware and RBAC examples |
| | • [Salt & Hash](examples/salt-hash/README.md) - Key rotation pattern and crypto utilities |

---

## 📄 License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.