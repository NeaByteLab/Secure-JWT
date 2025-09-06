# 🌐 HTTP Server Examples

This directory contains HTTP server examples demonstrating how to use Secure-JWT in real-world scenarios.

## 📚 Examples

### 🚀 Simple Server (`simple-server.ts`)

A complete HTTP server implementation using only Node.js built-in modules - no external dependencies!

**Features:**
- **Login endpoint** - Authenticate users and issue JWT tokens
- **Protected endpoints** - Verify JWT tokens for access control
- **Role-based access** - Admin-only endpoints
- **Token verification** - Validate existing tokens
- **Health check** - Server status and JWT configuration
- **CORS support** - Cross-origin requests
- **Error handling** - Comprehensive error responses

**Endpoints:**
- `POST /login` - Login with username/password
- `GET /protected` - Access protected resource
- `GET /profile` - Get user profile
- `GET /admin` - Admin only access
- `POST /verify` - Verify token
- `GET /health` - Health check

---

## 🚀 Quick Start

1. **Start the server:**
   ```bash
   npx tsx examples/http-server/simple-server.ts
   ```

2. **Test the endpoints:**
   ```bash
   # Login
   curl -X POST http://localhost:3000/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'

   # Use the token from login response
   curl -H "Authorization: Bearer <your-token>" \
     http://localhost:3000/protected
   ```

## 👥 Test Users

| Username | Password | Role  |
|----------|----------|-------|
| admin    | admin123 | admin |
| user     | user123  | user  |
| john     | john123  | user  |

## 🔒 Security Features

- **Authenticated Encryption** - All tokens are encrypted with AES-256-GCM
- **Key Derivation** - Uses PBKDF2 for secure key generation
- **Version Control** - Prevents downgrade attacks
- **Input Validation** - Comprehensive validation at every layer
- **Error Handling** - Secure error responses without information leakage

## 🏭 Production Considerations

- **Change the secret key** - Use a strong, random secret in production
- **Use environment variables** - Store secrets securely
- **Add rate limiting** - Prevent brute force attacks
- **Use HTTPS** - Encrypt all communications
- **Add logging** - Monitor authentication events
- **Database integration** - Replace mock user database

## 📝 Example Responses

### ✅ Login Success
```json
{
  "message": "Login successful",
  "token": "eyJlbmNyeXB0ZWQiOiI...",
  "user": {
    "userId": 1,
    "username": "admin",
    "role": "admin"
  },
  "expiresIn": "1h"
}
```

### 🔐 Protected Resource Access
```json
{
  "message": "Access granted to protected resource",
  "user": {
    "userId": 1,
    "username": "admin",
    "role": "admin"
  },
  "data": {
    "users": [...],
    "stats": {...}
  }
}
```

### ❌ Error Response
```json
{
  "error": "Invalid or expired token",
  "details": null,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 💡 Why This Example?

This example demonstrates:
- **Real-world usage** - How JWT authentication works in practice
- **Zero dependencies** - Pure Node.js implementation
- **Security best practices** - Proper token handling and validation
- **Production patterns** - Error handling, CORS, health checks
- **Role-based access** - Different permission levels

Perfect for understanding how to integrate Secure-JWT into your applications! 🚀
