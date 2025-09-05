/**
 * Base error class for JWT operations
 */
export class SecureJWTError extends Error {
  /** Error code identifier */
  public readonly code: string
  /** HTTP status code */
  public readonly statusCode: number

  /**
   * Creates a new SecureJWTError instance
   * @param message - Error message
   * @param code - Error code identifier
   * @param statusCode - HTTP status code (default: 500)
   */
  constructor(message: string, code: string, statusCode: number = 500) {
    super(message)
    this.name = 'SecureJWTError'
    this.code = code
    this.statusCode = statusCode
  }
}

/**
 * Error for validation failures
 */
export class ValidationError extends SecureJWTError {
  /**
   * Creates a new ValidationError instance
   * @param message - Error message
   */
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
  }
}

/**
 * Error for encryption failures
 */
export class EncryptionError extends SecureJWTError {
  /**
   * Creates a new EncryptionError instance
   * @param message - Error message
   */
  constructor(message: string) {
    super(message, 'ENCRYPTION_ERROR', 500)
    this.name = 'EncryptionError'
  }
}

/**
 * Error for decryption failures
 */
export class DecryptionError extends SecureJWTError {
  /**
   * Creates a new DecryptionError instance
   * @param message - Error message
   */
  constructor(message: string) {
    super(message, 'DECRYPTION_ERROR', 500)
    this.name = 'DecryptionError'
  }
}

/**
 * Error for expired tokens
 */
export class TokenExpiredError extends SecureJWTError {
  /**
   * Creates a new TokenExpiredError instance
   * @param message - Error message (default: 'Token has expired')
   */
  constructor(message: string = 'Token has expired') {
    super(message, 'TOKEN_EXPIRED', 401)
    this.name = 'TokenExpiredError'
  }
}

/**
 * Error for invalid tokens
 */
export class TokenInvalidError extends SecureJWTError {
  /**
   * Creates a new TokenInvalidError instance
   * @param message - Error message (default: 'Invalid token')
   */
  constructor(message: string = 'Invalid token') {
    super(message, 'TOKEN_INVALID', 401)
    this.name = 'TokenInvalidError'
  }
}

/**
 * Error for version mismatches
 */
export class VersionMismatchError extends SecureJWTError {
  /**
   * Creates a new VersionMismatchError instance
   * @param message - Error message (default: 'Token version mismatch')
   */
  constructor(message: string = 'Token version mismatch') {
    super(message, 'VERSION_MISMATCH', 400)
    this.name = 'VersionMismatchError'
  }
}

/**
 * Error for oversized payloads
 */
export class PayloadTooLargeError extends SecureJWTError {
  /**
   * Creates a new PayloadTooLargeError instance
   * @param message - Error message (default: 'Payload too large')
   */
  constructor(message: string = 'Payload too large') {
    super(message, 'PAYLOAD_TOO_LARGE', 413)
    this.name = 'PayloadTooLargeError'
  }
}

/**
 * Error for invalid time formats
 */
export class TimeFormatError extends SecureJWTError {
  /**
   * Creates a new TimeFormatError instance
   * @param message - Error message
   */
  constructor(message: string) {
    super(message, 'TIME_FORMAT_ERROR', 400)
    this.name = 'TimeFormatError'
  }
}

/**
 * Error for invalid secret keys
 */
export class SecretKeyError extends SecureJWTError {
  /**
   * Creates a new SecretKeyError instance
   * @param message - Error message
   */
  constructor(message: string) {
    super(message, 'SECRET_KEY_ERROR', 500)
    this.name = 'SecretKeyError'
  }
}
