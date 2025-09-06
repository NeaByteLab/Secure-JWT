import { randomBytes } from 'node:crypto'
import ChaCha20 from '../src/algorithms/ChaCha20'
jest.clearAllMocks()
jest.unmock('node:crypto')

describe('ChaCha20', () => {
  let chaCha20: ChaCha20
  let testKey: Buffer
  let testIV: Buffer
  let testData: string
  let testVersion: string

  beforeEach(() => {
    chaCha20 = new ChaCha20()
    testKey = randomBytes(32)
    testIV = randomBytes(12)
    testData = 'test data for encryption'
    testVersion = '1.0.0'
  })

  describe('encrypt', () => {
    it('should encrypt data successfully', () => {
      const result = chaCha20.encrypt(testData, testKey, testIV, testVersion)
      expect(result).toHaveProperty('encrypted')
      expect(result).toHaveProperty('iv')
      expect(result).toHaveProperty('tag')
      expect(result.encrypted).toBeTruthy()
      expect(result.iv).toBe(testIV.toString('hex'))
      expect(result.tag).toBeTruthy()
    })

    it('should produce different encrypted data for same input', () => {
      const result1 = chaCha20.encrypt(testData, testKey, testIV, testVersion)
      const result2 = chaCha20.encrypt(testData, testKey, testIV, testVersion)
      expect(result1.encrypted).toBe(result2.encrypted)
      expect(result1.iv).toBe(result2.iv)
      expect(result1.tag).toBe(result2.tag)
    })

    it('should produce different encrypted data for different IVs', () => {
      const iv2 = randomBytes(12)
      const result1 = chaCha20.encrypt(testData, testKey, testIV, testVersion)
      const result2 = chaCha20.encrypt(testData, testKey, iv2, testVersion)
      expect(result1.encrypted).not.toBe(result2.encrypted)
      expect(result1.iv).not.toBe(result2.iv)
      expect(result1.tag).not.toBe(result2.tag)
    })

    it('should handle empty string data', () => {
      const result = chaCha20.encrypt('', testKey, testIV, testVersion)
      expect(result.encrypted).toBeDefined()
      expect(result.iv).toBe(testIV.toString('hex'))
      expect(result.tag).toBeTruthy()
    })

    it('should handle large data', () => {
      const largeData = 'x'.repeat(1000)
      const result = chaCha20.encrypt(largeData, testKey, testIV, testVersion)
      expect(result.encrypted).toBeTruthy()
      expect(result.iv).toBe(testIV.toString('hex'))
      expect(result.tag).toBeTruthy()
    })

    it('should handle special characters in data', () => {
      const specialData = 'test data with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?'
      const result = chaCha20.encrypt(specialData, testKey, testIV, testVersion)
      expect(result.encrypted).toBeTruthy()
      expect(result.iv).toBe(testIV.toString('hex'))
      expect(result.tag).toBeTruthy()
    })
  })

  describe('decrypt', () => {
    it('should decrypt data successfully', () => {
      const encrypted = chaCha20.encrypt(testData, testKey, testIV, testVersion)
      const decrypted = chaCha20.decrypt(encrypted, testKey, testVersion)
      expect(decrypted).toBe(testData)
    })

    it('should decrypt empty string data', () => {
      const encrypted = chaCha20.encrypt('', testKey, testIV, testVersion)
      const decrypted = chaCha20.decrypt(encrypted, testKey, testVersion)
      expect(decrypted).toBe('')
    })

    it('should decrypt large data', () => {
      const largeData = 'x'.repeat(1000)
      const encrypted = chaCha20.encrypt(largeData, testKey, testIV, testVersion)
      const decrypted = chaCha20.decrypt(encrypted, testKey, testVersion)
      expect(decrypted).toBe(largeData)
    })

    it('should decrypt special characters data', () => {
      const specialData = 'test data with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?'
      const encrypted = chaCha20.encrypt(specialData, testKey, testIV, testVersion)
      const decrypted = chaCha20.decrypt(encrypted, testKey, testVersion)
      expect(decrypted).toBe(specialData)
    })

    it('should throw error for invalid encrypted data', () => {
      const invalidEncrypted = {
        encrypted: 'invalid',
        iv: testIV.toString('hex'),
        tag: 'invalid'
      }
      expect(() => {
        chaCha20.decrypt(invalidEncrypted, testKey, testVersion)
      }).toThrow()
    })

    it('should throw error for wrong key', () => {
      const encrypted = chaCha20.encrypt(testData, testKey, testIV, testVersion)
      const wrongKey = randomBytes(32)
      expect(() => {
        chaCha20.decrypt(encrypted, wrongKey, testVersion)
      }).toThrow()
    })

    it('should throw error for wrong version', () => {
      const encrypted = chaCha20.encrypt(testData, testKey, testIV, testVersion)
      const wrongVersion = '2.0.0'
      expect(() => {
        chaCha20.decrypt(encrypted, testKey, wrongVersion)
      }).toThrow()
    })
  })

  describe('getIVLength', () => {
    it('should return 12 for ChaCha20-Poly1305', () => {
      expect(chaCha20.getIVLength()).toBe(12)
    })
  })

  describe('getKeyLength', () => {
    it('should return 32 for ChaCha20', () => {
      expect(chaCha20.getKeyLength()).toBe(32)
    })
  })

  describe('getAlgoName', () => {
    it('should return chacha20-poly1305', () => {
      expect(chaCha20.getAlgoName()).toBe('chacha20-poly1305')
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
        const encrypted = chaCha20.encrypt(data, testKey, testIV, testVersion)
        const decrypted = chaCha20.decrypt(encrypted, testKey, testVersion)
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
        const encrypted = chaCha20.encrypt(testData, key, testIV, testVersion)
        const decrypted = chaCha20.decrypt(encrypted, key, testVersion)
        expect(decrypted).toBe(testData)
      })
    })

    it('should work with different versions', () => {
      const versions = ['1.0.0', '1.1.0', '2.0.0', '10.5.3']
      versions.forEach(version => {
        const encrypted = chaCha20.encrypt(testData, testKey, testIV, version)
        const decrypted = chaCha20.decrypt(encrypted, testKey, version)
        expect(decrypted).toBe(testData)
      })
    })
  })

  describe('performance characteristics', () => {
    it('should handle rapid encryption/decryption', () => {
      const iterations = 100
      const start = Date.now()
      for (let i = 0; i < iterations; i++) {
        const data = `test data ${i}`
        const encrypted = chaCha20.encrypt(data, testKey, testIV, testVersion)
        const decrypted = chaCha20.decrypt(encrypted, testKey, testVersion)
        expect(decrypted).toBe(data)
      }
      const duration = Date.now() - start
      expect(duration).toBeLessThan(1000)
    })

    it('should handle concurrent operations', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            const data = `concurrent test ${i}`
            const encrypted = chaCha20.encrypt(data, testKey, testIV, testVersion)
            const decrypted = chaCha20.decrypt(encrypted, testKey, testVersion)
            expect(decrypted).toBe(data)
            resolve()
          }, Math.random() * 10)
        })
      })
      await Promise.all(promises)
    })
  })
})
