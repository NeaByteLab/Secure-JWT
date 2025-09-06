import { randomBytes } from 'node:crypto'
import AES256GCM from '../src/algorithms/AES256GCM'
jest.clearAllMocks()
jest.unmock('node:crypto')

describe('AES256GCM', () => {
  let aes256: AES256GCM
  let testKey: Buffer
  let testIV: Buffer
  let testData: string
  let testVersion: string

  beforeEach(() => {
    aes256 = new AES256GCM()
    testKey = randomBytes(32)
    testIV = randomBytes(16)
    testData = 'test data for encryption'
    testVersion = '1.0.0'
  })

  describe('encrypt', () => {
    it('should encrypt data successfully', () => {
      const result = aes256.encrypt(testData, testKey, testIV, testVersion)
      expect(result).toHaveProperty('encrypted')
      expect(result).toHaveProperty('iv')
      expect(result).toHaveProperty('tag')
      expect(result.encrypted).toBeTruthy()
      expect(result.iv).toBe(testIV.toString('hex'))
      expect(result.tag).toBeTruthy()
    })

    it('should produce different encrypted data for same input', () => {
      const result1 = aes256.encrypt(testData, testKey, testIV, testVersion)
      const result2 = aes256.encrypt(testData, testKey, testIV, testVersion)
      expect(result1.encrypted).toBe(result2.encrypted)
      expect(result1.iv).toBe(result2.iv)
      expect(result1.tag).toBe(result2.tag)
    })

    it('should produce different encrypted data for different IVs', () => {
      const iv2 = randomBytes(16)
      const result1 = aes256.encrypt(testData, testKey, testIV, testVersion)
      const result2 = aes256.encrypt(testData, testKey, iv2, testVersion)
      expect(result1.encrypted).not.toBe(result2.encrypted)
      expect(result1.iv).not.toBe(result2.iv)
      expect(result1.tag).not.toBe(result2.tag)
    })

    it('should handle empty string data', () => {
      const result = aes256.encrypt('', testKey, testIV, testVersion)
      expect(result.encrypted).toBeDefined()
      expect(result.iv).toBe(testIV.toString('hex'))
      expect(result.tag).toBeTruthy()
    })

    it('should handle large data', () => {
      const largeData = 'x'.repeat(1000)
      const result = aes256.encrypt(largeData, testKey, testIV, testVersion)
      expect(result.encrypted).toBeTruthy()
      expect(result.iv).toBe(testIV.toString('hex'))
      expect(result.tag).toBeTruthy()
    })

    it('should handle special characters in data', () => {
      const specialData = 'test data with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?'
      const result = aes256.encrypt(specialData, testKey, testIV, testVersion)
      expect(result.encrypted).toBeTruthy()
      expect(result.iv).toBe(testIV.toString('hex'))
      expect(result.tag).toBeTruthy()
    })
  })

  describe('decrypt', () => {
    it('should decrypt data successfully', () => {
      const encrypted = aes256.encrypt(testData, testKey, testIV, testVersion)
      const decrypted = aes256.decrypt(encrypted, testKey, testVersion)
      expect(decrypted).toBe(testData)
    })

    it('should decrypt empty string data', () => {
      const encrypted = aes256.encrypt('', testKey, testIV, testVersion)
      const decrypted = aes256.decrypt(encrypted, testKey, testVersion)
      expect(decrypted).toBe('')
    })

    it('should decrypt large data', () => {
      const largeData = 'x'.repeat(1000)
      const encrypted = aes256.encrypt(largeData, testKey, testIV, testVersion)
      const decrypted = aes256.decrypt(encrypted, testKey, testVersion)
      expect(decrypted).toBe(largeData)
    })

    it('should decrypt special characters data', () => {
      const specialData = 'test data with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?'
      const encrypted = aes256.encrypt(specialData, testKey, testIV, testVersion)
      const decrypted = aes256.decrypt(encrypted, testKey, testVersion)
      expect(decrypted).toBe(specialData)
    })

    it('should throw error for invalid encrypted data', () => {
      const invalidEncrypted = {
        encrypted: 'invalid',
        iv: testIV.toString('hex'),
        tag: 'invalid'
      }
      expect(() => {
        aes256.decrypt(invalidEncrypted, testKey, testVersion)
      }).toThrow()
    })

    it('should throw error for wrong key', () => {
      const encrypted = aes256.encrypt(testData, testKey, testIV, testVersion)
      const wrongKey = randomBytes(32)
      expect(() => {
        aes256.decrypt(encrypted, wrongKey, testVersion)
      }).toThrow()
    })

    it('should throw error for wrong version', () => {
      const encrypted = aes256.encrypt(testData, testKey, testIV, testVersion)
      const wrongVersion = '2.0.0'
      expect(() => {
        aes256.decrypt(encrypted, testKey, wrongVersion)
      }).toThrow()
    })
  })

  describe('getIVLength', () => {
    it('should return 16 for AES-256-GCM', () => {
      expect(aes256.getIVLength()).toBe(16)
    })
  })

  describe('getAlgoName', () => {
    it('should return aes-256-gcm', () => {
      expect(aes256.getAlgoName()).toBe('aes-256-gcm')
    })
  })

  describe('round trip encryption/decryption', () => {
    it('should work with various data types', () => {
      const testCases = [
        'simple string',
        '',
        'x'.repeat(100),
        'test with spaces and numbers 123',
        'special chars: !@#$%^&*()',
        'unicode: 你好世界 🌍',
        'json: {"key": "value", "number": 123}'
      ]
      testCases.forEach(data => {
        const encrypted = aes256.encrypt(data, testKey, testIV, testVersion)
        const decrypted = aes256.decrypt(encrypted, testKey, testVersion)
        expect(decrypted).toBe(data)
      })
    })

    it('should work with different keys', () => {
      const keys = [
        randomBytes(32),
        randomBytes(32),
        randomBytes(32)
      ]
      keys.forEach(key => {
        const encrypted = aes256.encrypt(testData, key, testIV, testVersion)
        const decrypted = aes256.decrypt(encrypted, key, testVersion)
        expect(decrypted).toBe(testData)
      })
    })

    it('should work with different versions', () => {
      const versions = ['1.0.0', '1.1.0', '2.0.0', '10.5.3']
      versions.forEach(version => {
        const encrypted = aes256.encrypt(testData, testKey, testIV, version)
        const decrypted = aes256.decrypt(encrypted, testKey, version)
        expect(decrypted).toBe(testData)
      })
    })
  })
})
