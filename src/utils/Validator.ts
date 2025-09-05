import type { TokenData, PayloadData } from '@interfaces/index'

/**
 * Validates if token data has valid structure
 * @param tokenData - The token data to check
 * @returns The boolean indicating if token data has valid structure
 */
export function isValidTokenData(tokenData: unknown): tokenData is TokenData {
  return (
    typeof tokenData === 'object' &&
    tokenData !== null &&
    'encrypted' in tokenData &&
    'iv' in tokenData &&
    'tag' in tokenData &&
    'exp' in tokenData &&
    'iat' in tokenData &&
    'version' in tokenData &&
    typeof (tokenData as TokenData).encrypted === 'string' &&
    typeof (tokenData as TokenData).iv === 'string' &&
    typeof (tokenData as TokenData).tag === 'string' &&
    typeof (tokenData as TokenData).exp === 'number' &&
    typeof (tokenData as TokenData).iat === 'number' &&
    typeof (tokenData as TokenData).version === 'string'
  )
}

/**
 * Validates if payload data has valid structure
 * @param payload - The payload data to check
 * @returns The boolean indicating if payload data has valid structure
 */
export function isValidPayloadData(payload: unknown): payload is PayloadData {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'data' in payload &&
    'exp' in payload &&
    'iat' in payload &&
    'version' in payload &&
    typeof (payload as PayloadData).exp === 'number' &&
    typeof (payload as PayloadData).iat === 'number' &&
    typeof (payload as PayloadData).version === 'string'
  )
}
