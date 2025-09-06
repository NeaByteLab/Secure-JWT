# 🌐 HTTP Server Examples

This directory contains HTTP server examples demonstrating how to use Secure-JWT in real-world scenarios.

## 📚 Examples

### 🚀 Express Server (`express-server.ts`)

A modern Express.js server with JWT middleware - perfect for quick prototyping and learning!

**Endpoints:**
- `GET /public` - Public route (no authentication)
- `GET /protected` - Protected route (requires JWT)
- `POST /login` - Login to get JWT token
- `GET /health` - Health check

### ⚡ Fastify Server (`fastify-server.ts`)

A high-performance Fastify server with JWT authentication - built for speed and efficiency!

**Endpoints:**
- `GET /public` - Public route (no authentication)
- `GET /protected` - Protected route (requires JWT)
- `POST /login` - Login to get JWT token
- `GET /health` - Health check

### 🔧 Simple Server (`simple-server.ts`)

A complete HTTP server implementation using only Node.js built-in modules - zero dependencies!

**Endpoints:**
- `POST /login` - Login with username/password
- `GET /protected` - Access protected resource
- `GET /profile` - Get user profile
- `GET /admin` - Admin only access
- `POST /verify` - Verify token
- `GET /health` - Health check

---

## 🚀 Quick Start

### Express Server
1. **Start the Express server:**
   ```bash
   npx tsx examples/http-server/express-server.ts
   ```

2. **Test the endpoints:**
   ```bash
   # Test public route
   curl http://localhost:3000/public

   # Login to get token
   curl -X POST http://localhost:3000/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"password"}'

   # Use the token from login response
   curl -H "Authorization: Bearer <your-token>" \
     http://localhost:3000/protected
   ```

### Fastify Server
1. **Start the Fastify server:**
   ```bash
   npx tsx examples/http-server/fastify-server.ts
   ```

2. **Test the endpoints:**
   ```bash
   # Test public route
   curl http://localhost:3000/public

   # Login to get token
   curl -X POST http://localhost:3000/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"password"}'

   # Use the token from login response
   curl -H "Authorization: Bearer <your-token>" \
     http://localhost:3000/protected
   ```

### Simple Server
1. **Start the Simple server:**
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

---

## 👥 Test Users

### Express Server
| Username | Password | Role  |
|----------|----------|-------|
| admin    | password | admin |

### Fastify Server
| Username | Password | Role  |
|----------|----------|-------|
| admin    | password | admin |

### Simple Server
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

---

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

---

## 💡 Why These Examples?

### Express Server
Perfect for:
- **Quick prototyping** - Fast development with Express.js
- **Learning JWT basics** - Simple, clean implementation
- **Modern web apps** - TypeScript + Express.js stack
- **Middleware patterns** - Reusable authentication middleware

### Fastify Server
Perfect for:
- **High performance** - Fast and efficient web framework
- **Production apps** - Built for speed and scalability
- **TypeScript projects** - Full type safety with interfaces
- **Schema validation** - Built-in request validation
- **Logging** - Comprehensive request/response logging

### Simple Server
Perfect for:
- **Zero dependencies** - Pure Node.js implementation
- **Production applications** - Complete, robust server
- **Role-based access** - Admin vs user permissions
- **Full-featured auth** - Token verification, CORS, health checks
- **Learning internals** - Understand HTTP server mechanics

All examples demonstrate:
- **Real-world usage** - How JWT authentication works in practice
- **Security best practices** - Proper token handling and validation
- **Production patterns** - Error handling, CORS, health checks
- **TypeScript support** - Full type safety and IntelliSense

Perfect for understanding how to integrate Secure-JWT into your applications! 🚀
