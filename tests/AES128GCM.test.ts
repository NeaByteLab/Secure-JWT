import { randomBytes } from 'node:crypto'
import AES128GCM from '../src/algorithms/AES128GCM'
jest.clearAllMocks()
jest.unmock('node:crypto')

describe('AES128GCM', () => {
  let aes128: AES128GCM
  let testKey: Buffer
  let testIV: Buffer
  let testData: string
  let testVersion: string

  beforeEach(() => {
    aes128 = new AES128GCM()
    testKey = randomBytes(16)
    testIV = randomBytes(12)
    testData = 'test data for encryption'
    testVersion = '1.0.0'
  })

  describe('getIVLength', () => {
    it('should return 12 for GCM mode', () => {
      expect(aes128.getIVLength()).toBe(12)
    })
  })

  describe('getKeyLength', () => {
    it('should return 16 for AES128', () => {
      expect(aes128.getKeyLength()).toBe(16)
    })
  })

  describe('getAlgoName', () => {
    it('should return aes-128-gcm', () => {
      expect(aes128.getAlgoName()).toBe('aes-128-gcm')
    })
  })

  describe('encrypt', () => {
    it('should encrypt data successfully', () => {
      const result = aes128.encrypt(testData, testKey, testIV, testVersion)
      expect(result).toHaveProperty('encrypted')
      expect(result).toHaveProperty('iv')
      expect(result).toHaveProperty('tag')
      expect(result.iv).toBe(testIV.toString('hex'))
      expect(result.encrypted).toBeDefined()
      expect(result.tag).toBeDefined()
    })

    it('should produce different encrypted data for same input', () => {
      const result1 = aes128.encrypt(testData, testKey, testIV, testVersion)
      const result2 = aes128.encrypt(testData, testKey, testIV, testVersion)
      expect(result1.encrypted).toBe(result2.encrypted)
      expect(result1.tag).toBe(result2.tag)
    })

    it('should produce different encrypted data with different IVs', () => {
      const iv2 = randomBytes(12)
      const result1 = aes128.encrypt(testData, testKey, testIV, testVersion)
      const result2 = aes128.encrypt(testData, testKey, iv2, testVersion)
      expect(result1.encrypted).not.toBe(result2.encrypted)
      expect(result1.tag).not.toBe(result2.tag)
    })

    it('should handle empty string', () => {
      const result = aes128.encrypt('', testKey, testIV, testVersion)
      expect(result).toHaveProperty('encrypted')
      expect(result).toHaveProperty('tag')
    })

    it('should handle special characters', () => {
      const specialData = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      const result = aes128.encrypt(specialData, testKey, testIV, testVersion)
      expect(result).toHaveProperty('encrypted')
      expect(result).toHaveProperty('tag')
    })

    it('should handle unicode characters', () => {
      const unicodeData = 'Hello 世界 🌍'
      const result = aes128.encrypt(unicodeData, testKey, testIV, testVersion)
      expect(result).toHaveProperty('encrypted')
      expect(result).toHaveProperty('tag')
    })
  })

  describe('decrypt', () => {
    it('should decrypt data successfully', () => {
      const encrypted = aes128.encrypt(testData, testKey, testIV, testVersion)
      const decrypted = aes128.decrypt(encrypted, testKey, testVersion)
      expect(decrypted).toBe(testData)
    })

    it('should decrypt empty string', () => {
      const encrypted = aes128.encrypt('', testKey, testIV, testVersion)
      const decrypted = aes128.decrypt(encrypted, testKey, testVersion)
      expect(decrypted).toBe('')
    })

    it('should decrypt special characters', () => {
      const specialData = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      const encrypted = aes128.encrypt(specialData, testKey, testIV, testVersion)
      const decrypted = aes128.decrypt(encrypted, testKey, testVersion)
      expect(decrypted).toBe(specialData)
    })

    it('should decrypt unicode characters', () => {
      const unicodeData = 'Hello 世界 🌍'
      const encrypted = aes128.encrypt(unicodeData, testKey, testIV, testVersion)
      const decrypted = aes128.decrypt(encrypted, testKey, testVersion)
      expect(decrypted).toBe(unicodeData)
    })

    it('should throw error for invalid key', () => {
      const encrypted = aes128.encrypt(testData, testKey, testIV, testVersion)
      const wrongKey = randomBytes(16)
      expect(() => {
        aes128.decrypt(encrypted, wrongKey, testVersion)
      }).toThrow()
    })

    it('should throw error for corrupted tag', () => {
      const encrypted = aes128.encrypt(testData, testKey, testIV, testVersion)
      encrypted.tag = 'corrupted-tag'
      expect(() => {
        aes128.decrypt(encrypted, testKey, testVersion)
      }).toThrow()
    })

    it('should throw error for corrupted encrypted data', () => {
      const encrypted = aes128.encrypt(testData, testKey, testIV, testVersion)
      encrypted.encrypted = 'corrupted-data'
      expect(() => {
        aes128.decrypt(encrypted, testKey, testVersion)
      }).toThrow()
    })

  })

  describe('round trip', () => {
    it('should encrypt and decrypt back to original data', () => {
      const originalData = 'This is a test message with special chars: !@#$%^&*()'
      const encrypted = aes128.encrypt(originalData, testKey, testIV, testVersion)
      const decrypted = aes128.decrypt(encrypted, testKey, testVersion)
      expect(decrypted).toBe(originalData)
    })

    it('should work with large data', () => {
      const largeData = 'A'.repeat(1000)
      const encrypted = aes128.encrypt(largeData, testKey, testIV, testVersion)
      const decrypted = aes128.decrypt(encrypted, testKey, testVersion)
      expect(decrypted).toBe(largeData)
    })

    it('should work with JSON data', () => {
      const jsonData = JSON.stringify({ userId: 123, role: 'admin', permissions: ['read', 'write'] })
      const encrypted = aes128.encrypt(jsonData, testKey, testIV, testVersion)
      const decrypted = aes128.decrypt(encrypted, testKey, testVersion)
      expect(decrypted).toBe(jsonData)
      expect(JSON.parse(decrypted)).toEqual({ userId: 123, role: 'admin', permissions: ['read', 'write'] })
    })
  })
})
