import type { JWTOptions, TokenEncrypted, TokenData, PayloadData } from '@interfaces/index'
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
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
 * Secure JWT implementation with encryption support
 * Handles token creation, verification, and data extraction
 */
export default class SecureJWT {
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
   * @param options - The configuration for token expiration, secret key, and version
   */
  constructor(options: JWTOptions) {
    ErrorHandler.validateOptions(options)
    ErrorHandler.validateExpireIn(options.expireIn)
    if (options.secret !== undefined) {
      ErrorHandler.validateSecret(options.secret)
    }
    if (options.version !== undefined) {
      ErrorHandler.validateVersion(options.version)
    }
    this.#secret = this.generateSecret(options.secret)
    this.#expireInMs = parsetimeToMs(options.expireIn)
    this.#version = options.version ?? '1.0.0'
    this.#payloadCache = new Cache<unknown>(options.cached ?? 1000, this.#expireInMs)
    this.#verifyCache = new Cache<boolean>(options.cached ?? 1000, this.#expireInMs)
  }

  /**
   * Creates a secret key from the provided secret or generates a random one
   * @param secret - The optional secret string for key creation
   * @returns The Buffer containing the secret key
   */
  private generateSecret(secret?: string): Buffer {
    if (secret != null && secret.length > 0) {
      const salt = randomBytes(32)
      return Buffer.concat([salt, Buffer.from(secret, 'utf8')])
    }
    return randomBytes(32)
  }

  /**
   * Encrypts data using AES-256-GCM encryption
   * @param data - The string data to encrypt
   * @returns The object with encrypted data, initialization vector, and authentication tag
   */
  private encrypt(data: string): TokenEncrypted {
    ErrorHandler.validateEncryptionData(data)
    const iv = randomBytes(16)
    const key = this.#secret.subarray(0, 32)
    ErrorHandler.validateKeyLength(key)
    const cipher = createCipheriv('aes-256-gcm', key, iv)
    cipher.setAAD(Buffer.from(`secure-jwt-${this.#version}`, 'utf8'))
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const tag = cipher.getAuthTag()
    ErrorHandler.validateAuthTag(tag)
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    }
  }

  /**
   * Decrypts data using AES-256-GCM decryption
   * @param tokenEncrypted - The object with encrypted data, initialization vector, and authentication tag
   * @returns The decrypted data as string
   */
  private decrypt(tokenEncrypted: TokenEncrypted): string {
    try {
      ErrorHandler.validateTokenEncrypted(tokenEncrypted)
      const key = this.#secret.subarray(0, 32)
      ErrorHandler.validateKeyLength(key)
      ErrorHandler.validateIVFormat(tokenEncrypted.iv)
      ErrorHandler.validateTagFormat(tokenEncrypted.tag)
      const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(tokenEncrypted.iv, 'hex'))
      decipher.setAAD(Buffer.from(`secure-jwt-${this.#version}`, 'utf8'))
      decipher.setAuthTag(Buffer.from(tokenEncrypted.tag, 'hex'))
      let decrypted = decipher.update(tokenEncrypted.encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return decrypted
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
   * Creates a secure JWT token from data
   * @param data - The data to sign (will be JSON stringified)
   * @returns The JWT token string
   */
  sign(data: unknown): string {
    try {
      ErrorHandler.validateData(data)
      const now = Math.floor(Date.now() / 1000)
      const exp = now + Math.floor(this.#expireInMs / 1000)
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
   * Validates if a JWT token is valid
   * @param token - The Base64 encoded token to check
   * @returns The boolean indicating if token is valid and not expired
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
   * Validates a JWT token and throws specific errors
   * @param token - The Base64 encoded token to validate
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
   * @param token - The Base64 encoded token to decode
   * @returns The decoded payload data
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
