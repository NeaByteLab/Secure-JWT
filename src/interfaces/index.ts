/**
 * Available encryption algorithms
 */
export type EncryptionAlgo = 'aes-256-gcm' | 'chacha20-poly1305'

/**
 * Available key derivation algorithms
 */
export type KeyDerivationAlgo = 'basic' | 'pbkdf2'

/**
 * JWT token payload format
 */
export interface JWTPayload {
  /** Actual data payload */
  payload: unknown
  /** Expiration timestamp in seconds */
  exp: number
  /** Issued at timestamp in seconds */
  iat: number
}

/**
 * JWT token configuration settings
 */
export interface JWTOptions {
  /** Encryption algorithm to use (default: 'aes-256-gcm') */
  algorithm?: EncryptionAlgo
  /** Key derivation algorithm to use (default: 'basic') */
  keyDerivation?: KeyDerivationAlgo
  /** Secret key for token signing (required) */
  secret: string
  /** Token expiration time as string (e.g., '1h', '30m', '7d') */
  expireIn: string
  /** Token version identifier (optional) */
  version?: string
  /** Cache settings (optional) */
  cached?: number
}

/**
 * Time value and unit
 */
export interface TimeUnit {
  /** Time value */
  value: number
  /** Time unit (ms, s, m, h, d, M, y) */
  unit: 'ms' | 's' | 'm' | 'h' | 'd' | 'M' | 'y'
}

/**
 * Token data with encryption details
 */
export interface TokenData {
  /** Encrypted content */
  encrypted: string
  /** Initialization vector */
  iv: string
  /** Authentication tag */
  tag: string
  /** Expiration timestamp (seconds) */
  exp: number
  /** Issued at timestamp (seconds) */
  iat: number
  /** Token version */
  version: string
}

/**
 * Encrypted token parts
 */
export interface TokenEncrypted {
  /** Encrypted content */
  encrypted: string
  /** Initialization vector */
  iv: string
  /** Authentication tag */
  tag: string
}

/**
 * Payload data with timing info
 */
export interface PayloadData {
  /** Payload data */
  data: unknown
  /** Expiration timestamp (seconds) */
  exp: number
  /** Issued at timestamp (seconds) */
  iat: number
  /** Data version */
  version: string
}

/**
 * Cache entry with expiration tracking
 */
export interface CacheEntry<T> {
  /** Cached data */
  data: T
  /** Expiration time (milliseconds since epoch) */
  expiresAt: number
  /** Creation time (milliseconds since epoch) */
  createdAt: number
  /** Access count */
  accessCount: number
}

/**
 * Encryption algorithm interface
 * Contract for encrypting and decrypting token data
 */
export interface IEncryptionAlgo {
  /** Encrypts data using the algorithm */
  encrypt(data: string, key: Buffer, iv: Buffer, version: string): TokenEncrypted
  /** Decrypts encrypted token data */
  decrypt(tokenEncrypted: TokenEncrypted, key: Buffer, version: string): string
  /** Returns the required IV length for the algorithm */
  getIVLength(): number
  /** Returns the algorithm name */
  getAlgoName(): EncryptionAlgo
}
