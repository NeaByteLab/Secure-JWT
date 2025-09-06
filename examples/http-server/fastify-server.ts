import Fastify, { type FastifyRequest, type FastifyReply, type FastifyInstance } from 'fastify'
import SecureJWT from '../../src/index'

/**
 * User data structure
 */
interface UserData {
  /** User ID */
  id: number
  /** Username */
  username: string
  /** User role */
  role: string
  /** User permissions */
  permissions: string[]
  /** Login time */
  loginTime: string
}

/**
 * Login request structure
 */
interface LoginRequest {
  /** Username */
  username: string
  /** Password */
  password: string
}

/**
 * Request with user data after authentication
 */
interface AuthenticatedRequest extends FastifyRequest {
  /** User data */
  user?: UserData
}

/**
 * Fastify instance with authentication decorator
 */
interface FastifyInstanceWithAuth extends FastifyInstance {
  /** Authentication middleware */
  authenticate: (request: AuthenticatedRequest, reply: FastifyReply) => Promise<void>
}

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
 * Fastify application instance
 */
const fastify = Fastify({
  logger: true
}) as unknown as FastifyInstanceWithAuth

/**
 * JWT authentication middleware
 * @param request - Request object
 * @param reply - Reply object
 */
fastify.decorate('authenticate', async (request: AuthenticatedRequest, reply: FastifyReply) => {
  const authHeader = request.headers.authorization
  const token = authHeader?.split(' ')[1]
  if (!token) {
    return reply.status(401).send({
      error: 'Access token required',
      message: 'Please provide a valid JWT token in Authorization header'
    })
  }
  try {
    const isValid = jwt.verify(token)
    if (!isValid) {
      return reply.status(403).send({
        error: 'Invalid token',
        message: 'Token is invalid or expired'
      })
    }
    const userData = jwt.decode(token) as UserData
    request.user = userData
  } catch (error) {
    return reply.status(403).send({
      error: 'Token verification failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * Public route handler
 * @returns Server information
 */
fastify.get('/public', async () => {
  return {
    message: 'This is a public route - no authentication required',
    timestamp: new Date().toISOString(),
    data: {
      server: 'Secure-JWT Fastify Server',
      version: '1.0.0',
      status: 'running'
    }
  }
})

/**
 * Protected route handler
 * @param request - Request object with user data
 * @param reply - Reply object
 * @returns User data and server information
 */
fastify.get('/protected', {
  preHandler: fastify.authenticate
}, async (request: AuthenticatedRequest, reply: FastifyReply) => {
  return {
    message: 'Welcome to protected route!',
    user: request.user,
    timestamp: new Date().toISOString(),
    data: {
      server: 'Secure-JWT Fastify Server',
      version: '1.0.0',
      status: 'authenticated'
    }
  }
})

/**
 * Login route handler
 * @param request - Request with login credentials
 * @param reply - Reply object
 * @returns JWT token and user data on success
 */
fastify.post<{ Body: LoginRequest }>('/login', {
  schema: {
    body: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
        username: { type: 'string' },
        password: { type: 'string' }
      }
    }
  }
}, async (request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
  const { username, password } = request.body
  if (username === 'admin' && password === 'password') {
    const userData: UserData = {
      id: 1,
      username: 'admin',
      role: 'admin',
      permissions: ['read', 'write', 'admin'],
      loginTime: new Date().toISOString()
    }
    try {
      const token = jwt.sign(userData)
      return {
        message: 'Login successful',
        token,
        user: userData,
        expiresIn: '1 hour'
      }
    } catch (error) {
      return reply.status(500).send({
        error: 'Token generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } else {
    return reply.status(401).send({
      error: 'Invalid credentials',
      message: 'Username or password is incorrect'
    })
  }
})

/**
 * Health check route handler
 * @param request - Request object
 * @param reply - Reply object
 * @returns Server health information
 */
fastify.get('/health', async () => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  }
})

/**
 * Error handler
 * @param error - Error object
 * @param request - Request object
 * @param reply - Reply object
 */
fastify.setErrorHandler((error, _, reply) => {
  fastify.log.error(error)
  reply.status(500).send({
    error: 'Internal server error',
    message: 'Something went wrong'
  })
})

/**
 * 404 handler
 * @param request - Request object
 * @param reply - Reply object
 */
fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
  reply.status(404).send({
    error: 'Route not found',
    message: `Cannot ${request.method} ${request.url}`
  })
})

/**
 * Start server
 */
const start = async () => {
  try {
    await fastify.listen({ port: Number(PORT), host: '0.0.0.0' })
    console.log(`🚀 Secure-JWT Fastify Server running on port ${PORT}`)
    console.log(`📝 Available routes:`)
    console.log(`   GET  /public     - Public route (no auth)`)
    console.log(`   GET  /protected  - Protected route (requires auth)`)
    console.log(`   POST /login      - Login to get JWT token`)
    console.log(`   GET  /health     - Health check`)
    console.log(`\n🔐 Test with:`)
    console.log(`   curl http://localhost:${PORT}/public`)
    console.log(`   curl -X POST http://localhost:${PORT}/login -H "Content-Type: application/json" -d '{"username":"admin","password":"password"}'`)
    console.log(`   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:${PORT}/protected`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

/**
 * Start the server
 * @returns Promise that resolves when server starts
 */
start() 
