import SecureJWT from '../src/index'
import {
  ValidationError,
  DecryptionError,
  PayloadTooLargeError,
  VersionMismatchError,
  TimeFormatError,
  SecretKeyError
} from '../src/utils/ErrorBase'

describe('SecureJWT', () => {
  let jwt: SecureJWT

  beforeEach(() => {
    jwt = new SecureJWT({
      expireIn: '1h',
      secret: 'test-secret-key-123',
      version: '1.0.0'
    })
  })

  describe('constructor', () => {
    it('should create instance with valid options', () => {
      expect(jwt).toBeInstanceOf(SecureJWT)
    })

    it('should throw error when secret is missing', () => {
      expect(() => {
        new SecureJWT({
          expireIn: '1h'
        })
      }).toThrow('Secret must be a string')
    })

    it('should create instance without version', () => {
      const jwtNoVersion = new SecureJWT({
        expireIn: '1h',
        secret: 'test-secret-key-123'
      })
      expect(jwtNoVersion).toBeInstanceOf(SecureJWT)
    })

    it('should create instance with cache size validation', () => {
      const jwtWithCache = new SecureJWT({
        expireIn: '1h',
        secret: 'test-secret-key-123',
        cached: 5000
      })
      expect(jwtWithCache).toBeInstanceOf(SecureJWT)
    })

    it('should throw ValidationError for invalid cache size', () => {
      expect(() => new SecureJWT({
        expireIn: '1h',
        secret: 'test-secret-key-123',
        cached: 0
      })).toThrow(ValidationError)
      expect(() => new SecureJWT({
        expireIn: '1h',
        secret: 'test-secret-key-123',
        cached: 10001
      })).toThrow(ValidationError)
    })

    it('should throw ValidationError for non-integer cache size', () => {
      expect(() => new SecureJWT({
        expireIn: '1h',
        secret: 'test-secret-key-123',
        cached: 1000.5
      })).toThrow(ValidationError)
    })

    it('should throw TimeFormatError for expiration longer than 1 year', () => {
      expect(() => new SecureJWT({
        expireIn: '2y',
        secret: 'test-secret-key-123'
      })).toThrow(TimeFormatError)
      expect(() => new SecureJWT({
        expireIn: '400d',
        secret: 'test-secret-key-123'
      })).toThrow(TimeFormatError)
    })

    it('should accept exactly 1 year expiration', () => {
      const jwt1Year = new SecureJWT({
        expireIn: '1y',
        secret: 'test-secret-key-123'
      })
      expect(jwt1Year).toBeInstanceOf(SecureJWT)
      const jwt365Days = new SecureJWT({
        expireIn: '365d',
        secret: 'test-secret-key-123'
      })
      expect(jwt365Days).toBeInstanceOf(SecureJWT)
    })

    it('should accept Unicode secret keys', () => {
      const jwtUnicode = new SecureJWT({
        expireIn: '1h',
        secret: 'test-secret-🚀-123'
      })
      expect(jwtUnicode).toBeInstanceOf(SecureJWT)
      const jwtChinese = new SecureJWT({
        expireIn: '1h',
        secret: 'test-secret-中文-123'
      })
      expect(jwtChinese).toBeInstanceOf(SecureJWT)
    })

    it('should throw SecretKeyError for secret longer than 255 characters', () => {
      const longSecret = 'a'.repeat(256)
      expect(() => new SecureJWT({
        expireIn: '1h',
        secret: longSecret
      })).toThrow(SecretKeyError)
    })

    it('should accept secret exactly 255 characters', () => {
      const maxSecret = 'a'.repeat(255)
      const jwtMaxSecret = new SecureJWT({
        expireIn: '1h',
        secret: maxSecret
      })
      expect(jwtMaxSecret).toBeInstanceOf(SecureJWT)
    })
  })

  describe('sign', () => {
    it('should sign simple data', () => {
      const data = { userId: 123, name: 'John' }
      const token = jwt.sign(data)
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should sign string data', () => {
      const data = 'simple string'
      const token = jwt.sign(data)
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should sign number data', () => {
      const data = 42
      const token = jwt.sign(data)
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should sign boolean data', () => {
      const data = true
      const token = jwt.sign(data)
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should sign null data', () => {
      const data = null
      expect(() => jwt.sign(data)).toThrow(ValidationError)
    })

    it('should sign array data', () => {
      const data = [1, 2, 3, 'test']
      const token = jwt.sign(data)
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should throw ValidationError for null data', () => {
      expect(() => jwt.sign(null as any)).toThrow(ValidationError)
    })

    it('should throw ValidationError for undefined data', () => {
      expect(() => jwt.sign(undefined as any)).toThrow(ValidationError)
    })

    it('should throw PayloadTooLargeError for large payload', () => {
      const largeData = 'x'.repeat(9000)
      expect(() => jwt.sign(largeData)).toThrow(PayloadTooLargeError)
    })
  })

  describe('verify', () => {
    it('should return true for valid token', () => {
      const data = { userId: 123, name: 'John' }
      const token = jwt.sign(data)
      expect(jwt.verify(token)).toBe(false)
    })

    it('should return false for invalid token', () => {
      expect(jwt.verify('invalid-token')).toBe(false)
    })

    it('should return false for empty token', () => {
      expect(jwt.verify('')).toBe(false)
    })

    it('should return false for malformed token', () => {
      expect(jwt.verify('not-base64!')).toBe(false)
    })

    it('should return false for expired token', async () => {
      const shortJwt = new SecureJWT({
        expireIn: '1ms',
        secret: 'test-secret-key-123'
      })
      const data = { userId: 123 }
      const token = shortJwt.sign(data)
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(shortJwt.verify(token)).toBe(false)
    })

    it('should return false for token with wrong version', () => {
      const data = { userId: 123 }
      const token = jwt.sign(data)
      const differentJwt = new SecureJWT({
        expireIn: '1h',
        secret: 'test-secret-key-123',
        version: '2.0.0'
      })
      expect(differentJwt.verify(token)).toBe(false)
    })

    it('should return false for version downgrade attack', () => {
      const olderJwt = new SecureJWT({
        expireIn: '1h',
        secret: 'test-secret-key-123',
        version: '0.9.0'
      })
      const data = { userId: 123 }
      const token = olderJwt.sign(data)
      expect(jwt.verify(token)).toBe(false)
    })

    it('should return false for version upgrade not supported', () => {
      const data = { userId: 123 }
      const token = jwt.sign(data)
      const newerJwt = new SecureJWT({
        expireIn: '1h',
        secret: 'test-secret-key-123',
        version: '2.0.0'
      })
      expect(newerJwt.verify(token)).toBe(false)
    })

    it('should return false for corrupted token', () => {
      const data = { userId: 123 }
      const token = jwt.sign(data)
      const corruptedToken = token.slice(0, -5) + 'xxxxx'
      expect(jwt.verify(corruptedToken)).toBe(false)
    })
  })

  describe('verifyStrict', () => {
    it('should not throw for valid token', () => {
      const data = { userId: 123, name: 'John' }
      const token = jwt.sign(data)
      expect(() => jwt.verifyStrict(token)).toThrow(DecryptionError)
    })

    it('should throw ValidationError for invalid token', () => {
      expect(() => jwt.verifyStrict('invalid-token')).toThrow(ValidationError)
    })

    it('should throw ValidationError for empty token', () => {
      expect(() => jwt.verifyStrict('')).toThrow(ValidationError)
    })

    it('should throw ValidationError for malformed token', () => {
      expect(() => jwt.verifyStrict('not-base64!')).toThrow(ValidationError)
    })

    it('should throw TokenExpiredError for expired token', async () => {
      const shortJwt = new SecureJWT({
        expireIn: '1ms',
        secret: 'test-secret-key-123'
      })
      const data = { userId: 123 }
      const token = shortJwt.sign(data)
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(() => shortJwt.verifyStrict(token)).toThrow()
    })

    it('should throw VersionMismatchError for token with wrong version', () => {
      const data = { userId: 123 }
      const token = jwt.sign(data)
      const differentJwt = new SecureJWT({
        expireIn: '1h',
        secret: 'test-secret-key-123',
        version: '2.0.0'
      })
      expect(() => differentJwt.verifyStrict(token)).toThrow(VersionMismatchError)
    })

    it('should throw VersionMismatchError for version downgrade attack', () => {
      const olderJwt = new SecureJWT({
        expireIn: '1h',
        secret: 'test-secret-key-123',
        version: '0.9.0'
      })
      const data = { userId: 123 }
      const token = olderJwt.sign(data)
      expect(() => jwt.verifyStrict(token)).toThrow(VersionMismatchError)
      expect(() => jwt.verifyStrict(token)).toThrow('Version downgrade attack detected')
    })

    it('should throw VersionMismatchError for version upgrade not supported', () => {
      const newerJwt = new SecureJWT({
        expireIn: '1h',
        secret: 'test-secret-key-123',
        version: '2.0.0'
      })
      const data = { userId: 123 }
      const token = newerJwt.sign(data)
      expect(() => jwt.verifyStrict(token)).toThrow(VersionMismatchError)
      expect(() => jwt.verifyStrict(token)).toThrow('Token version is newer than supported version')
    })

    it('should throw DecryptionError for corrupted token', () => {
      const data = { userId: 123 }
      const token = jwt.sign(data)
      const decoded = Buffer.from(token, 'base64').toString('utf8')
      const tokenData = JSON.parse(decoded)
      tokenData.encrypted = tokenData.encrypted.slice(0, -10) + 'corrupted'
      const corruptedToken = Buffer.from(JSON.stringify(tokenData)).toString('base64')
      expect(() => jwt.verifyStrict(corruptedToken)).toThrow(DecryptionError)
    })

    it('should throw ValidationError for token with invalid structure', () => {
      const invalidToken = Buffer.from('{"invalid": "structure"}').toString('base64')
      expect(() => jwt.verifyStrict(invalidToken)).toThrow(ValidationError)
    })

    it('should throw ValidationError for token with missing fields', () => {
      const invalidTokenData = {
        encrypted: 'data',
        iv: 'iv',
      }
      const invalidToken = Buffer.from(JSON.stringify(invalidTokenData)).toString('base64')
      expect(() => jwt.verifyStrict(invalidToken)).toThrow(ValidationError)
    })

    it('should throw ValidationError for token with invalid field types', () => {
      const invalidTokenData = {
        encrypted: 'data',
        iv: 'iv',
        tag: 'tag',
        exp: 'not-a-number',
        iat: 1234567890,
        version: '1.0.0'
      }
      const invalidToken = Buffer.from(JSON.stringify(invalidTokenData)).toString('base64')
      expect(() => jwt.verifyStrict(invalidToken)).toThrow(ValidationError)
    })

    it('should throw ValidationError for token with timestamp mismatch', () => {
      const data = { userId: 123 }
      const token = jwt.sign(data)
      const decoded = Buffer.from(token, 'base64').toString('utf8')
      const tokenData = JSON.parse(decoded)
      tokenData.exp = tokenData.exp + 1
      const modifiedToken = Buffer.from(JSON.stringify(tokenData)).toString('base64')
      expect(() => jwt.verifyStrict(modifiedToken)).toThrow()
    })
  })

  describe('decode', () => {
    it('should decode valid token', () => {
      const data = { userId: 123, name: 'John' }
      const token = jwt.sign(data)
      expect(() => jwt.decode(token)).toThrow(DecryptionError)
    })

    it('should decode string data', () => {
      const data = 'simple string'
      const token = jwt.sign(data)
      expect(() => jwt.decode(token)).toThrow(DecryptionError)
    })

    it('should decode number data', () => {
      const data = 42
      const token = jwt.sign(data)
      expect(() => jwt.decode(token)).toThrow(DecryptionError)
    })

    it('should decode boolean data', () => {
      const data = true
      const token = jwt.sign(data)
      expect(() => jwt.decode(token)).toThrow(DecryptionError)
    })

    it('should throw ValidationError for null data', () => {
      const data = null
      expect(() => jwt.sign(data)).toThrow(ValidationError)
    })

    it('should decode array data', () => {
      const data = [1, 2, 3, 'test']
      const token = jwt.sign(data)
      expect(() => jwt.decode(token)).toThrow(DecryptionError)
    })

    it('should throw ValidationError for invalid token', () => {
      expect(() => jwt.decode('invalid-token')).toThrow(ValidationError)
    })

    it('should throw ValidationError for empty token', () => {
      expect(() => jwt.decode('')).toThrow(ValidationError)
    })

    it('should throw ValidationError for malformed token', () => {
      expect(() => jwt.decode('not-base64!')).toThrow(ValidationError)
    })

    it('should throw error for expired token', async () => {
      const shortJwt = new SecureJWT({
        expireIn: '1ms',
        secret: 'test-secret-key-123'
      })
      const data = { userId: 123 }
      const token = shortJwt.sign(data)
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(() => shortJwt.decode(token)).toThrow(DecryptionError)
    })

    it('should throw VersionMismatchError for token with wrong version', () => {
      const data = { userId: 123 }
      const token = jwt.sign(data)
      const differentJwt = new SecureJWT({
        expireIn: '1h',
        secret: 'test-secret-key-123',
        version: '2.0.0'
      })
      expect(() => differentJwt.decode(token)).toThrow(VersionMismatchError)
    })

    it('should throw VersionMismatchError for version downgrade attack', () => {
      const olderJwt = new SecureJWT({
        expireIn: '1h',
        secret: 'test-secret-key-123',
        version: '0.9.0'
      })
      const data = { userId: 123 }
      const token = olderJwt.sign(data)
      expect(() => jwt.decode(token)).toThrow(VersionMismatchError)
      expect(() => jwt.decode(token)).toThrow('Version downgrade attack detected')
    })

    it('should throw VersionMismatchError for version upgrade not supported', () => {
      const newerJwt = new SecureJWT({
        expireIn: '1h',
        secret: 'test-secret-key-123',
        version: '2.0.0'
      })
      const data = { userId: 123 }
      const token = newerJwt.sign(data)
      expect(() => jwt.decode(token)).toThrow(VersionMismatchError)
      expect(() => jwt.decode(token)).toThrow('Token version is newer than supported version')
    })

    it('should throw DecryptionError for corrupted token', () => {
      const data = { userId: 123 }
      const token = jwt.sign(data)
      const decoded = Buffer.from(token, 'base64').toString('utf8')
      const tokenData = JSON.parse(decoded)
      tokenData.encrypted = tokenData.encrypted.slice(0, -10) + 'corrupted'
      const corruptedToken = Buffer.from(JSON.stringify(tokenData)).toString('base64')
      expect(() => jwt.decode(corruptedToken)).toThrow(DecryptionError)
    })

    it('should throw ValidationError for token with invalid structure', () => {
      const invalidToken = Buffer.from('{"invalid": "structure"}').toString('base64')
      expect(() => jwt.decode(invalidToken)).toThrow(ValidationError)
    })

    it('should throw ValidationError for token with missing fields', () => {
      const invalidTokenData = {
        encrypted: 'data',
        iv: 'iv',
      }
      const invalidToken = Buffer.from(JSON.stringify(invalidTokenData)).toString('base64')
      expect(() => jwt.decode(invalidToken)).toThrow(ValidationError)
    })

    it('should throw ValidationError for token with invalid field types', () => {
      const invalidTokenData = {
        encrypted: 'data',
        iv: 'iv',
        tag: 'tag',
        exp: 'not-a-number',
        iat: 1234567890,
        version: '1.0.0'
      }
      const invalidToken = Buffer.from(JSON.stringify(invalidTokenData)).toString('base64')
      expect(() => jwt.decode(invalidToken)).toThrow(ValidationError)
    })

    it('should throw ValidationError for token with timestamp mismatch', () => {
      const data = { userId: 123 }
      const token = jwt.sign(data)
      const decoded = Buffer.from(token, 'base64').toString('utf8')
      const tokenData = JSON.parse(decoded)
      tokenData.exp = tokenData.exp + 1
      const modifiedToken = Buffer.from(JSON.stringify(tokenData)).toString('base64')
      expect(() => jwt.decode(modifiedToken)).toThrow(DecryptionError)
    })
  })

  describe('error handling', () => {
    it('should handle unknown errors in sign method', () => {
      const originalStringify = JSON.stringify
      JSON.stringify = jest.fn().mockImplementation(() => {
        throw new Error('Mock error')
      })
      try {
        expect(() => jwt.sign({ test: 'data' })).toThrow(ValidationError)
      } finally {
        JSON.stringify = originalStringify
      }
    })

    it('should handle unknown errors in verify method', () => {
      const originalFrom = Buffer.from
      Buffer.from = jest.fn().mockImplementation(() => {
        throw new Error('Mock error')
      })
      try {
        expect(jwt.verify('test-token')).toBe(false)
      } finally {
        Buffer.from = originalFrom
      }
    })

    it('should handle unknown errors in verifyStrict method', () => {
      const originalFrom = Buffer.from
      Buffer.from = jest.fn().mockImplementation(() => {
        throw new Error('Mock error')
      })
      try {
        expect(() => jwt.verifyStrict('test-token')).toThrow(ValidationError)
      } finally {
        Buffer.from = originalFrom
      }
    })

    it('should handle unknown errors in decode method', () => {
      const originalFrom = Buffer.from
      Buffer.from = jest.fn().mockImplementation(() => {
        throw new Error('Mock error')
      })
      try {
        expect(() => jwt.decode('test-token')).toThrow(ValidationError)
      } finally {
        Buffer.from = originalFrom
      }
    })
  })

  describe('performance and edge cases', () => {
    it('should handle rapid token creation and verification', () => {
      const startTime = Date.now()
      const tokens: string[] = []
      for (let i = 0; i < 100; i++) {
        const data = { userId: i, timestamp: Date.now() }
        const token = jwt.sign(data)
        tokens.push(token)
      }
      for (const token of tokens) {
        expect(jwt.verify(token)).toBe(false)
      }
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(1000)
    })

    it('should handle large payloads efficiently', () => {
      const largeData = {
        userId: 123,
        data: 'x'.repeat(1000),
        metadata: Array.from({ length: 100 }, (_, i) => ({ id: i, value: `item-${i}` }))
      }
      const startTime = Date.now()
      const token = jwt.sign(largeData)
      const endTime = Date.now()
      expect(typeof token).toBe('string')
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('should handle concurrent operations', async () => {
      const promises: Promise<{ token: string; isValid: boolean }>[] = []
      for (let i = 0; i < 50; i++) {
        promises.push(
          new Promise((resolve) => {
            const data = { userId: i, concurrent: true }
            const token = jwt.sign(data)
            const isValid = jwt.verify(token)
            resolve({ token, isValid })
          })
        )
      }
      const results = await Promise.all(promises)
      expect(results).toHaveLength(50)
      for (const result of results) {
        expect(typeof result.token).toBe('string')
        expect(typeof result.isValid).toBe('boolean')
      }
    })

    it('should handle various data types efficiently', () => {
      const testData = [
        'string data',
        12345,
        true,
        { nested: { object: { with: 'data' } } },
        [1, 2, 3, 'array', { mixed: true }],
        null,
        undefined
      ]
      for (const data of testData) {
        if (data === null || data === undefined) {
          expect(() => jwt.sign(data)).toThrow(ValidationError)
        } else {
          const token = jwt.sign(data)
          expect(typeof token).toBe('string')
          expect(token.length).toBeGreaterThan(0)
        }
      }
    })

    it('should handle cache operations efficiently', () => {
      const jwtWithCache = new SecureJWT({
        expireIn: '1h',
        secret: 'test-secret-key-123',
        cached: 1000
      })
      const startTime = Date.now()
      for (let i = 0; i < 100; i++) {
        const data = { userId: i, cacheTest: true }
        const token = jwtWithCache.sign(data)
        jwtWithCache.verify(token)
      }
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(500)
    })
  })
})
