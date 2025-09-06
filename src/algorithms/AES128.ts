import { createCipheriv, createDecipheriv } from 'node:crypto'
import { ErrorHandler } from '@utils/index'
import type { TokenEncrypted, EncryptionAlgo, IEncryptionAlgo } from '@interfaces/index'

/**
 * AES-128-GCM encryption class
 * Handles encryption and decryption using AES-128-GCM algorithm
 */
export default class AES128 implements IEncryptionAlgo {
  /** Algorithm name constant */
  private readonly algorithm = 'aes-128-gcm'

  /**
   * Encrypts data using AES-128-GCM
   * @param data - String data to encrypt
   * @param key - 16-byte encryption key
   * @param iv - 12-byte initialization vector
   * @param version - Token version for additional authentication data
   * @returns Object containing encrypted data, IV, and authentication tag
   */
  encrypt(data: string, key: Buffer, iv: Buffer, version: string): TokenEncrypted {
    const cipher = createCipheriv(this.algorithm, key, iv)
    cipher.setAAD(Buffer.from(`secure-jwt-${version}`, 'utf8'))
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
   * Decrypts data using AES-128-GCM
   * @param tokenEncrypted - Object containing encrypted data, IV, and authentication tag
   * @param key - 16-byte decryption key
   * @param version - Token version for additional authentication data
   * @returns Decrypted string data
   */
  decrypt(tokenEncrypted: TokenEncrypted, key: Buffer, version: string): string {
    const decipher = createDecipheriv(this.algorithm, key, Buffer.from(tokenEncrypted.iv, 'hex'))
    decipher.setAAD(Buffer.from(`secure-jwt-${version}`, 'utf8'))
    decipher.setAuthTag(Buffer.from(tokenEncrypted.tag, 'hex'))
    let decrypted = decipher.update(tokenEncrypted.encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }

  /**
   * Gets the required IV length for AES-128-GCM
   * @returns IV length in bytes (12)
   */
  getIVLength(): number {
    return 12
  }

  /**
   * Gets the required key length for AES-128-GCM
   * @returns Key length in bytes (16)
   */
  getKeyLength(): number {
    return 16
  }

  /**
   * Gets the algorithm name
   * @returns Algorithm name string
   */
  getAlgoName(): EncryptionAlgo {
    return this.algorithm
  }
}
