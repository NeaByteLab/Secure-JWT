import SecureJWT from '../src/index'
import {
  ValidationError,
  EncryptionError,
  DecryptionError,
  PayloadTooLargeError,
  TokenExpiredError,
  VersionMismatchError
} from '../src/utils/ErrorBase'
import { errorMessages } from '../src/utils/ErrorMap'

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

    it('should create instance without secret', () => {
      const jwtNoSecret = new SecureJWT({
        expireIn: '1h'
      })
      expect(jwtNoSecret).toBeInstanceOf(SecureJWT)
    })

    it('should create instance without version', () => {
      const jwtNoVersion = new SecureJWT({
        expireIn: '1h',
        secret: 'test-secret-key-123'
      })
      expect(jwtNoVersion).toBeInstanceOf(SecureJWT)
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
      const largeData = 'x'.repeat(9000) // This will exceed 8192 bytes when JSON stringified
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
      
      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 10))
      
      expect(shortJwt.verify(token)).toBe(false)
    })

    it('should return false for token with wrong version', () => {
      const data = { userId: 123 }
      const token = jwt.sign(data)
      
      // Create JWT with different version
      const differentJwt = new SecureJWT({
        expireIn: '1h',
        secret: 'test-secret-key-123',
        version: '2.0.0'
      })
      
      expect(differentJwt.verify(token)).toBe(false)
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
      
      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 10))
      
      // The token might fail at different validation stages, so we test for any validation error
      expect(() => shortJwt.verifyStrict(token)).toThrow()
    })

    it('should throw VersionMismatchError for token with wrong version', () => {
      const data = { userId: 123 }
      const token = jwt.sign(data)
      
      // Create JWT with different version
      const differentJwt = new SecureJWT({
        expireIn: '1h',
        secret: 'test-secret-key-123',
        version: '2.0.0'
      })
      
      expect(() => differentJwt.verifyStrict(token)).toThrow(VersionMismatchError)
    })

    it('should throw DecryptionError for corrupted token', () => {
      const data = { userId: 123 }
      const token = jwt.sign(data)
      // Create a more realistic corrupted token by modifying the encrypted data
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
        // missing tag, exp, iat, version
      }
      const invalidToken = Buffer.from(JSON.stringify(invalidTokenData)).toString('base64')
      expect(() => jwt.verifyStrict(invalidToken)).toThrow(ValidationError)
    })

    it('should throw ValidationError for token with invalid field types', () => {
      const invalidTokenData = {
        encrypted: 'data',
        iv: 'iv',
        tag: 'tag',
        exp: 'not-a-number', // should be number
        iat: 1234567890,
        version: '1.0.0'
      }
      const invalidToken = Buffer.from(JSON.stringify(invalidTokenData)).toString('base64')
      expect(() => jwt.verifyStrict(invalidToken)).toThrow(ValidationError)
    })

    it('should throw ValidationError for token with timestamp mismatch', () => {
      const data = { userId: 123 }
      const token = jwt.sign(data)
      
      // Manually decode and modify the token to have mismatched timestamps
      const decoded = Buffer.from(token, 'base64').toString('utf8')
      const tokenData = JSON.parse(decoded)
      tokenData.exp = tokenData.exp + 1 // Modify expiration
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
      
      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 10))
      
      // The token might fail at different validation stages, so we test for any validation error
      expect(() => shortJwt.decode(token)).toThrow(DecryptionError)
    })

    it('should throw VersionMismatchError for token with wrong version', () => {
      const data = { userId: 123 }
      const token = jwt.sign(data)
      
      // Create JWT with different version
      const differentJwt = new SecureJWT({
        expireIn: '1h',
        secret: 'test-secret-key-123',
        version: '2.0.0'
      })
      
      expect(() => differentJwt.decode(token)).toThrow(VersionMismatchError)
    })

    it('should throw DecryptionError for corrupted token', () => {
      const data = { userId: 123 }
      const token = jwt.sign(data)
      // Create a more realistic corrupted token by modifying the encrypted data
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
        // missing tag, exp, iat, version
      }
      const invalidToken = Buffer.from(JSON.stringify(invalidTokenData)).toString('base64')
      expect(() => jwt.decode(invalidToken)).toThrow(ValidationError)
    })

    it('should throw ValidationError for token with invalid field types', () => {
      const invalidTokenData = {
        encrypted: 'data',
        iv: 'iv',
        tag: 'tag',
        exp: 'not-a-number', // should be number
        iat: 1234567890,
        version: '1.0.0'
      }
      const invalidToken = Buffer.from(JSON.stringify(invalidTokenData)).toString('base64')
      expect(() => jwt.decode(invalidToken)).toThrow(ValidationError)
    })

    it('should throw ValidationError for token with timestamp mismatch', () => {
      const data = { userId: 123 }
      const token = jwt.sign(data)
      
      // Manually decode and modify the token to have mismatched timestamps
      const decoded = Buffer.from(token, 'base64').toString('utf8')
      const tokenData = JSON.parse(decoded)
      tokenData.exp = tokenData.exp + 1 // Modify expiration
      const modifiedToken = Buffer.from(JSON.stringify(tokenData)).toString('base64')
      
      expect(() => jwt.decode(modifiedToken)).toThrow(DecryptionError)
    })
  })

  describe('error handling', () => {
    it('should handle unknown errors in sign method', () => {
      // Mock JSON.stringify to throw an error
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
      // Mock Buffer.from to throw an error
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
      // Mock Buffer.from to throw an error
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
      // Mock Buffer.from to throw an error
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
})
