import {
  SecureJWTError,
  ValidationError,
  TimeFormatError,
  SecretKeyError,
  EncryptionError,
  DecryptionError,
  PayloadTooLargeError,
  TokenExpiredError,
  VersionMismatchError,
  getErrorMessage
} from '@utils/index'

/**
 * Provides error handling utilities for validation and error management
 */
export class ErrorHandler {
  /**
   * Wraps a function with error handling to catch and transform errors
   * @param fn - The function to wrap with error handling
   * @param errorMapper - The optional function to map caught errors to SecureJWTError instances
   * @returns The wrapped function that handles errors automatically
   */
  static wrap<T extends unknown[], R>(
    fn: (...args: T) => R,
    errorMapper?: (error: unknown) => SecureJWTError
  ): (...args: T) => R {
    return (...args: T): R => {
      try {
        return fn(...args)
      } catch (error) {
        if (errorMapper) {
          throw errorMapper(error)
        }
        if (error instanceof SecureJWTError) {
          throw error
        }
        throw new SecureJWTError(
          error instanceof Error ? error.message : getErrorMessage('UNKNOWN_ERROR'),
          'UNKNOWN_ERROR',
          500
        )
      }
    }
  }

  /**
   * Validates that input data is not null or undefined
   * @param data - The data to validate
   * @throws {ValidationError} when data is null or undefined
   */
  static validateData(data: unknown): void {
    if (data === null || data === undefined) {
      throw new ValidationError(getErrorMessage('DATA_NULL_UNDEFINED'))
    }
    if (typeof data === 'string' && data.length === 0) {
      throw new ValidationError(getErrorMessage('DATA_EMPTY_STRING'))
    }
  }

  /**
   * Validates that time string is a non-empty string
   * @param timeString - The time string to validate
   * @throws {TimeFormatError} when time string is not a string or is empty
   */
  static validateTimeString(timeString: string): void {
    if (typeof timeString !== 'string' || timeString.length === 0) {
      throw new TimeFormatError(getErrorMessage('TIME_STRING_NON_EMPTY'))
    }
  }

  /**
   * Validates that options parameter is a valid object
   * @param options - The options object to validate
   * @throws {ValidationError} when options is null, undefined, or not an object
   */
  static validateOptions(options: unknown): void {
    if (options == null || typeof options !== 'object') {
      throw new ValidationError(getErrorMessage('OPTIONS_MUST_BE_OBJECT'))
    }
  }

  /**
   * Validates that expireIn parameter is a non-empty string
   * @param expireIn - The expiration time string to validate
   * @throws {ValidationError} when expireIn is null, undefined, or not a string
   */
  static validateExpireIn(expireIn: unknown): void {
    if (expireIn == null || typeof expireIn !== 'string') {
      throw new ValidationError(getErrorMessage('EXPIRE_IN_REQUIRED'))
    }
  }

  /**
   * Validates token string format and ensures it's not empty
   * @param token - The token string to validate
   * @throws {ValidationError} when token is not a string or is empty
   */
  static validateToken(token: string): void {
    if (typeof token !== 'string') {
      throw new ValidationError(getErrorMessage('TOKEN_MUST_BE_STRING'))
    }
    if (token.length === 0) {
      throw new ValidationError(getErrorMessage('TOKEN_CANNOT_BE_EMPTY'))
    }
  }

  /**
   * Validates secret key format, length, and character requirements
   * @param secret - The secret key to validate
   * @throws {ValidationError} when secret is not a string
   * @throws {SecretKeyError} when secret is too short or contains invalid characters
   */
  static validateSecret(secret: string): void {
    if (typeof secret !== 'string') {
      throw new ValidationError(getErrorMessage('SECRET_MUST_BE_STRING'))
    }
    if (secret.length < 8) {
      throw new SecretKeyError(getErrorMessage('SECRET_TOO_SHORT'))
    }
    if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/.test(secret)) {
      throw new SecretKeyError(getErrorMessage('SECRET_INVALID_CHARS'))
    }
  }

  /**
   * Validates version string format (must be semantic version format)
   * @param version - The version string to validate
   * @throws {ValidationError} when version is not a string, empty, or invalid format
   */
  static validateVersion(version: string): void {
    if (typeof version !== 'string') {
      throw new ValidationError(getErrorMessage('VERSION_MUST_BE_STRING'))
    }
    if (version.length === 0) {
      throw new ValidationError(getErrorMessage('VERSION_CANNOT_BE_EMPTY'))
    }
    if (!/^\d+\.\d+\.\d+$/.test(version)) {
      throw new ValidationError(getErrorMessage('VERSION_INVALID_FORMAT'))
    }
  }

  /**
   * Validates payload size against maximum allowed size
   * @param payload - The payload string to validate
   * @param maxSize - The maximum allowed size in bytes (default: 8192)
   * @throws {PayloadTooLargeError} when payload exceeds maximum size
   */
  static validatePayloadSize(payload: string, maxSize: number = 8192): void {
    const byteLength = Buffer.byteLength(payload, 'utf8')
    if (byteLength > maxSize) {
      throw new PayloadTooLargeError(getErrorMessage('PAYLOAD_TOO_LARGE'))
    }
  }

  /**
   * Validates expiration time against maximum allowed expiration
   * @param exp - The expiration timestamp to validate
   * @param maxExp - The maximum allowed expiration timestamp
   * @throws {ValidationError} when expiration is too far in the future
   */
  static validateExpiration(exp: number, maxExp: number): void {
    if (exp > maxExp) {
      throw new ValidationError(getErrorMessage('EXPIRATION_TOO_FAR'))
    }
  }

  /**
   * Validates if token has expired by comparing with current time
   * @param exp - The expiration timestamp to validate
   * @throws {TokenExpiredError} when token has expired
   */
  static checkTokenExpiration(exp: number): void {
    const now = Math.floor(Date.now() / 1000)
    if (exp < now) {
      throw new TokenExpiredError(getErrorMessage('TOKEN_EXPIRED'))
    }
  }

  /**
   * Validates version compatibility between token and expected version
   * @param tokenVersion - The token version to validate
   * @param expectedVersion - The expected version to validate against
   * @throws {VersionMismatchError} when versions do not match
   */
  static validateVersionCompatibility(tokenVersion: string, expectedVersion: string): void {
    if (tokenVersion !== expectedVersion) {
      throw new VersionMismatchError(getErrorMessage('VERSION_MISMATCH'))
    }
  }

  /**
   * Validates data string for encryption requirements
   * @param data - The data string to validate
   * @throws {ValidationError} when data is null, undefined, or not a string
   */
  static validateEncryptionData(data: string): void {
    if (data == null || typeof data !== 'string') {
      throw new ValidationError(getErrorMessage('DATA_NON_EMPTY_STRING'))
    }
  }

  /**
   * Validates encrypted token structure and required properties
   * @param tokenEncrypted - The encrypted token object to validate
   * @throws {ValidationError} when token structure is invalid or missing required properties
   */
  static validateTokenEncrypted(tokenEncrypted: unknown): void {
    if (tokenEncrypted == null || typeof tokenEncrypted !== 'object') {
      throw new ValidationError(getErrorMessage('TOKEN_ENCRYPTED_MUST_BE_OBJECT'))
    }
    if (
      !('encrypted' in tokenEncrypted) ||
      !('iv' in tokenEncrypted) ||
      !('tag' in tokenEncrypted)
    ) {
      throw new ValidationError(getErrorMessage('TOKEN_ENCRYPTED_MISSING_PROPERTIES'))
    }
  }

  /**
   * Validates initialization vector (IV) format for decryption
   * @param iv - The initialization vector string to validate
   * @throws {DecryptionError} when IV format is invalid
   */
  static validateIVFormat(iv: string): void {
    if (iv == null || !/^[0-9a-fA-F]{32}$/.test(iv)) {
      throw new DecryptionError(getErrorMessage('INVALID_IV_FORMAT'))
    }
  }

  /**
   * Validates authentication tag format for decryption
   * @param tag - The authentication tag string to validate
   * @throws {DecryptionError} when tag format is invalid
   */
  static validateTagFormat(tag: string): void {
    if (tag == null || !/^[0-9a-fA-F]{32}$/.test(tag)) {
      throw new DecryptionError(getErrorMessage('INVALID_AUTH_TAG_FORMAT'))
    }
  }

  /**
   * Validates key length for AES-256 encryption
   * @param key - The key buffer to validate
   * @throws {EncryptionError} when key length is invalid for AES-256
   */
  static validateKeyLength(key: Buffer): void {
    if (key == null || key.length !== 32) {
      throw new EncryptionError(getErrorMessage('INVALID_KEY_LENGTH'))
    }
  }

  /**
   * Validates authentication tag buffer for encryption
   * @param tag - The authentication tag buffer to validate
   * @throws {EncryptionError} when tag is null or empty
   */
  static validateAuthTag(tag: Buffer): void {
    if (tag == null || tag.length === 0) {
      throw new EncryptionError(getErrorMessage('FAILED_TO_GENERATE_AUTH_TAG'))
    }
  }

  /**
   * Validates token timestamps consistency between payload and token
   * @param payloadExp - The payload expiration timestamp to validate
   * @param tokenExp - The token expiration timestamp to validate
   * @param payloadIat - The payload issued at timestamp to validate
   * @param tokenIat - The token issued at timestamp to validate
   * @throws {ValidationError} when timestamps do not match
   */
  static validateTokenTimestamps(
    payloadExp: number,
    tokenExp: number,
    payloadIat: number,
    tokenIat: number
  ): void {
    if (payloadExp !== tokenExp || payloadIat !== tokenIat) {
      throw new ValidationError(getErrorMessage('TOKEN_TIMESTAMP_MISMATCH'))
    }
  }

  /**
   * Validates and parses JSON string safely
   * @param jsonString - The JSON string to parse
   * @param errorMessage - The error message to use when parsing fails
   * @returns The parsed JSON object
   * @throws {ValidationError} when JSON parsing fails
   */
  static validateJSONParse<T>(jsonString: string, errorMessage: string): T {
    try {
      return JSON.parse(jsonString) as T
    } catch {
      throw new ValidationError(errorMessage)
    }
  }

  /**
   * Validates and decodes base64 string safely
   * @param token - The base64 encoded token to decode
   * @param errorMessage - The error message to use when decoding fails
   * @returns The decoded string
   * @throws {ValidationError} when base64 decoding fails
   */
  static validateBase64Decode(token: string, errorMessage: string): string {
    try {
      return Buffer.from(token, 'base64').toString('utf8')
    } catch {
      throw new ValidationError(errorMessage)
    }
  }

  /**
   * Validates token integrity and base64 format structure
   * @param token - The token string to validate
   * @throws {ValidationError} when token format is invalid
   */
  static validateTokenIntegrity(token: string): void {
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(token)) {
      throw new ValidationError(getErrorMessage('TOKEN_FORMAT_NOT_BASE64'))
    }
    if (token.length < 10) {
      throw new ValidationError(getErrorMessage('TOKEN_FORMAT_TOO_SHORT'))
    }
    if (token.length > 100000) {
      throw new ValidationError(getErrorMessage('TOKEN_FORMAT_TOO_LONG'))
    }
    const paddingCount = (token.match(/=/g) ?? []).length
    if (paddingCount > 2) {
      throw new ValidationError(getErrorMessage('TOKEN_FORMAT_INVALID_PADDING'))
    }
    if (token.length % 4 !== 0) {
      throw new ValidationError(getErrorMessage('TOKEN_FORMAT_INVALID_LENGTH'))
    }
  }

  /**
   * Validates token data structure integrity and required fields
   * @param tokenData - The token data object to validate
   * @throws {ValidationError} when token data structure is invalid
   */
  static validateTokenDataIntegrity(tokenData: unknown): void {
    if (tokenData === null || tokenData === undefined || typeof tokenData !== 'object') {
      throw new ValidationError(getErrorMessage('TOKEN_STRUCTURE_NOT_OBJECT'))
    }
    const data = tokenData as Record<string, unknown>
    const requiredFields = ['encrypted', 'iv', 'tag', 'exp', 'iat', 'version']
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new ValidationError(`${getErrorMessage('TOKEN_STRUCTURE_MISSING_FIELD')} '${field}'`)
      }
    }
    if (typeof data['encrypted'] !== 'string' || data['encrypted'].length === 0) {
      throw new ValidationError(getErrorMessage('TOKEN_STRUCTURE_ENCRYPTED_FIELD'))
    }
    if (typeof data['iv'] !== 'string' || data['iv'].length === 0) {
      throw new ValidationError(getErrorMessage('TOKEN_STRUCTURE_IV_FIELD'))
    }
    if (typeof data['tag'] !== 'string' || data['tag'].length === 0) {
      throw new ValidationError(getErrorMessage('TOKEN_STRUCTURE_TAG_FIELD'))
    }
    if (typeof data['exp'] !== 'number' || !Number.isInteger(data['exp']) || data['exp'] <= 0) {
      throw new ValidationError(getErrorMessage('TOKEN_STRUCTURE_EXP_FIELD'))
    }
    if (typeof data['iat'] !== 'number' || !Number.isInteger(data['iat']) || data['iat'] <= 0) {
      throw new ValidationError(getErrorMessage('TOKEN_STRUCTURE_IAT_FIELD'))
    }
    if (typeof data['version'] !== 'string' || data['version'].length === 0) {
      throw new ValidationError(getErrorMessage('TOKEN_STRUCTURE_VERSION_FIELD'))
    }
    if (data['iat'] > data['exp']) {
      throw new ValidationError(getErrorMessage('TOKEN_STRUCTURE_IAT_GREATER_THAN_EXP'))
    }
    const now = Math.floor(Date.now() / 1000)
    const maxPast = 365 * 24 * 60 * 60
    const maxFuture = 365 * 24 * 60 * 60
    if (data['iat'] < now - maxPast) {
      throw new ValidationError(getErrorMessage('TOKEN_STRUCTURE_IAT_TOO_FAR_PAST'))
    }
    if (data['exp'] > now + maxFuture) {
      throw new ValidationError(getErrorMessage('TOKEN_STRUCTURE_EXP_TOO_FAR_FUTURE'))
    }
  }
}
