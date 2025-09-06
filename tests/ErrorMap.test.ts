import { errorCodes, errorMessages } from '../src/utils/ErrorMap'

describe('ErrorMap', () => {
  describe('errorCodes', () => {
    it('should contain all expected error codes', () => {
      expect(errorCodes).toHaveProperty('VALIDATION_ERROR')
      expect(errorCodes).toHaveProperty('ENCRYPTION_ERROR')
      expect(errorCodes).toHaveProperty('DECRYPTION_ERROR')
      expect(errorCodes).toHaveProperty('TOKEN_EXPIRED')
      expect(errorCodes).toHaveProperty('TOKEN_INVALID')
      expect(errorCodes).toHaveProperty('VERSION_MISMATCH')
      expect(errorCodes).toHaveProperty('PAYLOAD_TOO_LARGE')
      expect(errorCodes).toHaveProperty('TIME_FORMAT_ERROR')
      expect(errorCodes).toHaveProperty('SECRET_KEY_ERROR')
    })

    it('should have correct error code values', () => {
      expect(errorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR')
      expect(errorCodes.ENCRYPTION_ERROR).toBe('ENCRYPTION_ERROR')
      expect(errorCodes.DECRYPTION_ERROR).toBe('DECRYPTION_ERROR')
      expect(errorCodes.TOKEN_EXPIRED).toBe('TOKEN_EXPIRED')
      expect(errorCodes.TOKEN_INVALID).toBe('TOKEN_INVALID')
      expect(errorCodes.VERSION_MISMATCH).toBe('VERSION_MISMATCH')
      expect(errorCodes.PAYLOAD_TOO_LARGE).toBe('PAYLOAD_TOO_LARGE')
      expect(errorCodes.TIME_FORMAT_ERROR).toBe('TIME_FORMAT_ERROR')
      expect(errorCodes.SECRET_KEY_ERROR).toBe('SECRET_KEY_ERROR')
    })

    it('should have consistent structure', () => {
      expect(Object.keys(errorCodes)).toHaveLength(9)
    })
  })

  describe('errorMessages', () => {
    it('should contain all expected error messages', () => {
      expect(errorMessages).toHaveProperty('DATA_NULL_UNDEFINED')
      expect(errorMessages).toHaveProperty('DATA_INVALID_TYPE')
      expect(errorMessages).toHaveProperty('TOKEN_EXPIRED')
      expect(errorMessages).toHaveProperty('TOKEN_INVALID')
      expect(errorMessages).toHaveProperty('TOKEN_MALFORMED')
      expect(errorMessages).toHaveProperty('VERSION_MISMATCH')
      expect(errorMessages).toHaveProperty('PAYLOAD_TOO_LARGE')
      expect(errorMessages).toHaveProperty('EXPIRATION_TOO_FAR')
      expect(errorMessages).toHaveProperty('TIME_FORMAT_INVALID')
      expect(errorMessages).toHaveProperty('TIME_VALUE_NEGATIVE')
      expect(errorMessages).toHaveProperty('TIME_UNIT_UNSUPPORTED')
      expect(errorMessages).toHaveProperty('SECRET_TOO_SHORT')
      expect(errorMessages).toHaveProperty('SECRET_INVALID_CHARS')
      expect(errorMessages).toHaveProperty('ENCRYPTION_FAILED')
      expect(errorMessages).toHaveProperty('DECRYPTION_FAILED')
      expect(errorMessages).toHaveProperty('AUTH_TAG_INVALID')
      expect(errorMessages).toHaveProperty('IV_INVALID')
      expect(errorMessages).toHaveProperty('KEY_DERIVATION_FAILED')
    })

    it('should have meaningful error messages', () => {
      expect(errorMessages.DATA_NULL_UNDEFINED).toBe('Data cannot be null or undefined')
      expect(errorMessages.DATA_INVALID_TYPE).toBe('Invalid data type provided')
      expect(errorMessages.TOKEN_EXPIRED).toBe('Token has expired')
      expect(errorMessages.TOKEN_INVALID).toBe('Invalid token format or structure')
      expect(errorMessages.TOKEN_MALFORMED).toBe('Token is malformed or corrupted')
      expect(errorMessages.VERSION_MISMATCH).toBe('Token version does not match expected version')
      expect(errorMessages.PAYLOAD_TOO_LARGE).toBe('Payload size exceeds maximum limit of 8KB')
      expect(errorMessages.EXPIRATION_TOO_FAR).toBe('Token expiration is too far in the future (max 1 year)')
      expect(errorMessages.TIME_FORMAT_INVALID).toBe('Invalid time format. Expected format: number + unit (ms, s, m, h, d, M, y)')
      expect(errorMessages.TIME_VALUE_NEGATIVE).toBe('Time value must be positive')
      expect(errorMessages.TIME_UNIT_UNSUPPORTED).toBe('Unsupported time unit')
      expect(errorMessages.SECRET_TOO_SHORT).toBe('Secret key must be at least 8 characters long')
      expect(errorMessages.SECRET_INVALID_CHARS).toBe('Secret key contains invalid characters')
      expect(errorMessages.ENCRYPTION_FAILED).toBe('Encryption operation failed')
      expect(errorMessages.DECRYPTION_FAILED).toBe('Decryption failed')
      expect(errorMessages.AUTH_TAG_INVALID).toBe('Authentication tag verification failed')
      expect(errorMessages.IV_INVALID).toBe('Invalid initialization vector')
      expect(errorMessages.KEY_DERIVATION_FAILED).toBe('Key derivation failed')
      expect(errorMessages.INVALID_ALGORITHM).toBe('Invalid encryption algorithm. Supported algorithms: aes-256-gcm, chacha20-poly1305')
    })

    it('should have consistent structure', () => {
      expect(Object.keys(errorMessages)).toHaveLength(68)
    })

    it('should have all messages as strings', () => {
      Object.values(errorMessages).forEach(message => {
        expect(typeof message).toBe('string')
        expect(message.length).toBeGreaterThan(0)
      })
    })
  })
})
