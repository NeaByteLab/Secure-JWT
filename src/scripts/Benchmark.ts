import jwt from 'jsonwebtoken'
import SecureJWT from '@neabyte/secure-jwt'
import { cacheSizes, testPayloads, testOperationNames, benchmark } from './Core'
import type { EncryptionAlgo } from '../interfaces/index'

/**
 * Main benchmark loop that tests different cache sizes
 * Tests JWT operations with various cache configurations
 */
for (const cacheSize of cacheSizes) {
  const algorithmList = ['aes-128-gcm', 'aes-256-gcm', 'chacha20-poly1305']
  for (const algorithm of algorithmList) {
    console.log(`\n🗄️  Algorithm: ${algorithm}`)
    console.log(`📈  Cache Size: ${cacheSize.toLocaleString()} tokens`)
    console.log('─'.repeat(30))
    const jwtSecure = new SecureJWT({
      secret: 'super-secret-key-for-benchmarking-12345',
      algorithm: algorithm as EncryptionAlgo,
      keyDerivation: 'basic',
      expireIn: '1h',
      version: '1.2.0',
      cached: cacheSize
    })
    const tokens: string[] = testPayloads.map(payload => jwtSecure.sign(payload))

    /**
     * Benchmark JWT signing operation with random payloads
     */
    benchmark(testOperationNames.signJwt, () => {
      const randomIndex = Math.floor(Math.random() * testPayloads.length)
      const payload = testPayloads[randomIndex]
      if (payload) {
        jwtSecure.sign(payload)
      }
    })

    /**
     * Benchmark JWT verification with cached tokens for cache hit performance
     */
    benchmark(testOperationNames.verifyJwtCached, () => {
      const randomIndex = Math.floor(Math.random() * tokens.length)
      const token = tokens[randomIndex]
      if (token) {
        jwtSecure.verify(token)
      }
    })

    /**
     * Benchmark JWT verification with fresh tokens for cache miss performance
     */
    benchmark(testOperationNames.verifyJwtFresh, () => {
      const randomIndex = Math.floor(Math.random() * testPayloads.length)
      const payload = testPayloads[randomIndex]
      if (payload) {
        const token = jwtSecure.sign(payload)
        jwtSecure.verify(token)
      }
    })

    /**
     * Benchmark JWT decoding operation without verification
     */
    benchmark(testOperationNames.decodeJwt, () => {
      const randomIndex = Math.floor(Math.random() * tokens.length)
      const token = tokens[randomIndex]
      if (token) {
        jwtSecure.decode(token)
      }
    })

    /**
     * Benchmark complete JWT workflow: sign, verify, and decode
     */
    benchmark(testOperationNames.fullRoundTrip, () => {
      const randomIndex = Math.floor(Math.random() * testPayloads.length)
      const payload = testPayloads[randomIndex]
      if (payload) {
        const token = jwtSecure.sign(payload)
        const isValid = jwtSecure.verify(token)
        if (isValid === true) {
          jwtSecure.decode(token)
        }
      }
    })
  }
}

/**
 * jsonwebtoken library performance comparison section
 * Tests the same operations using the standard jsonwebtoken library
 */
console.log('\n🔍 jsonwebtoken Performance Test')
console.log('='.repeat(40))
const secret = 'super-secret-key-for-benchmarking-12345'
const jsonwebtokenTokens: string[] = testPayloads.map(payload =>
  jwt.sign(payload, secret, { expiresIn: '1h' })
)

/**
 * Benchmark jsonwebtoken signing operation
 */
benchmark('jsonwebtoken Sign', () => {
  const randomIndex = Math.floor(Math.random() * testPayloads.length)
  const payload = testPayloads[randomIndex]
  if (payload) {
    jwt.sign(payload, secret, { expiresIn: '1h' })
  }
})

/**
 * Benchmark jsonwebtoken verification operation
 */
benchmark('jsonwebtoken Verify', () => {
  const randomIndex = Math.floor(Math.random() * jsonwebtokenTokens.length)
  const token = jsonwebtokenTokens[randomIndex]
  if (token) {
    jwt.verify(token, secret)
  }
})

/**
 * Benchmark jsonwebtoken decoding operation
 */
benchmark('jsonwebtoken Decode', () => {
  const randomIndex = Math.floor(Math.random() * jsonwebtokenTokens.length)
  const token = jsonwebtokenTokens[randomIndex]
  if (token) {
    jwt.decode(token)
  }
})
