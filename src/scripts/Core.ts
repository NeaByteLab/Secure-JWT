/**
 * Configuration values for generating random test data
 * @constant {Object} randomMultipliers
 */
export const randomMultipliers = {
  userId: 1000000,
  email: 10000,
  name: 1000,
  givenName: 100,
  familyName: 100,
  role: 3,
  permissions: 5,
  ipAddress: 255,
  yearMs: 365 * 24 * 60 * 60 * 1000
} as const

/**
 * String patterns used for generating test data
 * @constant {Object} randomStrings
 */
export const randomStrings = {
  picturePrefix: 'https://lh3.googleusercontent.com/a/ACg8oc',
  sessionPrefix: 'sess_',
  ipPrefix: '192.168.1.',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
} as const

/**
 * Display names for benchmark test operations
 * @constant {Object} testOperationNames
 */
export const testOperationNames = {
  signJwt: 'Sign JWT',
  verifyJwtCached: 'Verify JWT (cached)',
  verifyJwtFresh: 'Verify JWT (fresh)',
  decodeJwt: 'Decode JWT',
  fullRoundTrip: 'Full Round Trip'
} as const

/**
 * Creates random user data for testing purposes
 * @returns {Record<string, unknown>} Object containing user profile data
 */
export const generateUserData = (): Record<string, unknown> => ({
  userId: Math.floor(Math.random() * randomMultipliers.userId),
  email: `user${Math.floor(Math.random() * randomMultipliers.email)}@gmail.com`,
  name: `User ${Math.floor(Math.random() * randomMultipliers.name)}`,
  picture: `${randomStrings.picturePrefix}${Math.random().toString(36).substring(2, 15)}`,
  given_name: `First${Math.floor(Math.random() * randomMultipliers.givenName)}`,
  family_name: `Last${Math.floor(Math.random() * randomMultipliers.familyName)}`,
  locale: 'en',
  verified_email: true,
  role: ['user', 'admin', 'moderator'][Math.floor(Math.random() * randomMultipliers.role)],
  permissions: ['read:profile', 'write:profile', 'read:posts', 'write:posts', 'admin:users'].slice(
    0,
    Math.floor(Math.random() * randomMultipliers.permissions) + 1
  ),
  last_login: new Date().toISOString(),
  session_id: `${randomStrings.sessionPrefix}${Math.random().toString(36).substring(2, 15)}`,
  ip_address: `${randomStrings.ipPrefix}${Math.floor(Math.random() * randomMultipliers.ipAddress)}`,
  user_agent: randomStrings.userAgent,
  created_at: new Date(Date.now() - Math.random() * randomMultipliers.yearMs).toISOString()
})

/**
 * Cache sizes used for performance testing
 * @constant {number[]} cacheSizes
 */
export const cacheSizes = [1000, 2000, 5000, 10000]

/**
 * Collection of test payloads for benchmarking
 * @constant {Object[]} testPayloads
 */
export const testPayloads = Array.from({ length: 100 }, generateUserData)
console.log('🚀 JWT Library Performance Comparison')
console.log('='.repeat(40))
console.log('📊 Test Configuration:')
console.log(`   • Payloads: ${testPayloads.length} realistic user profiles`)
console.log(
  `   • Payload Size: ${Math.round(JSON.stringify(testPayloads[0]).length)} bytes average`
)
console.log(`   • Cache Sizes: ${cacheSizes.map(s => s.toLocaleString()).join(', ')} tokens`)
console.log('   • Iterations: 10,000 per test')
console.log('   • Libraries: SecureJWT vs jsonwebtoken')

/**
 * Executes a performance benchmark for a given function
 * @param {string} name - Display name of the benchmark test
 * @param {Function} fn - Function to benchmark
 * @param {number} [iterations=10000] - Number of iterations to run
 * @returns {{opsPerSec: number, avgTime: number}} Object with operations per second and average time
 */
export function benchmark(
  name: string,
  fn: () => void,
  iterations: number = 10000
): { opsPerSec: number; avgTime: number } {
  for (let i = 0; i < 100; i++) {
    fn()
  }
  const start = performance.now()
  for (let i = 0; i < iterations; i++) {
    fn()
  }
  const end = performance.now()
  const totalTime = end - start
  const opsPerSec = Math.round((iterations / totalTime) * 1000)
  const avgTime = (totalTime / iterations).toFixed(3)
  let rating: string
  if (opsPerSec > 1000000) {
    rating = '🚀'
  } else if (opsPerSec > 500000) {
    rating = '⚡'
  } else if (opsPerSec > 100000) {
    rating = '✅'
  } else {
    rating = '🐌'
  }
  console.log(`   ⏱️  ${name}: ${opsPerSec.toLocaleString()} ops/sec (${avgTime}ms avg) ${rating}`)
  return { opsPerSec, avgTime: parseFloat(avgTime) }
}
