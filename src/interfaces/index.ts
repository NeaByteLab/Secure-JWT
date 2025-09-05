/**
 * JWT payload structure
 */
export interface JWTPayload {
  /** The actual data payload */
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
  /** Token expiration time as a string (e.g., '1h', '30m', '7d') */
  expireIn: string
  /** Secret key for signing tokens (optional) */
  secret?: string
  /** Version identifier for the token (optional) */
  version?: string
}

/**
 * Time value with its unit
 */
export interface TimeUnit {
  /** Numeric value of the time */
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
  /** The actual payload data */
  data: unknown
  /** Expiration timestamp in seconds */
  exp: number
  /** Issued at timestamp in seconds */
  iat: number
  /** Data version identifier */
  version: string
}
