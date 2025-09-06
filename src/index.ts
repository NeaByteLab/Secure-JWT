import type {
  JWTOptions,
  TokenEncrypted,
  TokenData,
  PayloadData,
  IEncryptionAlgo
} from '@interfaces/index'
import Algorithms from '@algorithms/index'
import {
  Cache,
  ValidationError,
  EncryptionError,
  DecryptionError,
  PayloadTooLargeError,
  TokenExpiredError,
  VersionMismatchError,
  ErrorHandler,
  isValidTokenData,
  isValidPayloadData,
  parsetimeToMs,
  getErrorMessage
} from '@utils/index'

/**
 * JWT token handler with encryption
 * Creates, verifies, and extracts data from tokens
 */
export default class SecureJWT {
  /** Encryption algorithm */
  readonly #algorithm: IEncryptionAlgo
  /** Key derivation method */
  readonly #keyDerivation: string
  /** Secret key for encryption */
  readonly #secret: Buffer
  /** Expiration time in milliseconds */
  readonly #expireInMs: number
  /** Token version */
  readonly #version: string
  /** Cache for decrypted payload data */
  readonly #payloadCache: Cache<unknown>
  /** Cache for token verification results */
  readonly #verifyCache: Cache<boolean>

  /**
   * Creates a new SecureJWT instance
   * @param options - Token configuration with expiration, secret key, and version
   */
  constructor(options: JWTOptions) {
    ErrorHandler.validateOptions(options)
    ErrorHandler.validateExpireIn(options.expireIn)
    ErrorHandler.validateSecret(options.secret)
    if (options.keyDerivation !== undefined) {
      ErrorHandler.validateKeyDerivation(options.keyDerivation)
    }
    if (options.version !== undefined) {
      ErrorHandler.validateVersion(options.version)
    }
    if (options.cached !== undefined) {
      ErrorHandler.validateCacheSize(options.cached)
    }
    this.#algorithm = Algorithms.getInstance(options.algorithm ?? 'aes-256-gcm')
    this.#keyDerivation = options.keyDerivation ?? 'basic'
    this.#secret = this.generateSecret(options.secret)
    this.#expireInMs = parsetimeToMs(options.expireIn)
    this.#version = options.version ?? '1.0.0'
    this.#payloadCache = new Cache<unknown>(options.cached ?? 1000, this.#expireInMs)
    this.#verifyCache = new Cache<boolean>(options.cached ?? 1000, this.#expireInMs)
  }

  /**
   * Creates a secret key from the provided string
   * @param secret - Secret string for key generation
   * @returns Buffer containing the secret key
   */
  private generateSecret(secret: string): Buffer {
    if (this.#keyDerivation === 'pbkdf2') {
      return Algorithms.getDerivedKeyPBKDF2(secret)
    } else if (this.#keyDerivation === 'basic') {
      return Algorithms.getDerivedKeyBasic(secret)
    } else {
      throw new ValidationError(getErrorMessage('INVALID_KEY_DERIVATION_METHOD'))
    }
  }

  /**
   * Encrypts data using the configured algorithm
   * @param data - String data to encrypt
   * @returns Object with encrypted data, IV, and authentication tag
   */
  private encrypt(data: string): TokenEncrypted {
    ErrorHandler.validateEncryptionData(data)
    const key = this.#secret.subarray(0, 32)
    ErrorHandler.validateKeyLength(key)
    const iv = Algorithms.getRandomBytes(this.#algorithm.getIVLength())
    return this.#algorithm.encrypt(data, key, iv, this.#version)
  }

  /**
   * Decrypts data using the configured algorithm
   * @param tokenEncrypted - Object with encrypted data, IV, and authentication tag
   * @returns Decrypted data as string
   */
  private decrypt(tokenEncrypted: TokenEncrypted): string {
    try {
      ErrorHandler.validateTokenEncrypted(tokenEncrypted)
      const key = this.#secret.subarray(0, 32)
      ErrorHandler.validateKeyLength(key)
      ErrorHandler.validateIVFormat(tokenEncrypted.iv)
      ErrorHandler.validateTagFormat(tokenEncrypted.tag)
      return this.#algorithm.decrypt(tokenEncrypted, key, this.#version)
    } catch (error) {
      if (error instanceof ValidationError || error instanceof DecryptionError) {
        throw error
      }
      throw new DecryptionError(
        `${getErrorMessage('DECRYPTION_FAILED')}: ${error instanceof Error ? error.message : getErrorMessage('UNKNOWN_ERROR')}`
      )
    }
  }

  /**
   * Creates a JWT token from data
   * @param data - Data to include in the token (will be JSON stringified)
   * @returns JWT token string
   */
  sign(data: unknown): string {
    try {
      ErrorHandler.validateData(data)
      const now = Math.floor(Date.now() / 1000)
      const exp = now + Math.max(1, Math.floor(this.#expireInMs / 1000))
      const maxExp = now + 365 * 24 * 60 * 60
      ErrorHandler.validateExpiration(exp, maxExp)
      const payload: PayloadData = {
        data,
        exp,
        iat: now,
        version: this.#version
      }
      const payloadString = JSON.stringify(payload)
      ErrorHandler.validatePayloadSize(payloadString)
      const tokenEncrypted = this.encrypt(payloadString)
      const tokenData: TokenData = {
        encrypted: tokenEncrypted.encrypted,
        iv: tokenEncrypted.iv,
        tag: tokenEncrypted.tag,
        exp,
        iat: now,
        version: this.#version
      }
      const tokenString = JSON.stringify(tokenData)
      return Buffer.from(tokenString).toString('base64')
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof EncryptionError ||
        error instanceof PayloadTooLargeError
      ) {
        throw error
      }
      throw new ValidationError(
        `${getErrorMessage('SIGNING_FAILED')}: ${error instanceof Error ? error.message : getErrorMessage('UNKNOWN_ERROR')}`
      )
    }
  }

  /**
   * Checks if a JWT token is valid
   * @param token - Base64 encoded token to validate
   * @returns True if token is valid and not expired
   */
  verify(token: string): boolean {
    try {
      if (this.#verifyCache.has(token)) {
        const cachedResult = this.#verifyCache.get(token)
        if (cachedResult !== undefined) {
          return cachedResult
        }
      }
      ErrorHandler.validateToken(token)
      ErrorHandler.validateTokenIntegrity(token)
      const decoded = ErrorHandler.validateBase64Decode(
        token,
        getErrorMessage('INVALID_TOKEN_FORMAT')
      )
      const tokenData = ErrorHandler.validateJSONParse<TokenData>(
        decoded,
        getErrorMessage('INVALID_TOKEN_STRUCTURE')
      )
      ErrorHandler.validateTokenDataIntegrity(tokenData)
      if (!isValidTokenData(tokenData)) {
        this.#verifyCache.set(token, false, 0)
        return false
      }
      ErrorHandler.validateVersionCompatibility(tokenData.version, this.#version)
      ErrorHandler.checkTokenExpiration(tokenData.exp)
      const tokenEncrypted: TokenEncrypted = {
        encrypted: tokenData.encrypted,
        iv: tokenData.iv,
        tag: tokenData.tag
      }
      const decryptedPayload = this.decrypt(tokenEncrypted)
      const payload = ErrorHandler.validateJSONParse<PayloadData>(
        decryptedPayload,
        getErrorMessage('INVALID_PAYLOAD_STRUCTURE')
      )
      if (!isValidPayloadData(payload)) {
        this.#verifyCache.set(token, false, 0)
        return false
      }
      ErrorHandler.validateVersionCompatibility(payload.version, tokenData.version)
      ErrorHandler.checkTokenExpiration(payload.exp)
      ErrorHandler.validateTokenTimestamps(payload.exp, tokenData.exp, payload.iat, tokenData.iat)
      this.#verifyCache.set(token, true, Math.max(0, payload.exp * 1000 - Date.now()))
      return true
    } catch {
      this.#verifyCache.set(token, false, 0)
      return false
    }
  }

  /**
   * Validates a JWT token and throws errors on failure
   * @param token - Base64 encoded token to validate
   * @throws {ValidationError} When token format is invalid
   * @throws {TokenExpiredError} When token has expired
   * @throws {DecryptionError} When token decryption fails
   * @throws {VersionMismatchError} When token version is incompatible
   */
  verifyStrict(token: string): void {
    ErrorHandler.validateToken(token)
    ErrorHandler.validateTokenIntegrity(token)
    const decoded = ErrorHandler.validateBase64Decode(
      token,
      getErrorMessage('INVALID_TOKEN_FORMAT')
    )
    const tokenData = ErrorHandler.validateJSONParse<TokenData>(
      decoded,
      getErrorMessage('INVALID_TOKEN_STRUCTURE')
    )
    ErrorHandler.validateTokenDataIntegrity(tokenData)
    if (!isValidTokenData(tokenData)) {
      throw new ValidationError(getErrorMessage('INVALID_TOKEN_DATA_STRUCTURE'))
    }
    ErrorHandler.validateVersionCompatibility(tokenData.version, this.#version)
    ErrorHandler.checkTokenExpiration(tokenData.exp)
    const tokenEncrypted: TokenEncrypted = {
      encrypted: tokenData.encrypted,
      iv: tokenData.iv,
      tag: tokenData.tag
    }
    const decryptedPayload = this.decrypt(tokenEncrypted)
    const payload = ErrorHandler.validateJSONParse<PayloadData>(
      decryptedPayload,
      getErrorMessage('INVALID_PAYLOAD_STRUCTURE')
    )
    if (!isValidPayloadData(payload)) {
      throw new ValidationError(getErrorMessage('INVALID_PAYLOAD_DATA_STRUCTURE'))
    }
    ErrorHandler.validateVersionCompatibility(payload.version, tokenData.version)
    ErrorHandler.checkTokenExpiration(payload.exp)
    ErrorHandler.validateTokenTimestamps(payload.exp, tokenData.exp, payload.iat, tokenData.iat)
  }

  /**
   * Extracts data from a JWT token
   * @param token - Base64 encoded token to decode
   * @returns Decoded payload data
   * @throws {ValidationError} When token format is invalid
   * @throws {TokenExpiredError} When token has expired
   * @throws {DecryptionError} When token decryption fails
   * @throws {VersionMismatchError} When token version is incompatible
   */
  decode(token: string): unknown {
    try {
      if (this.#payloadCache.has(token)) {
        const cachedResult = this.#payloadCache.get(token)
        if (cachedResult !== undefined) {
          return cachedResult
        }
      }
      ErrorHandler.validateToken(token)
      ErrorHandler.validateTokenIntegrity(token)
      const decoded = ErrorHandler.validateBase64Decode(
        token,
        getErrorMessage('INVALID_TOKEN_FORMAT')
      )
      const tokenData = ErrorHandler.validateJSONParse<TokenData>(
        decoded,
        getErrorMessage('INVALID_TOKEN_STRUCTURE')
      )
      ErrorHandler.validateTokenDataIntegrity(tokenData)
      if (!isValidTokenData(tokenData)) {
        throw new ValidationError(getErrorMessage('INVALID_TOKEN_DATA_STRUCTURE'))
      }
      ErrorHandler.validateVersionCompatibility(tokenData.version, this.#version)
      ErrorHandler.checkTokenExpiration(tokenData.exp)
      const tokenEncrypted: TokenEncrypted = {
        encrypted: tokenData.encrypted,
        iv: tokenData.iv,
        tag: tokenData.tag
      }
      const decryptedPayload = this.decrypt(tokenEncrypted)
      const payload = ErrorHandler.validateJSONParse<PayloadData>(
        decryptedPayload,
        getErrorMessage('INVALID_PAYLOAD_STRUCTURE')
      )
      if (!isValidPayloadData(payload)) {
        throw new ValidationError(getErrorMessage('INVALID_PAYLOAD_DATA_STRUCTURE'))
      }
      ErrorHandler.validateVersionCompatibility(payload.version, tokenData.version)
      ErrorHandler.checkTokenExpiration(payload.exp)
      ErrorHandler.validateTokenTimestamps(payload.exp, tokenData.exp, payload.iat, tokenData.iat)
      this.#payloadCache.set(token, payload.data, Math.max(0, payload.exp * 1000 - Date.now()))
      return payload.data
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof DecryptionError ||
        error instanceof TokenExpiredError ||
        error instanceof VersionMismatchError
      ) {
        throw error
      }
      throw new ValidationError(
        `${getErrorMessage('DECODE_FAILED')}: ${error instanceof Error ? error.message : getErrorMessage('UNKNOWN_ERROR')}`
      )
    }
  }
}

/**
 * Export interfaces for external use
 * @see {@link @interfaces/index}
 */
export type {
  EncryptionAlgo,
  JWTOptions,
  JWTPayload,
  KeyDerivationAlgo,
  TimeUnit
} from '@interfaces/index'

/**
 * Export error classes for external use
 * @see {@link @utils/index}
 */
export {
  ValidationError,
  EncryptionError,
  DecryptionError,
  PayloadTooLargeError,
  TokenExpiredError,
  VersionMismatchError,
  TokenInvalidError,
  TimeFormatError,
  SecretKeyError
} from '@utils/index'
