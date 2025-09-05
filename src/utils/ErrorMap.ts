/**
 * Error codes for error identification
 */
export const errorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  ENCRYPTION_ERROR: 'ENCRYPTION_ERROR',
  DECRYPTION_ERROR: 'DECRYPTION_ERROR',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  VERSION_MISMATCH: 'VERSION_MISMATCH',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  TIME_FORMAT_ERROR: 'TIME_FORMAT_ERROR',
  SECRET_KEY_ERROR: 'SECRET_KEY_ERROR'
} as const

/**
 * Error messages for error reporting
 */
export const errorMessages = {
  // Data validation errors
  DATA_NULL_UNDEFINED: 'Data cannot be null or undefined',
  DATA_EMPTY_STRING: 'Data cannot be an empty string',
  DATA_INVALID_TYPE: 'Invalid data type provided',
  DATA_NON_EMPTY_STRING: 'Data must be a non-empty string',

  // Token errors
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token format or structure',
  TOKEN_MALFORMED: 'Token is malformed or corrupted',
  TOKEN_MUST_BE_STRING: 'Token must be a string',
  TOKEN_CANNOT_BE_EMPTY: 'Token cannot be empty',
  TOKEN_TIMESTAMP_MISMATCH: 'Token timestamp mismatch',
  TOKEN_FORMAT_NOT_BASE64: 'Invalid token format: not valid base64',
  TOKEN_FORMAT_TOO_SHORT: 'Invalid token format: too short',
  TOKEN_FORMAT_TOO_LONG: 'Invalid token format: too long',
  TOKEN_FORMAT_INVALID_PADDING: 'Invalid token format: invalid base64 padding',
  TOKEN_FORMAT_INVALID_LENGTH: 'Invalid token format: invalid base64 length',

  // Token structure errors
  TOKEN_STRUCTURE_NOT_OBJECT: 'Invalid token structure: not an object',
  TOKEN_STRUCTURE_MISSING_FIELD: 'Invalid token structure: missing field',
  TOKEN_STRUCTURE_ENCRYPTED_FIELD:
    'Invalid token structure: encrypted field must be non-empty string',
  TOKEN_STRUCTURE_IV_FIELD: 'Invalid token structure: iv field must be non-empty string',
  TOKEN_STRUCTURE_TAG_FIELD: 'Invalid token structure: tag field must be non-empty string',
  TOKEN_STRUCTURE_EXP_FIELD: 'Invalid token structure: exp field must be positive integer',
  TOKEN_STRUCTURE_IAT_FIELD: 'Invalid token structure: iat field must be positive integer',
  TOKEN_STRUCTURE_VERSION_FIELD: 'Invalid token structure: version field must be non-empty string',
  TOKEN_STRUCTURE_IAT_GREATER_THAN_EXP: 'Invalid token structure: iat cannot be greater than exp',
  TOKEN_STRUCTURE_IAT_TOO_FAR_PAST: 'Invalid token structure: iat too far in the past',
  TOKEN_STRUCTURE_EXP_TOO_FAR_FUTURE: 'Invalid token structure: exp too far in the future',

  // Version errors
  VERSION_MISMATCH: 'Token version does not match expected version',
  VERSION_DOWNGRADE_ATTACK:
    'Version downgrade attack detected - token version is older than expected',
  VERSION_UPGRADE_NOT_SUPPORTED: 'Token version is newer than supported version',
  VERSION_MUST_BE_STRING: 'Version must be a string',
  VERSION_CANNOT_BE_EMPTY: 'Version cannot be empty',
  VERSION_INVALID_FORMAT: 'Version must be in format "x.y.z" (e.g., "1.0.0", "2.1.0")',

  // Payload errors
  PAYLOAD_TOO_LARGE: 'Payload size exceeds maximum limit of 8KB',
  EXPIRATION_TOO_FAR: 'Token expiration is too far in the future (max 1 year)',

  // Time format errors
  TIME_FORMAT_INVALID: 'Invalid time format. Expected format: number + unit (ms, s, m, h, d, M, y)',
  TIME_VALUE_NEGATIVE: 'Time value must be positive',
  TIME_VALUE_TOO_LARGE: 'Time value exceeds maximum limit of 1 year',
  TIME_UNIT_UNSUPPORTED: 'Unsupported time unit',
  TIME_STRING_NON_EMPTY: 'Time string must be a non-empty string',

  // Secret key errors
  SECRET_TOO_SHORT: 'Secret key must be at least 8 characters long',
  SECRET_TOO_LONG: 'Secret key must be at most 255 characters long',
  SECRET_INVALID_CHARS: 'Secret key contains invalid characters',
  SECRET_MUST_BE_STRING: 'Secret must be a string',

  // Cache size errors
  CACHE_SIZE_MUST_BE_INTEGER: 'Cache size must be an integer',
  CACHE_SIZE_TOO_SMALL: 'Cache size must be at least 1',
  CACHE_SIZE_TOO_LARGE: 'Cache size must be at most 10000',

  // Options errors
  OPTIONS_MUST_BE_OBJECT: 'Options must be an object',
  EXPIRE_IN_REQUIRED: 'expireIn is required and must be a string',

  // Encryption/Decryption errors
  ENCRYPTION_FAILED: 'Encryption operation failed',
  DECRYPTION_FAILED: 'Decryption failed',
  AUTH_TAG_INVALID: 'Authentication tag verification failed',
  IV_INVALID: 'Invalid initialization vector',
  KEY_DERIVATION_FAILED: 'Key derivation failed',
  INVALID_IV_FORMAT: 'Invalid IV format',
  INVALID_AUTH_TAG_FORMAT: 'Invalid authentication tag format',
  INVALID_KEY_LENGTH: 'Invalid key length for AES-256',
  FAILED_TO_GENERATE_AUTH_TAG: 'Failed to generate authentication tag',

  // Token encrypted errors
  TOKEN_ENCRYPTED_MUST_BE_OBJECT: 'TokenEncrypted must be a valid object',
  TOKEN_ENCRYPTED_MISSING_PROPERTIES:
    'TokenEncrypted must contain encrypted, iv, and tag properties',

  // Unknown error
  UNKNOWN_ERROR: 'Unknown error occurred',

  // Data structure errors
  INVALID_TOKEN_DATA_STRUCTURE: 'Invalid token data structure',
  INVALID_PAYLOAD_DATA_STRUCTURE: 'Invalid payload data structure',

  // Operation failure errors
  SIGNING_FAILED: 'Signing failed',
  DECODE_FAILED: 'Decode failed',

  // Token format validation errors
  INVALID_TOKEN_FORMAT: 'Invalid token format',
  INVALID_TOKEN_STRUCTURE: 'Invalid token structure',
  INVALID_PAYLOAD_STRUCTURE: 'Invalid payload structure'
} as const

/**
 * Retrieves error message from errorMessages object
 * @param key - Error message key
 * @returns Error message string
 */
export function getErrorMessage(key: keyof typeof errorMessages): string {
  return errorMessages[key] as string
}
