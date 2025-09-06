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
 * Handles errors and validates data
 */
export class ErrorHandler {
  /**
   * Wraps a function to catch and handle errors
   * @param fn - Function to wrap
   * @param errorMapper - Optional function to map errors to SecureJWTError
   * @returns Wrapped function with error handling
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
   * Checks if data is valid
   * @param data - Data to check
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
   * Checks if time string is valid
   * @param timeString - Time string to check
   * @throws {TimeFormatError} when time string is not a string or is empty
   */
  static validateTimeString(timeString: string): void {
    if (typeof timeString !== 'string' || timeString.length === 0) {
      throw new TimeFormatError(getErrorMessage('TIME_STRING_NON_EMPTY'))
    }
  }

  /**
   * Checks if options is a valid object
   * @param options - Options to check
   * @throws {ValidationError} when options is null, undefined, or not an object
   */
  static validateOptions(options: unknown): void {
    if (options == null || typeof options !== 'object') {
      throw new ValidationError(getErrorMessage('OPTIONS_MUST_BE_OBJECT'))
    }
  }

  /**
   * Checks if expireIn is a valid string
   * @param expireIn - Expiration time string to check
   * @throws {ValidationError} when expireIn is null, undefined, or not a string
   */
  static validateExpireIn(expireIn: unknown): void {
    if (expireIn == null || typeof expireIn !== 'string') {
      throw new ValidationError(getErrorMessage('EXPIRE_IN_REQUIRED'))
    }
  }

  /**
   * Checks if token is a valid string
   * @param token - Token string to check
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
   * Checks if secret key meets requirements
   * @param secret - Secret key to check
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
    if (secret.length > 255) {
      throw new SecretKeyError(getErrorMessage('SECRET_TOO_LONG'))
    }
    for (let i = 0; i < secret.length; i++) {
      const charCode = secret.charCodeAt(i)
      if (charCode < 32 || charCode === 127) {
        throw new SecretKeyError(getErrorMessage('SECRET_INVALID_CHARS'))
      }
    }
  }

  /**
   * Checks if version string is valid
   * @param version - Version string to check
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
   * Checks if cache size is valid
   * @param cached - Cache size to check
   * @throws {ValidationError} when cache size is invalid
   */
  static validateCacheSize(cached: number): void {
    if (typeof cached !== 'number' || !Number.isInteger(cached)) {
      throw new ValidationError(getErrorMessage('CACHE_SIZE_MUST_BE_INTEGER'))
    }
    if (cached < 1) {
      throw new ValidationError(getErrorMessage('CACHE_SIZE_TOO_SMALL'))
    }
    if (cached > 10000) {
      throw new ValidationError(getErrorMessage('CACHE_SIZE_TOO_LARGE'))
    }
  }

  /**
   * Checks if payload size is within limits
   * @param payload - Payload string to check
   * @param maxSize - Maximum allowed size in bytes (default: 8192)
   * @throws {PayloadTooLargeError} when payload exceeds maximum size
   */
  static validatePayloadSize(payload: string, maxSize: number = 8192): void {
    const byteLength = Buffer.byteLength(payload, 'utf8')
    if (byteLength > maxSize) {
      throw new PayloadTooLargeError(getErrorMessage('PAYLOAD_TOO_LARGE'))
    }
  }

  /**
   * Checks if expiration time is within limits
   * @param exp - Expiration timestamp to check
   * @param maxExp - Maximum allowed expiration timestamp
   * @throws {ValidationError} when expiration is too far in the future
   */
  static validateExpiration(exp: number, maxExp: number): void {
    if (exp > maxExp) {
      throw new ValidationError(getErrorMessage('EXPIRATION_TOO_FAR'))
    }
  }

  /**
   * Checks if token has expired
   * @param exp - Expiration timestamp to check
   * @throws {TokenExpiredError} when token has expired
   */
  static checkTokenExpiration(exp: number): void {
    const now = Math.floor(Date.now() / 1000)
    if (exp < now) {
      throw new TokenExpiredError(getErrorMessage('TOKEN_EXPIRED'))
    }
  }

  /**
   * Checks if token version matches expected version
   * @param tokenVersion - Token version to check
   * @param expectedVersion - Expected version to check against
   * @throws {VersionMismatchError} when versions do not match
   */
  static validateVersionCompatibility(tokenVersion: string, expectedVersion: string): void {
    if (tokenVersion !== expectedVersion) {
      if (this.compareVersions(tokenVersion, expectedVersion) < 0) {
        throw new VersionMismatchError(getErrorMessage('VERSION_DOWNGRADE_ATTACK'))
      }
      if (this.compareVersions(tokenVersion, expectedVersion) > 0) {
        throw new VersionMismatchError(getErrorMessage('VERSION_UPGRADE_NOT_SUPPORTED'))
      }
      throw new VersionMismatchError(getErrorMessage('VERSION_MISMATCH'))
    }
  }

  /**
   * Compares two version strings
   * @param version1 - First version to compare
   * @param version2 - Second version to compare
   * @returns -1 if version1 < version2, 0 if equal, 1 if version1 > version2
   */
  private static compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number)
    const v2Parts = version2.split('.').map(Number)
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] ?? 0
      const v2Part = v2Parts[i] ?? 0
      if (v1Part < v2Part) {
        return -1
      }
      if (v1Part > v2Part) {
        return 1
      }
    }
    return 0
  }

  /**
   * Checks if data string is valid for encryption
   * @param data - Data string to check
   * @throws {ValidationError} when data is null, undefined, or not a string
   */
  static validateEncryptionData(data: string): void {
    if (data == null || typeof data !== 'string') {
      throw new ValidationError(getErrorMessage('DATA_NON_EMPTY_STRING'))
    }
  }

  /**
   * Checks if encrypted token has required properties
   * @param tokenEncrypted - Encrypted token object to check
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
   * Checks if IV format is valid
   * @param iv - Initialization vector string to check
   * @throws {DecryptionError} when IV format is invalid
   */
  static validateIVFormat(iv: string): void {
    if (iv == null || !/^[0-9a-fA-F]{24,32}$/.test(iv)) {
      throw new DecryptionError(getErrorMessage('INVALID_IV_FORMAT'))
    }
  }

  /**
   * Checks if authentication tag format is valid
   * @param tag - Authentication tag string to check
   * @throws {DecryptionError} when tag format is invalid
   */
  static validateTagFormat(tag: string): void {
    if (tag == null || !/^[0-9a-fA-F]{32}$/.test(tag)) {
      throw new DecryptionError(getErrorMessage('INVALID_AUTH_TAG_FORMAT'))
    }
  }

  /**
   * Checks if key length is valid for encryption
   * @param key - Key buffer to check
   * @throws {EncryptionError} when key length is invalid
   */
  static validateKeyLength(key: Buffer): void {
    if (key == null || key.length !== 32) {
      throw new EncryptionError(getErrorMessage('INVALID_KEY_LENGTH'))
    }
  }

  /**
   * Checks if authentication tag buffer is valid
   * @param tag - Authentication tag buffer to check
   * @throws {EncryptionError} when tag is null or empty
   */
  static validateAuthTag(tag: Buffer): void {
    if (tag == null || tag.length === 0) {
      throw new EncryptionError(getErrorMessage('FAILED_TO_GENERATE_AUTH_TAG'))
    }
  }

  /**
   * Checks if token timestamps match between payload and token
   * @param payloadExp - Payload expiration timestamp to check
   * @param tokenExp - Token expiration timestamp to check
   * @param payloadIat - Payload issued at timestamp to check
   * @param tokenIat - Token issued at timestamp to check
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
   * Parses JSON string safely
   * @param jsonString - JSON string to parse
   * @param errorMessage - Error message to use when parsing fails
   * @returns Parsed JSON object
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
   * Decodes base64 string safely
   * @param token - Base64 encoded token to decode
   * @param errorMessage - Error message to use when decoding fails
   * @returns Decoded string
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
   * Checks if token has valid base64 format
   * @param token - Token string to check
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
   * Checks if token data has required fields and valid structure
   * @param tokenData - Token data object to check
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
