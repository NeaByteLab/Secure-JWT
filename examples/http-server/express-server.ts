import express, { type Request, type Response, type NextFunction } from 'express'
import SecureJWT from '../../src/index'

/**
 * Express application instance
 */
const app = express()

/**
 * Server port number
 */
const PORT = process.env.PORT || 3000

/**
 * JWT instance with encryption settings
 */
const jwt = new SecureJWT({
  secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
  expireIn: '1h',
  version: '1.0.0',
  algorithm: 'aes-256-gcm'
})

/**
 * Parse JSON request bodies
 */
app.use(express.json())

/**
 * Check if request has valid JWT token
 * @param req - Request object
 * @param res - Response object
 * @param next - Next function
 */
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      message: 'Please provide a valid JWT token in Authorization header'
    })
  }
  try {
    const isValid = jwt.verify(token)
    if (!isValid) {
      return res.status(403).json({ 
        error: 'Invalid token',
        message: 'Token is invalid or expired'
      })
    }
    const userData = jwt.decode(token)
    req.user = userData
    next()
  } catch (error) {
    return res.status(403).json({ 
      error: 'Token verification failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * Add user property to Express Request interface
 */
declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

/**
 * Public route handler
 * @param req - Request object
 * @param res - Response object
 */
app.get('/public', (req: Request, res: Response) => {
  res.json({
    message: 'This is a public route - no authentication required',
    timestamp: new Date().toISOString(),
    data: {
      server: 'Secure-JWT Express Server',
      version: '1.0.0',
      status: 'running'
    }
  })
})

/**
 * Protected route handler
 * @param req - Request object with user data
 * @param res - Response object
 */
app.get('/protected', authenticateToken, (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to protected route!',
    user: req.user,
    timestamp: new Date().toISOString(),
    data: {
      server: 'Secure-JWT Express Server',
      version: '1.0.0',
      status: 'authenticated'
    }
  })
})

/**
 * Login route handler
 * @param req - Request object with login data
 * @param res - Response object
 */
app.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({
      error: 'Missing credentials',
      message: 'Username and password are required'
    })
  }
  if (username === 'admin' && password === 'password') {
    const userData = {
      id: 1,
      username: 'admin',
      role: 'admin',
      permissions: ['read', 'write', 'admin'],
      loginTime: new Date().toISOString()
    }
    try {
      const token = jwt.sign(userData)
      res.json({
        message: 'Login successful',
        token,
        user: userData,
        expiresIn: '1 hour'
      })
    } catch (error) {
      res.status(500).json({
        error: 'Token generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } else {
    res.status(401).json({
      error: 'Invalid credentials',
      message: 'Username or password is incorrect'
    })
  }
})

/**
 * Health check route handler
 * @param req - Request object
 * @param res - Response object
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  })
})

/**
 * Handle server errors
 * @param err - Error object
 * @param req - Request object
 * @param res - Response object
 * @param next - Next function
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong'
  })
})

/**
 * Handle 404 errors
 * @param req - Request object
 * @param res - Response object
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  })
})

/**
 * Start the server
 */
app.listen(PORT, () => {
  console.log(`🚀 Secure-JWT Express Server running on port ${PORT}`)
  console.log(`📝 Available routes:`)
  console.log(`   GET  /public     - Public route (no auth)`)
  console.log(`   GET  /protected  - Protected route (requires auth)`)
  console.log(`   POST /login      - Login to get JWT token`)
  console.log(`   GET  /health     - Health check`)
  console.log(`\n🔐 Test with:`)
  console.log(`   curl http://localhost:${PORT}/public`)
  console.log(`   curl -X POST http://localhost:${PORT}/login -H "Content-Type: application/json" -d '{"username":"admin","password":"password"}'`)
  console.log(`   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:${PORT}/protected`)
})
