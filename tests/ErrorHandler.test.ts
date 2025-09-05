import { ErrorHandler } from '../src/utils/ErrorHandler'
import {
  ValidationError,
  TimeFormatError,
  SecretKeyError,
  PayloadTooLargeError,
  TokenExpiredError,
  VersionMismatchError,
  DecryptionError,
  EncryptionError
} from '../src/utils/ErrorBase'
import { errorMessages } from '../src/utils/ErrorMap'

describe('ErrorHandler', () => {
  describe('wrap', () => {
    it('should wrap function and return result on success', () => {
      const fn = jest.fn().mockReturnValue('success')
      const wrapped = ErrorHandler.wrap(fn)
      const result = wrapped('test')
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledWith('test')
    })

    it('should wrap function and throw mapped error', () => {
      const fn = jest.fn().mockImplementation(() => {
        throw new Error('Original error')
      })
      const errorMapper = jest.fn().mockReturnValue(new ValidationError('Mapped error'))
      const wrapped = ErrorHandler.wrap(fn, errorMapper)
      expect(() => wrapped('test')).toThrow(ValidationError)
      expect(errorMapper).toHaveBeenCalledWith(expect.any(Error))
    })

    it('should re-throw SecureJWTError without mapping', () => {
      const originalError = new ValidationError('Original error')
      const fn = jest.fn().mockImplementation(() => {
        throw originalError
      })
      const wrapped = ErrorHandler.wrap(fn)
      expect(() => wrapped('test')).toThrow(originalError)
    })

    it('should create SecureJWTError for unknown errors', () => {
      const fn = jest.fn().mockImplementation(() => {
        throw 'String error'
      })
      const wrapped = ErrorHandler.wrap(fn)
      expect(() => wrapped('test')).toThrow('Unknown error occurred')
    })
  })

  describe('validateData', () => {
    it('should not throw for valid data', () => {
      expect(() => ErrorHandler.validateData('test')).not.toThrow()
      expect(() => ErrorHandler.validateData(123)).not.toThrow()
      expect(() => ErrorHandler.validateData({})).not.toThrow()
    })

    it('should throw ValidationError for null', () => {
      expect(() => ErrorHandler.validateData(null)).toThrow(ValidationError)
    })

    it('should throw ValidationError for undefined', () => {
      expect(() => ErrorHandler.validateData(undefined)).toThrow(ValidationError)
    })
  })

  describe('validateTimeString', () => {
    it('should not throw for valid time string', () => {
      expect(() => ErrorHandler.validateTimeString('1m')).not.toThrow()
    })

    it('should throw TimeFormatError for empty string', () => {
      expect(() => ErrorHandler.validateTimeString('')).toThrow(TimeFormatError)
    })

    it('should throw TimeFormatError for non-string', () => {
      expect(() => ErrorHandler.validateTimeString(123 as any)).toThrow(TimeFormatError)
    })
  })

  describe('validateOptions', () => {
    it('should not throw for valid object', () => {
      expect(() => ErrorHandler.validateOptions({})).not.toThrow()
    })

    it('should throw ValidationError for null', () => {
      expect(() => ErrorHandler.validateOptions(null)).toThrow(ValidationError)
    })

    it('should throw ValidationError for non-object', () => {
      expect(() => ErrorHandler.validateOptions('string')).toThrow(ValidationError)
    })
  })

  describe('validateExpireIn', () => {
    it('should not throw for valid string', () => {
      expect(() => ErrorHandler.validateExpireIn('1m')).not.toThrow()
    })

    it('should throw ValidationError for null', () => {
      expect(() => ErrorHandler.validateExpireIn(null)).toThrow(ValidationError)
    })

    it('should throw ValidationError for non-string', () => {
      expect(() => ErrorHandler.validateExpireIn(123)).toThrow(ValidationError)
    })
  })

  describe('validateToken', () => {
    it('should not throw for valid token', () => {
      expect(() => ErrorHandler.validateToken('valid-token')).not.toThrow()
    })

    it('should throw ValidationError for non-string', () => {
      expect(() => ErrorHandler.validateToken(123 as any)).toThrow(ValidationError)
    })

    it('should throw ValidationError for empty string', () => {
      expect(() => ErrorHandler.validateToken('')).toThrow(ValidationError)
    })
  })

  describe('validateSecret', () => {
    it('should not throw for valid secret', () => {
      expect(() => ErrorHandler.validateSecret('validsecret123')).not.toThrow()
    })

    it('should throw ValidationError for non-string', () => {
      expect(() => ErrorHandler.validateSecret(123 as any)).toThrow(ValidationError)
    })

    it('should throw SecretKeyError for short secret', () => {
      expect(() => ErrorHandler.validateSecret('short')).toThrow(SecretKeyError)
    })

    it('should throw SecretKeyError for invalid characters', () => {
      expect(() => ErrorHandler.validateSecret('invalid spaces')).toThrow(SecretKeyError)
    })
  })

  describe('validateVersion', () => {
    it('should not throw for valid version', () => {
      expect(() => ErrorHandler.validateVersion('1.0.0')).not.toThrow()
      expect(() => ErrorHandler.validateVersion('2.1.0')).not.toThrow()
    })

    it('should throw ValidationError for non-string', () => {
      expect(() => ErrorHandler.validateVersion(123 as any)).toThrow(ValidationError)
    })

    it('should throw ValidationError for empty string', () => {
      expect(() => ErrorHandler.validateVersion('')).toThrow(ValidationError)
    })

    it('should throw ValidationError for invalid format', () => {
      expect(() => ErrorHandler.validateVersion('1.0')).toThrow(ValidationError)
      expect(() => ErrorHandler.validateVersion('1')).toThrow(ValidationError)
      expect(() => ErrorHandler.validateVersion('1.0.0.0')).toThrow(ValidationError)
    })
  })

  describe('validatePayloadSize', () => {
    it('should not throw for small payload', () => {
      expect(() => ErrorHandler.validatePayloadSize('small')).not.toThrow()
    })

    it('should not throw for payload at limit', () => {
      const payload = 'a'.repeat(8192)
      expect(() => ErrorHandler.validatePayloadSize(payload)).not.toThrow()
    })

    it('should throw PayloadTooLargeError for large payload', () => {
      const payload = 'a'.repeat(8193)
      expect(() => ErrorHandler.validatePayloadSize(payload)).toThrow(PayloadTooLargeError)
    })

    it('should use custom max size', () => {
      const payload = 'a'.repeat(100)
      expect(() => ErrorHandler.validatePayloadSize(payload, 50)).toThrow(PayloadTooLargeError)
    })
  })

  describe('validateExpiration', () => {
    it('should not throw for valid expiration', () => {
      const now = Math.floor(Date.now() / 1000)
      expect(() => ErrorHandler.validateExpiration(now + 3600, now + 7200)).not.toThrow()
    })

    it('should throw ValidationError for too far expiration', () => {
      const now = Math.floor(Date.now() / 1000)
      expect(() => ErrorHandler.validateExpiration(now + 7200, now + 3600)).toThrow(ValidationError)
    })
  })

  describe('checkTokenExpiration', () => {
    it('should not throw for future expiration', () => {
      const future = Math.floor(Date.now() / 1000) + 3600
      expect(() => ErrorHandler.checkTokenExpiration(future)).not.toThrow()
    })

    it('should throw TokenExpiredError for past expiration', () => {
      const past = Math.floor(Date.now() / 1000) - 3600
      expect(() => ErrorHandler.checkTokenExpiration(past)).toThrow(TokenExpiredError)
    })
  })

  describe('validateVersionCompatibility', () => {
    it('should not throw for matching versions', () => {
      expect(() => ErrorHandler.validateVersionCompatibility('1.0.0', '1.0.0')).not.toThrow()
    })

    it('should throw VersionMismatchError for different versions', () => {
      expect(() => ErrorHandler.validateVersionCompatibility('1.0.0', '2.0.0')).toThrow(VersionMismatchError)
    })
  })

  describe('validateEncryptionData', () => {
    it('should not throw for valid string', () => {
      expect(() => ErrorHandler.validateEncryptionData('valid data')).not.toThrow()
    })

    it('should throw ValidationError for null', () => {
      expect(() => ErrorHandler.validateEncryptionData(null as any)).toThrow(ValidationError)
    })

    it('should throw ValidationError for non-string', () => {
      expect(() => ErrorHandler.validateEncryptionData(123 as any)).toThrow(ValidationError)
    })
  })

  describe('validateTokenEncrypted', () => {
    it('should not throw for valid object', () => {
      const valid = { encrypted: 'data', iv: 'iv', tag: 'tag' }
      expect(() => ErrorHandler.validateTokenEncrypted(valid)).not.toThrow()
    })

    it('should throw ValidationError for null', () => {
      expect(() => ErrorHandler.validateTokenEncrypted(null)).toThrow(ValidationError)
    })

    it('should throw ValidationError for non-object', () => {
      expect(() => ErrorHandler.validateTokenEncrypted('string')).toThrow(ValidationError)
    })

    it('should throw ValidationError for missing properties', () => {
      const invalid = { encrypted: 'data' }
      expect(() => ErrorHandler.validateTokenEncrypted(invalid)).toThrow(ValidationError)
    })
  })

  describe('validateIVFormat', () => {
    it('should not throw for valid IV', () => {
      const validIV = 'a'.repeat(32)
      expect(() => ErrorHandler.validateIVFormat(validIV)).not.toThrow()
    })

    it('should throw DecryptionError for null', () => {
      expect(() => ErrorHandler.validateIVFormat(null as any)).toThrow(DecryptionError)
    })

    it('should throw DecryptionError for invalid format', () => {
      expect(() => ErrorHandler.validateIVFormat('invalid')).toThrow(DecryptionError)
    })
  })

  describe('validateTagFormat', () => {
    it('should not throw for valid tag', () => {
      const validTag = 'a'.repeat(32)
      expect(() => ErrorHandler.validateTagFormat(validTag)).not.toThrow()
    })

    it('should throw DecryptionError for null', () => {
      expect(() => ErrorHandler.validateTagFormat(null as any)).toThrow(DecryptionError)
    })

    it('should throw DecryptionError for invalid format', () => {
      expect(() => ErrorHandler.validateTagFormat('invalid')).toThrow(DecryptionError)
    })
  })

  describe('validateKeyLength', () => {
    it('should not throw for valid key length', () => {
      const validKey = Buffer.alloc(32)
      expect(() => ErrorHandler.validateKeyLength(validKey)).not.toThrow()
    })

    it('should throw EncryptionError for invalid key length', () => {
      const invalidKey = Buffer.alloc(16)
      expect(() => ErrorHandler.validateKeyLength(invalidKey)).toThrow(EncryptionError)
    })
  })

  describe('validateAuthTag', () => {
    it('should not throw for valid tag', () => {
      const validTag = Buffer.alloc(16)
      expect(() => ErrorHandler.validateAuthTag(validTag)).not.toThrow()
    })

    it('should throw EncryptionError for null', () => {
      expect(() => ErrorHandler.validateAuthTag(null as any)).toThrow(EncryptionError)
    })

    it('should throw EncryptionError for undefined', () => {
      expect(() => ErrorHandler.validateAuthTag(undefined as any)).toThrow(EncryptionError)
    })

    it('should throw EncryptionError for empty buffer (length 0)', () => {
      const emptyTag = Buffer.alloc(0)
      expect(emptyTag).not.toBeNull()
      expect(emptyTag).not.toBeUndefined()
      expect(emptyTag.length).toBe(0)
      expect(() => ErrorHandler.validateAuthTag(emptyTag)).toThrow(EncryptionError)
    })

    it('should throw EncryptionError for zero-length buffer (alternative)', () => {
      const emptyTag = Buffer.from('')
      expect(emptyTag).not.toBeNull()
      expect(emptyTag).not.toBeUndefined()
      expect(emptyTag.length).toBe(0)
      expect(() => ErrorHandler.validateAuthTag(emptyTag)).toThrow(EncryptionError)
    })

    it('should throw EncryptionError for buffer with length 0 (forced coverage)', () => {
      // Create a buffer and then slice it to length 0
      const buffer = Buffer.alloc(10)
      const emptyBuffer = buffer.slice(0, 0)
      expect(emptyBuffer).not.toBeNull()
      expect(emptyBuffer).not.toBeUndefined()
      expect(emptyBuffer.length).toBe(0)
      expect(() => ErrorHandler.validateAuthTag(emptyBuffer)).toThrow(EncryptionError)
    })

    it('should throw EncryptionError for buffer with length 0 (debug test)', () => {
      // Create a buffer with length 0 to ensure we hit the second condition
      const emptyBuffer = Buffer.alloc(0)
      expect(emptyBuffer).not.toBeNull()
      expect(emptyBuffer).not.toBeUndefined()
      expect(emptyBuffer.length).toBe(0)
      expect(() => ErrorHandler.validateAuthTag(emptyBuffer)).toThrow(EncryptionError)
    })
  })

  describe('validateTokenTimestamps', () => {
    it('should not throw for matching timestamps', () => {
      const exp = 1234567890
      const iat = 1234567800
      expect(() => ErrorHandler.validateTokenTimestamps(exp, exp, iat, iat)).not.toThrow()
    })

    it('should throw ValidationError for mismatched timestamps', () => {
      const exp1 = 1234567890
      const exp2 = 1234567891
      const iat1 = 1234567800
      const iat2 = 1234567801
      expect(() => ErrorHandler.validateTokenTimestamps(exp1, exp2, iat1, iat2)).toThrow(ValidationError)
    })
  })

  describe('validateJSONParse', () => {
    it('should return parsed object for valid JSON', () => {
      const result = ErrorHandler.validateJSONParse<{ test: string }>('{"test":"value"}', 'Invalid JSON')
      expect(result).toEqual({ test: 'value' })
    })

    it('should throw ValidationError for invalid JSON', () => {
      expect(() => ErrorHandler.validateJSONParse('invalid json', 'Invalid JSON')).toThrow(ValidationError)
    })
  })

  describe('validateBase64Decode', () => {
    it('should return decoded string for valid base64', () => {
      const encoded = Buffer.from('test').toString('base64')
      const result = ErrorHandler.validateBase64Decode(encoded, 'Invalid base64')
      expect(result).toBe('test')
    })

    it('should not throw for invalid base64 (Buffer.from handles it)', () => {
      // Buffer.from doesn't throw for invalid base64, it just produces garbage
      const result = ErrorHandler.validateBase64Decode('invalid base64!', 'Invalid base64')
      expect(typeof result).toBe('string')
    })
  })

  describe('validateTokenTimestamps', () => {
    it('should not throw when timestamps match', () => {
      const now = Math.floor(Date.now() / 1000)
      expect(() => {
        ErrorHandler.validateTokenTimestamps(now, now, now - 3600, now - 3600)
      }).not.toThrow()
    })

    it('should throw ValidationError when payload exp differs from token exp', () => {
      const now = Math.floor(Date.now() / 1000)
      expect(() => {
        ErrorHandler.validateTokenTimestamps(now, now + 1, now - 3600, now - 3600)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenTimestamps(now, now + 1, now - 3600, now - 3600)
      }).toThrow('Token timestamp mismatch')
    })

    it('should throw ValidationError when payload iat differs from token iat', () => {
      const now = Math.floor(Date.now() / 1000)
      expect(() => {
        ErrorHandler.validateTokenTimestamps(now, now, now - 3600, now - 3601)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenTimestamps(now, now, now - 3600, now - 3601)
      }).toThrow('Token timestamp mismatch')
    })

    it('should throw ValidationError when both timestamps differ', () => {
      const now = Math.floor(Date.now() / 1000)
      expect(() => {
        ErrorHandler.validateTokenTimestamps(now + 1, now, now - 3601, now - 3600)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenTimestamps(now + 1, now, now - 3601, now - 3600)
      }).toThrow(errorMessages.TOKEN_TIMESTAMP_MISMATCH)
    })
  })

  describe('validateJSONParse', () => {
    it('should return parsed JSON for valid JSON string', () => {
      const validJSON = '{"test": "value", "number": 123}'
      const result = ErrorHandler.validateJSONParse<{ test: string; number: number }>(validJSON, 'Invalid JSON')
      expect(result).toEqual({ test: 'value', number: 123 })
    })

    it('should successfully parse valid JSON and return the result', () => {
      const validJSON = '{"success": true, "data": [1, 2, 3]}'
      const result = ErrorHandler.validateJSONParse<{ success: boolean; data: number[] }>(validJSON, 'Invalid JSON')
      expect(result).toEqual({ success: true, data: [1, 2, 3] })
    })

    it('should parse complex JSON structures', () => {
      const complexJSON = '{"nested": {"array": [1, 2, 3], "object": {"key": "value"}}, "boolean": true, "null": null}'
      const result = ErrorHandler.validateJSONParse<{ nested: { array: number[]; object: { key: string } }; boolean: boolean; null: null }>(complexJSON, 'Invalid JSON')
      expect(result).toEqual({ nested: { array: [1, 2, 3], object: { key: 'value' } }, boolean: true, null: null })
    })

    it('should parse JSON with special characters', () => {
      const specialJSON = '{"unicode": "🚀", "quotes": "\\"test\\"", "newline": "line1\\nline2"}'
      const result = ErrorHandler.validateJSONParse<{ unicode: string; quotes: string; newline: string }>(specialJSON, 'Invalid JSON')
      expect(result).toEqual({ unicode: '🚀', quotes: '"test"', newline: 'line1\nline2' })
    })

    it('should parse JSON with nested objects and arrays', () => {
      const nestedJSON = '{"users": [{"id": 1, "name": "John"}, {"id": 2, "name": "Jane"}], "meta": {"count": 2, "page": 1}}'
      const result = ErrorHandler.validateJSONParse<{ users: Array<{ id: number; name: string }>; meta: { count: number; page: number } }>(nestedJSON, 'Invalid JSON')
      expect(result).toEqual({ 
        users: [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }], 
        meta: { count: 2, page: 1 } 
      })
    })

    it('should return parsed JSON for array', () => {
      const validJSON = '[1, 2, 3, "test"]'
      const result = ErrorHandler.validateJSONParse<number[]>(validJSON, 'Invalid JSON')
      expect(result).toEqual([1, 2, 3, 'test'])
    })

    it('should return parsed JSON for primitive values', () => {
      expect(ErrorHandler.validateJSONParse<string>('"hello"', 'Invalid JSON')).toBe('hello')
      expect(ErrorHandler.validateJSONParse<number>('123', 'Invalid JSON')).toBe(123)
      expect(ErrorHandler.validateJSONParse<boolean>('true', 'Invalid JSON')).toBe(true)
      expect(ErrorHandler.validateJSONParse<null>('null', 'Invalid JSON')).toBe(null)
    })

    it('should throw ValidationError for invalid JSON string', () => {
      expect(() => {
        ErrorHandler.validateJSONParse('invalid json', 'Custom error message')
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateJSONParse('invalid json', 'Custom error message')
      }).toThrow('Custom error message')
    })

    it('should throw ValidationError for malformed JSON', () => {
      expect(() => {
        ErrorHandler.validateJSONParse('{"test": "value",}', 'Malformed JSON')
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateJSONParse('{"test": "value",}', 'Malformed JSON')
      }).toThrow('Malformed JSON')
    })

    it('should throw ValidationError for incomplete JSON', () => {
      expect(() => {
        ErrorHandler.validateJSONParse('{"test": "value"', 'Incomplete JSON')
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateJSONParse('{"test": "value"', 'Incomplete JSON')
      }).toThrow('Incomplete JSON')
    })

    it('should throw ValidationError when JSON.parse throws', () => {
      // Mock JSON.parse to throw an error
      const originalParse = JSON.parse
      JSON.parse = jest.fn().mockImplementation(() => {
        throw new Error('JSON parse error')
      })
      
      try {
        expect(() => ErrorHandler.validateJSONParse('{"test": "value"}', 'Custom error')).toThrow(ValidationError)
        expect(() => ErrorHandler.validateJSONParse('{"test": "value"}', 'Custom error')).toThrow('Custom error')
      } finally {
        JSON.parse = originalParse
      }
    })
  })

  describe('validateBase64Decode', () => {
    it('should decode valid base64 string', () => {
      const original = 'Hello, World!'
      const encoded = Buffer.from(original, 'utf8').toString('base64')
      const result = ErrorHandler.validateBase64Decode(encoded, 'Invalid base64')
      expect(result).toBe(original)
    })

    it('should decode valid base64 with padding', () => {
      const original = 'test'
      const encoded = Buffer.from(original, 'utf8').toString('base64')
      const result = ErrorHandler.validateBase64Decode(encoded, 'Invalid base64')
      expect(result).toBe(original)
    })

    it('should decode valid base64 with double padding', () => {
      const original = 'te'
      const encoded = Buffer.from(original, 'utf8').toString('base64')
      const result = ErrorHandler.validateBase64Decode(encoded, 'Invalid base64')
      expect(result).toBe(original)
    })

    it('should decode empty string', () => {
      const original = ''
      const encoded = Buffer.from(original, 'utf8').toString('base64')
      const result = ErrorHandler.validateBase64Decode(encoded, 'Invalid base64')
      expect(result).toBe(original)
    })

    it('should not throw for invalid base64 (Buffer.from handles it)', () => {
      // Buffer.from doesn't throw for invalid base64, it just produces garbage
      const result = ErrorHandler.validateBase64Decode('invalid base64!', 'Invalid base64')
      expect(typeof result).toBe('string')
    })

    it('should throw ValidationError when Buffer.from throws', () => {
      // Mock Buffer.from to throw an error
      const originalFrom = Buffer.from
      Buffer.from = jest.fn().mockImplementation(() => {
        throw new Error('Buffer error')
      })
      
      try {
        expect(() => ErrorHandler.validateBase64Decode('test', 'Custom error')).toThrow(ValidationError)
        expect(() => ErrorHandler.validateBase64Decode('test', 'Custom error')).toThrow('Custom error')
      } finally {
        Buffer.from = originalFrom
      }
    })
  })

  describe('validateTokenIntegrity', () => {
    it('should not throw for valid base64 token', () => {
      const validToken = Buffer.from('{"test": "data"}').toString('base64')
      expect(() => {
        ErrorHandler.validateTokenIntegrity(validToken)
      }).not.toThrow()
    })

    it('should not throw for valid base64 with padding', () => {
      const validToken = Buffer.from('test data for padding').toString('base64')
      expect(() => {
        ErrorHandler.validateTokenIntegrity(validToken)
      }).not.toThrow()
    })

    it('should not throw for valid base64 with double padding', () => {
      const validToken = Buffer.from('test data for double padding').toString('base64')
      expect(() => {
        ErrorHandler.validateTokenIntegrity(validToken)
      }).not.toThrow()
    })

    it('should throw ValidationError for invalid base64 characters', () => {
      expect(() => {
        ErrorHandler.validateTokenIntegrity('invalid-token!')
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenIntegrity('invalid-token!')
      }).toThrow(errorMessages.TOKEN_FORMAT_NOT_BASE64)
    })

    it('should throw ValidationError for token too short', () => {
      expect(() => {
        ErrorHandler.validateTokenIntegrity('short')
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenIntegrity('short')
      }).toThrow(errorMessages.TOKEN_FORMAT_TOO_SHORT)
    })

    it('should throw ValidationError for token too long', () => {
      const longToken = 'a'.repeat(100001)
      expect(() => {
        ErrorHandler.validateTokenIntegrity(longToken)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenIntegrity(longToken)
      }).toThrow(errorMessages.TOKEN_FORMAT_TOO_LONG)
    })

    it('should throw ValidationError for invalid base64 padding (more than 2)', () => {
      expect(() => {
        ErrorHandler.validateTokenIntegrity('invalid===')
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenIntegrity('invalid===')
      }).toThrow(errorMessages.TOKEN_FORMAT_NOT_BASE64)
    })

    it('should throw ValidationError for invalid base64 length (not multiple of 4)', () => {
      expect(() => {
        ErrorHandler.validateTokenIntegrity('invalid')
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenIntegrity('invalid')
      }).toThrow(errorMessages.TOKEN_FORMAT_TOO_SHORT)
    })

    it('should accept exactly 12 characters (minimum valid base64 length)', () => {
      const minToken = 'a'.repeat(12) // 12 % 4 = 0, valid base64 length
      expect(() => {
        ErrorHandler.validateTokenIntegrity(minToken)
      }).not.toThrow()
    })

    it('should accept exactly 100000 characters (maximum length)', () => {
      const maxToken = 'a'.repeat(100000)
      expect(() => {
        ErrorHandler.validateTokenIntegrity(maxToken)
      }).not.toThrow()
    })
  })

  describe('validateTokenDataIntegrity', () => {
    const createValidTokenData = () => ({
      encrypted: 'encrypted_data',
      iv: 'initialization_vector',
      tag: 'auth_tag',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      version: '1.0.0'
    })

    it('should not throw for valid token data', () => {
      const validData = createValidTokenData()
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(validData)
      }).not.toThrow()
    })

    it('should throw ValidationError for null input', () => {
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(null)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(null)
      }).toThrow(errorMessages.TOKEN_STRUCTURE_NOT_OBJECT)
    })

    it('should throw ValidationError for undefined input', () => {
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(undefined)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(undefined)
      }).toThrow(errorMessages.TOKEN_STRUCTURE_NOT_OBJECT)
    })

    it('should throw ValidationError for non-object input', () => {
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity('string')
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity('string')
      }).toThrow(errorMessages.TOKEN_STRUCTURE_NOT_OBJECT)
    })

    it('should throw ValidationError for array input', () => {
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity([])
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity([])
      }).toThrow(`${errorMessages.TOKEN_STRUCTURE_MISSING_FIELD} 'encrypted'`)
    })

    it('should throw ValidationError for missing encrypted field', () => {
      const data = createValidTokenData()
      delete data.encrypted
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(`${errorMessages.TOKEN_STRUCTURE_MISSING_FIELD} 'encrypted'`)
    })

    it('should throw ValidationError for missing iv field', () => {
      const data = createValidTokenData()
      delete data.iv
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(`${errorMessages.TOKEN_STRUCTURE_MISSING_FIELD} 'iv'`)
    })

    it('should throw ValidationError for missing tag field', () => {
      const data = createValidTokenData()
      delete data.tag
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(`${errorMessages.TOKEN_STRUCTURE_MISSING_FIELD} 'tag'`)
    })

    it('should throw ValidationError for missing exp field', () => {
      const data = createValidTokenData()
      delete data.exp
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(`${errorMessages.TOKEN_STRUCTURE_MISSING_FIELD} 'exp'`)
    })

    it('should throw ValidationError for missing iat field', () => {
      const data = createValidTokenData()
      delete data.iat
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(`${errorMessages.TOKEN_STRUCTURE_MISSING_FIELD} 'iat'`)
    })

    it('should throw ValidationError for missing version field', () => {
      const data = createValidTokenData()
      delete data.version
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(`${errorMessages.TOKEN_STRUCTURE_MISSING_FIELD} 'version'`)
    })

    it('should throw ValidationError for empty encrypted field', () => {
      const data = createValidTokenData()
      data.encrypted = ''
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(errorMessages.TOKEN_STRUCTURE_ENCRYPTED_FIELD)
    })

    it('should throw ValidationError for non-string encrypted field', () => {
      const data = createValidTokenData()
      data.encrypted = 123 as any
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(errorMessages.TOKEN_STRUCTURE_ENCRYPTED_FIELD)
    })

    it('should throw ValidationError for empty iv field', () => {
      const data = createValidTokenData()
      data.iv = ''
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(errorMessages.TOKEN_STRUCTURE_IV_FIELD)
    })

    it('should throw ValidationError for non-string iv field', () => {
      const data = createValidTokenData()
      data.iv = 123 as any
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(errorMessages.TOKEN_STRUCTURE_IV_FIELD)
    })

    it('should throw ValidationError for empty tag field', () => {
      const data = createValidTokenData()
      data.tag = ''
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(errorMessages.TOKEN_STRUCTURE_TAG_FIELD)
    })

    it('should throw ValidationError for non-string tag field', () => {
      const data = createValidTokenData()
      data.tag = 123 as any
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(errorMessages.TOKEN_STRUCTURE_TAG_FIELD)
    })

    it('should throw ValidationError for non-integer exp field', () => {
      const data = createValidTokenData()
      data.exp = 123.45 as any
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(errorMessages.TOKEN_STRUCTURE_EXP_FIELD)
    })

    it('should throw ValidationError for negative exp field', () => {
      const data = createValidTokenData()
      data.exp = -1
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(errorMessages.TOKEN_STRUCTURE_EXP_FIELD)
    })

    it('should throw ValidationError for zero exp field', () => {
      const data = createValidTokenData()
      data.exp = 0
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(errorMessages.TOKEN_STRUCTURE_EXP_FIELD)
    })

    it('should throw ValidationError for non-number exp field', () => {
      const data = createValidTokenData()
      data.exp = '123' as any
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(errorMessages.TOKEN_STRUCTURE_EXP_FIELD)
    })

    it('should throw ValidationError for non-integer iat field', () => {
      const data = createValidTokenData()
      data.iat = 123.45 as any
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(errorMessages.TOKEN_STRUCTURE_IAT_FIELD)
    })

    it('should throw ValidationError for negative iat field', () => {
      const data = createValidTokenData()
      data.iat = -1
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(errorMessages.TOKEN_STRUCTURE_IAT_FIELD)
    })

    it('should throw ValidationError for zero iat field', () => {
      const data = createValidTokenData()
      data.iat = 0
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(errorMessages.TOKEN_STRUCTURE_IAT_FIELD)
    })

    it('should throw ValidationError for non-number iat field', () => {
      const data = createValidTokenData()
      data.iat = '123' as any
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(errorMessages.TOKEN_STRUCTURE_IAT_FIELD)
    })

    it('should throw ValidationError for empty version field', () => {
      const data = createValidTokenData()
      data.version = ''
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(errorMessages.TOKEN_STRUCTURE_VERSION_FIELD)
    })

    it('should throw ValidationError for non-string version field', () => {
      const data = createValidTokenData()
      data.version = 123 as any
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(errorMessages.TOKEN_STRUCTURE_VERSION_FIELD)
    })

    it('should throw ValidationError when iat is greater than exp', () => {
      const data = createValidTokenData()
      data.iat = data.exp + 1
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(errorMessages.TOKEN_STRUCTURE_IAT_GREATER_THAN_EXP)
    })

    it('should throw ValidationError when iat is too far in the past', () => {
      const data = createValidTokenData()
      data.iat = Math.floor(Date.now() / 1000) - (366 * 24 * 60 * 60) // More than 1 year ago
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(errorMessages.TOKEN_STRUCTURE_IAT_TOO_FAR_PAST)
    })

    it('should throw ValidationError when exp is too far in the future', () => {
      const data = createValidTokenData()
      data.exp = Math.floor(Date.now() / 1000) + (366 * 24 * 60 * 60) // More than 1 year from now
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(ValidationError)
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).toThrow(errorMessages.TOKEN_STRUCTURE_EXP_TOO_FAR_FUTURE)
    })

    it('should accept iat exactly at the boundary (1 year ago)', () => {
      const data = createValidTokenData()
      data.iat = Math.floor(Date.now() / 1000) - (365 * 24 * 60 * 60) // Exactly 1 year ago
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).not.toThrow()
    })

    it('should accept exp exactly at the boundary (1 year from now)', () => {
      const data = createValidTokenData()
      data.exp = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // Exactly 1 year from now
      expect(() => {
        ErrorHandler.validateTokenDataIntegrity(data)
      }).not.toThrow()
    })
  })
})
