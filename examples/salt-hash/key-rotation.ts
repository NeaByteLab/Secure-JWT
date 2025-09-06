/**
 * Salt Rotation Example
 * Shows how to implement key rotation for JWT tokens
 */

import { randomBytes, scrypt } from 'node:crypto'
import { promisify } from 'node:util'
import SecureJWT from '../../src/index'

/**
 * Promise-based version of scrypt
 */
const scryptAsync = promisify(scrypt)

/**
 * Creates a random salt for cryptographic operations
 * @param length - The length of the salt in bytes (default: 32)
 * @returns Buffer containing random bytes
 */
function generateSalt(length: number = 32): Buffer {
  return randomBytes(length)
}

/**
 * Creates a secret key from password and salt using scrypt
 * @param password - The password to derive the key from
 * @param salt - The salt buffer for key derivation
 * @returns Promise that resolves to the derived key buffer
 */
async function generateSecretKey(password: string, salt: Buffer): Promise<Buffer> {
  const key = await scryptAsync(password, salt, 32) as Buffer
  return key
}

/**
 * Manages key rotation for JWT tokens
 * Handles transition between different secret keys while maintaining backward compatibility
 */
class KeyRotationManager {
  private currentJWT: SecureJWT
  private previousJWT: SecureJWT | null = null
  private currentVersion: string
  private previousVersion: string | null = null

/**
 * Creates a new key rotation manager
 * @param initialSecret - The initial secret key for JWT operations
 * @param version - The version identifier for the initial key (default: '1.0.0')
 */
  constructor(initialSecret: string, version: string = '1.0.0') {
    this.currentJWT = new SecureJWT({
      algorithm: 'aes-256-gcm',
      keyDerivation: 'basic',
      secret: initialSecret,
      expireIn: '1h',
      version,
      cached: 1000
    })
    this.currentVersion = version
  }

/**
 * Rotates to a new secret key
 * The current key becomes the previous key for backward compatibility
 * @param newSecret - The new secret key to use for signing
 * @param newVersion - The version identifier for the new key
 */
  async rotateKey(newSecret: string, newVersion: string): Promise<void> {
    this.previousJWT = this.currentJWT
    this.previousVersion = this.currentVersion
    this.currentJWT = new SecureJWT({
      algorithm: 'aes-256-gcm',
      keyDerivation: 'basic',
      secret: newSecret,
      expireIn: '1h',
      version: newVersion,
      cached: 1000
    })
    this.currentVersion = newVersion
  }

/**
 * Signs data with the current secret key
 * @param data - The data to sign
 * @returns Signed JWT token
 */
  sign(data: unknown): string {
    return this.currentJWT.sign(data)
  }

/**
 * Verifies a JWT token using current and previous keys
 * @param token - The JWT token to verify
 * @returns True if the token is valid with any available key
 */
  verify(token: string): boolean {
    if (this.currentJWT.verify(token)) {
      return true
    }
    if (this.previousJWT) {
      return this.previousJWT.verify(token)
    }
    return false
  }

/**
 * Decodes a JWT token using current and previous keys
 * @param token - The JWT token to decode
 * @returns Decoded token payload
 * @throws Error if token verification fails with all available keys
 */
  decode(token: string): unknown {
    try {
      this.currentJWT.verifyStrict(token)
      return this.currentJWT.decode(token)
    } catch {
      if (this.previousJWT) {
        try {
          this.previousJWT.verifyStrict(token)
          return this.previousJWT.decode(token)
        } catch {
          throw new Error('Token verification failed with both current and previous keys')
        }
      }
      throw new Error('Token verification failed')
    }
  }

/**
 * Gets the current key version
 * @returns Version string of the current key
 */
  getCurrentVersion(): string {
    return this.currentVersion
  }

/**
 * Gets the previous key version
 * @returns Version string of the previous key, or null if no previous key exists
 */
  getPreviousVersion(): string | null {
    return this.previousVersion
  }
}

/**
 * Demonstrates salt rotation functionality
 * Displays how to generate salts, create secret keys, and rotate between different keys
 */
async function demonstrateSaltRotation() {
  console.log('=== Salt Rotation Example ===\n')
  const initialSalt = generateSalt()
  const initialPassword = 'my-secure-password'
  const initialSecret = await generateSecretKey(initialPassword, initialSalt)
  console.log('Initial salt:', initialSalt.toString('hex'))
  console.log('Initial secret:', initialSecret.toString('hex'))
  const keyManager = new KeyRotationManager(initialSecret.toString('hex'), '1.0.0')
  const userData = {
    userId: 123,
    username: 'john_doe',
    role: 'admin'
  }

  // Sign data with the initial key
  const token1 = keyManager.sign(userData)
  console.log('\nToken with initial key:', token1)
  console.log('Token verified:', keyManager.verify(token1))
  const newSalt = generateSalt()
  const newPassword = 'my-new-secure-password'
  const newSecret = await generateSecretKey(newPassword, newSalt)
  console.log('\nNew salt:', newSalt.toString('hex'))
  console.log('New secret:', newSecret.toString('hex'))
  await keyManager.rotateKey(newSecret.toString('hex'), '2.0.0')
  console.log('Key rotated to version:', keyManager.getCurrentVersion())

  // Sign data with the new key
  const token2 = keyManager.sign({ ...userData, version: '2.0.0' })
  console.log('\nToken with new key:', token2)
  console.log('New token verified:', keyManager.verify(token2))
  console.log('Old token still verified:', keyManager.verify(token1))
  console.log('\nDecoded old token:', keyManager.decode(token1))
  console.log('Decoded new token:', keyManager.decode(token2))
  const thirdSalt = generateSalt()
  const thirdPassword = 'my-third-secure-password'
  const thirdSecret = await generateSecretKey(thirdPassword, thirdSalt)
  await keyManager.rotateKey(thirdSecret.toString('hex'), '3.0.0')
  console.log('\nKey rotated to version:', keyManager.getCurrentVersion())

  // Sign data with the third key
  const token3 = keyManager.sign({ ...userData, version: '3.0.0' })
  console.log('Token with third key:', token3)
  console.log('Token 1 verified:', keyManager.verify(token1))
  console.log('Token 2 verified:', keyManager.verify(token2))
  console.log('Token 3 verified:', keyManager.verify(token3))
}

/**
 * Executes the salt rotation example
 * Runs the key rotation demonstration
 */
demonstrateSaltRotation().catch(console.error)