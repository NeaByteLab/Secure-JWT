/**
 * Simple HTTP Server Example
 * Shows JWT authentication with Node.js built-in HTTP server
 * No external dependencies - pure Node.js implementation
 */

import { parse } from 'node:url'
import { createServer, IncomingMessage, ServerResponse } from 'node:http'
import SecureJWT from '../../src/index'

/**
 * Initialize JWT with configuration
 */
const jwt = new SecureJWT({
  secret: 'your-secret-key-here-change-in-production',
  expireIn: '1h',
  algorithm: 'aes-256-gcm',
  keyDerivation: 'pbkdf2',
  version: '1.0.0',
  cached: 1000
})

/**
 * Mock user database (in real app, use a real database)
 */
const users = new Map([
  ['admin', { password: 'admin123', role: 'admin', userId: 1 }],
  ['user', { password: 'user123', role: 'user', userId: 2 }],
  ['john', { password: 'john123', role: 'user', userId: 3 }]
])

/**
 * Mock protected data
 */
const protectedData = {
  users: [
    { id: 1, name: 'Admin User', role: 'admin' },
    { id: 2, name: 'Regular User', role: 'user' },
    { id: 3, name: 'John Doe', role: 'user' }
  ],
  stats: {
    totalUsers: 3,
    activeUsers: 2,
    lastLogin: new Date().toISOString()
  }
}

/**
 * Parses JSON data from HTTP request body
 * @param req - The incoming HTTP request
 * @returns Promise that resolves to the parsed JSON data
 * @throws Error when JSON parsing fails
 */
async function parseJSON(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(new Error('Invalid JSON'))
      }
    })
  })
}

/**
 * Sends JSON response to client
 * @param res - The server response object
 * @param statusCode - HTTP status code to send
 * @param data - Data to send as JSON
 */
function sendJSON(res: ServerResponse, statusCode: number, data: any): void {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data, null, 2))
}

/**
 * Sends error response to client
 * @param res - The server response object
 * @param statusCode - HTTP status code to send
 * @param message - Error message to include
 * @param details - Optional additional error details
 */
function sendError(res: ServerResponse, statusCode: number, message: string, details?: any): void {
  sendJSON(res, statusCode, {
    error: message,
    details,
    timestamp: new Date().toISOString()
  })
}

/**
 * Extracts JWT token from Authorization header
 * @param req - The incoming HTTP request
 * @returns The JWT token if found, null otherwise
 */
function extractToken(req: IncomingMessage): string | null {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

/**
 * Authenticates user with username and password
 * @param username - The username to authenticate
 * @param password - The password to verify
 * @returns User data if authentication succeeds, null if credentials are invalid
 */
function authenticateUser(username: string, password: string): any | null {
  const user = users.get(username)
  if (!user || user.password !== password) {
    return null
  }
  return {
    userId: user.userId,
    username,
    role: user.role
  }
}

/**
 * Verifies JWT token and extracts user data
 * @param token - The JWT token to verify
 * @returns User data if token is valid, null if token is invalid or expired
 */
function verifyToken(token: string): any | null {
  try {
    if (!jwt.verify(token)) {
      return null
    }
    return jwt.decode(token)
  } catch (error) {
    return null
  }
}

/**
 * Handles user login requests
 * @param req - The incoming HTTP request
 * @param res - The server response object
 */
async function handleLogin(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const body = await parseJSON(req)
    const { username, password } = body
    if (!username || !password) {
      sendError(res, 400, 'Username and password are required')
      return
    }
    const user = authenticateUser(username, password)
    if (!user) {
      sendError(res, 401, 'Invalid credentials')
      return
    }
    const token = jwt.sign(user)
    sendJSON(res, 200, {
      message: 'Login successful',
      token,
      user: {
        userId: user.userId,
        username: user.username,
        role: user.role
      },
      expiresIn: '1h'
    })
  } catch (error) {
    sendError(res, 400, 'Invalid request body')
  }
}

/**
 * Handles requests to protected resources
 * @param req - The incoming HTTP request
 * @param res - The server response object
 */
async function handleProtected(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const token = extractToken(req)
  if (!token) {
    sendError(res, 401, 'No token provided', { 
      hint: 'Include Authorization header: Bearer <token>' 
    })
    return
  }
  const user = verifyToken(token)
  if (!user) {
    sendError(res, 401, 'Invalid or expired token')
    return
  }
  sendJSON(res, 200, {
    message: 'Access granted to protected resource',
    user,
    data: protectedData
  })
}

/**
 * Handles user profile requests
 * @param req - The incoming HTTP request
 * @param res - The server response object
 */
async function handleProfile(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const token = extractToken(req)
  if (!token) {
    sendError(res, 401, 'No token provided')
    return
  }
  const user = verifyToken(token)
  if (!user) {
    sendError(res, 401, 'Invalid or expired token')
    return
  }
  sendJSON(res, 200, {
    message: 'User profile retrieved successfully',
    profile: {
      userId: user.userId,
      username: user.username,
      role: user.role,
      loginTime: new Date().toISOString()
    }
  })
}

/**
 * Handles admin-only requests
 * @param req - The incoming HTTP request
 * @param res - The server response object
 */
async function handleAdmin(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const token = extractToken(req)
  if (!token) {
    sendError(res, 401, 'No token provided')
    return
  }
  const user = verifyToken(token)
  if (!user) {
    sendError(res, 401, 'Invalid or expired token')
    return
  }
  if (user.role !== 'admin') {
    sendError(res, 403, 'Admin access required', {
      currentRole: user.role,
      requiredRole: 'admin'
    })
    return
  }
  sendJSON(res, 200, {
    message: 'Admin access granted',
    adminData: {
      systemStats: protectedData.stats,
      allUsers: protectedData.users,
      serverTime: new Date().toISOString()
    }
  })
}

/**
 * Handles token verification requests
 * @param req - The incoming HTTP request
 * @param res - The server response object
 */
async function handleVerify(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const body = await parseJSON(req)
    const { token } = body
    if (!token) {
      sendError(res, 400, 'Token is required')
      return
    }
    const user = verifyToken(token)
    if (!user) {
      sendError(res, 401, 'Invalid or expired token')
      return
    }
    sendJSON(res, 200, {
      message: 'Token is valid',
      user,
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    })
  } catch (error) {
    sendError(res, 400, 'Invalid request body')
  }
}

/**
 * Handles health check requests
 * @param req - The incoming HTTP request
 * @param res - The server response object
 */
async function handleHealth(req: IncomingMessage, res: ServerResponse): Promise<void> {
  sendJSON(res, 200, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    jwt: {
      algorithm: 'aes-256-gcm',
      keyDerivation: 'pbkdf2',
      version: '1.0.0'
    }
  })
}

/**
 * Main HTTP request handler that routes requests to appropriate endpoints
 * @param req - The incoming HTTP request
 * @param res - The server response object
 */
async function requestHandler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = parse(req.url || '', true)
  const path = url.pathname
  const method = req.method
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }
  try {
    if (path === '/login' && method === 'POST') {
      await handleLogin(req, res)
    } else if (path === '/protected' && method === 'GET') {
      await handleProtected(req, res)
    } else if (path === '/profile' && method === 'GET') {
      await handleProfile(req, res)
    } else if (path === '/admin' && method === 'GET') {
      await handleAdmin(req, res)
    } else if (path === '/verify' && method === 'POST') {
      await handleVerify(req, res)
    } else if (path === '/health' && method === 'GET') {
      await handleHealth(req, res)
    } else {
      sendError(res, 404, 'Endpoint not found', {
        availableEndpoints: [
          'POST /login - Login with username/password',
          'GET /protected - Access protected resource',
          'GET /profile - Get user profile',
          'GET /admin - Admin only access',
          'POST /verify - Verify token',
          'GET /health - Health check'
        ]
      })
    }
  } catch (error) {
    console.error('Request error:', error)
    sendError(res, 500, 'Internal server error')
  }
}

/**
 * Starts the HTTP server on the specified port
 * @param port - The port number to listen on (default: 3000)
 */
function startServer(port: number = 3000): void {
  const server = createServer(requestHandler)
  server.listen(port, () => {
    console.log(`🚀 HTTP Server running on http://localhost:${port}`)
    console.log('\n📋 Available endpoints:')
    console.log('  POST /login - Login with username/password')
    console.log('  GET  /protected - Access protected resource')
    console.log('  GET  /profile - Get user profile')
    console.log('  GET  /admin - Admin only access')
    console.log('  POST /verify - Verify token')
    console.log('  GET  /health - Health check')
    console.log('\n👤 Test users:')
    console.log('  admin/admin123 (admin role)')
    console.log('  user/user123 (user role)')
    console.log('  john/john123 (user role)')
    console.log('\n💡 Example usage:')
    console.log('  curl -X POST http://localhost:3000/login \\')
    console.log('    -H "Content-Type: application/json" \\')
    console.log('    -d \'{"username":"admin","password":"admin123"}\'')
  })
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...')
    server.close(() => {
      console.log('✅ Server closed')
      process.exit(0)
    })
  })
}

/**
 * Starts the HTTP server on port 3000
 */
startServer()