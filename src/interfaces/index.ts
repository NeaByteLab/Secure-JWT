/**
 * JWT payload structure
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
 * Configuration for JWT operations
 */
export interface JWTOptions {
  /** Secret key for signing tokens (required for security) */
  secret: string
  /** Token expiration time as a string (e.g., '1h', '30m', '7d') */
  expireIn: string
  /** Version identifier for the token (optional) */
  version?: string
  /** Cache configuration (optional) */
  cached?: number
}

/**
 * Time value with its unit
 */
export interface TimeUnit {
  /** Numeric value of time */
  value: number
  /** Time unit (milliseconds, seconds, minutes, hours, days, months, years) */
  unit: 'ms' | 's' | 'm' | 'h' | 'd' | 'M' | 'y'
}

/**
 * Token data structure with encryption details and metadata
 */
export interface TokenData {
  /** Encrypted token content */
  encrypted: string
  /** Initialization vector for decryption */
  iv: string
  /** Authentication tag for verification */
  tag: string
  /** Expiration timestamp in seconds */
  exp: number
  /** Issued at timestamp in seconds */
  iat: number
  /** Token version identifier */
  version: string
}

/**
 * Encrypted token components for storage
 */
export interface TokenEncrypted {
  /** Encrypted token content */
  encrypted: string
  /** Initialization vector for decryption */
  iv: string
  /** Authentication tag for verification */
  tag: string
}

/**
 * Payload data structure with timing and version information
 */
export interface PayloadData {
  /** Actual payload data */
  data: unknown
  /** Expiration timestamp in seconds */
  exp: number
  /** Issued at timestamp in seconds */
  iat: number
  /** Data version identifier */
  version: string
}

/**
 * Cache entry structure with expiration and usage tracking
 */
export interface CacheEntry<T> {
  /** Stored data */
  data: T
  /** When this entry expires (milliseconds since epoch) */
  expiresAt: number
  /** When this entry was created (milliseconds since epoch) */
  createdAt: number
  /** Number of times this entry has been accessed */
  accessCount: number
}
