import {
  SecureJWTError,
  ValidationError,
  EncryptionError,
  DecryptionError,
  TokenExpiredError,
  TokenInvalidError,
  VersionMismatchError,
  PayloadTooLargeError,
  TimeFormatError,
  SecretKeyError
} from '../src/utils/ErrorBase'

describe('ErrorBase', () => {
  describe('SecureJWTError', () => {
    it('should create error with default status code', () => {
      const error = new SecureJWTError('Test error', 'TEST_ERROR')
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_ERROR')
      expect(error.statusCode).toBe(500)
      expect(error.name).toBe('SecureJWTError')
    })

    it('should create error with custom status code', () => {
      const error = new SecureJWTError('Test error', 'TEST_ERROR', 400)
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_ERROR')
      expect(error.statusCode).toBe(400)
      expect(error.name).toBe('SecureJWTError')
    })
  })

  describe('ValidationError', () => {
    it('should create validation error with correct properties', () => {
      const error = new ValidationError('Validation failed')
      expect(error.message).toBe('Validation failed')
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.statusCode).toBe(400)
      expect(error.name).toBe('ValidationError')
    })
  })

  describe('EncryptionError', () => {
    it('should create encryption error with correct properties', () => {
      const error = new EncryptionError('Encryption failed')
      expect(error.message).toBe('Encryption failed')
      expect(error.code).toBe('ENCRYPTION_ERROR')
      expect(error.statusCode).toBe(500)
      expect(error.name).toBe('EncryptionError')
    })
  })

  describe('DecryptionError', () => {
    it('should create decryption error with correct properties', () => {
      const error = new DecryptionError('Decryption failed')
      expect(error.message).toBe('Decryption failed')
      expect(error.code).toBe('DECRYPTION_ERROR')
      expect(error.statusCode).toBe(500)
      expect(error.name).toBe('DecryptionError')
    })
  })

  describe('TokenExpiredError', () => {
    it('should create token expired error with default message', () => {
      const error = new TokenExpiredError()
      expect(error.message).toBe('Token has expired')
      expect(error.code).toBe('TOKEN_EXPIRED')
      expect(error.statusCode).toBe(401)
      expect(error.name).toBe('TokenExpiredError')
    })

    it('should create token expired error with custom message', () => {
      const error = new TokenExpiredError('Custom expired message')
      expect(error.message).toBe('Custom expired message')
      expect(error.code).toBe('TOKEN_EXPIRED')
      expect(error.statusCode).toBe(401)
      expect(error.name).toBe('TokenExpiredError')
    })
  })

  describe('TokenInvalidError', () => {
    it('should create token invalid error with default message', () => {
      const error = new TokenInvalidError()
      expect(error.message).toBe('Invalid token')
      expect(error.code).toBe('TOKEN_INVALID')
      expect(error.statusCode).toBe(401)
      expect(error.name).toBe('TokenInvalidError')
    })

    it('should create token invalid error with custom message', () => {
      const error = new TokenInvalidError('Custom invalid message')
      expect(error.message).toBe('Custom invalid message')
      expect(error.code).toBe('TOKEN_INVALID')
      expect(error.statusCode).toBe(401)
      expect(error.name).toBe('TokenInvalidError')
    })
  })

  describe('VersionMismatchError', () => {
    it('should create version mismatch error with default message', () => {
      const error = new VersionMismatchError()
      expect(error.message).toBe('Token version mismatch')
      expect(error.code).toBe('VERSION_MISMATCH')
      expect(error.statusCode).toBe(400)
      expect(error.name).toBe('VersionMismatchError')
    })

    it('should create version mismatch error with custom message', () => {
      const error = new VersionMismatchError('Custom version message')
      expect(error.message).toBe('Custom version message')
      expect(error.code).toBe('VERSION_MISMATCH')
      expect(error.statusCode).toBe(400)
      expect(error.name).toBe('VersionMismatchError')
    })
  })

  describe('PayloadTooLargeError', () => {
    it('should create payload too large error with default message', () => {
      const error = new PayloadTooLargeError()
      expect(error.message).toBe('Payload too large')
      expect(error.code).toBe('PAYLOAD_TOO_LARGE')
      expect(error.statusCode).toBe(413)
      expect(error.name).toBe('PayloadTooLargeError')
    })

    it('should create payload too large error with custom message', () => {
      const error = new PayloadTooLargeError('Custom payload message')
      expect(error.message).toBe('Custom payload message')
      expect(error.code).toBe('PAYLOAD_TOO_LARGE')
      expect(error.statusCode).toBe(413)
      expect(error.name).toBe('PayloadTooLargeError')
    })
  })

  describe('TimeFormatError', () => {
    it('should create time format error with correct properties', () => {
      const error = new TimeFormatError('Invalid time format')
      expect(error.message).toBe('Invalid time format')
      expect(error.code).toBe('TIME_FORMAT_ERROR')
      expect(error.statusCode).toBe(400)
      expect(error.name).toBe('TimeFormatError')
    })
  })

  describe('SecretKeyError', () => {
    it('should create secret key error with correct properties', () => {
      const error = new SecretKeyError('Invalid secret key')
      expect(error.message).toBe('Invalid secret key')
      expect(error.code).toBe('SECRET_KEY_ERROR')
      expect(error.statusCode).toBe(500)
      expect(error.name).toBe('SecretKeyError')
    })
  })
})