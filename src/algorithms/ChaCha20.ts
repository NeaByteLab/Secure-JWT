import { createCipheriv, createDecipheriv, type CipherGCM, type DecipherGCM } from 'node:crypto'
import { ErrorHandler } from '@utils/index'
import type { TokenEncrypted, EncryptionAlgo, IEncryptionAlgo } from '@interfaces/index'

/**
 * ChaCha20-Poly1305 encryption class
 * Handles encryption and decryption using ChaCha20-Poly1305 algorithm
 */
export default class ChaCha20 implements IEncryptionAlgo {
  /** Algorithm name constant */
  private readonly algorithm: string = 'chacha20-poly1305'

  /**
   * Encrypts data using ChaCha20-Poly1305
   * @param data - String data to encrypt
   * @param key - 32-byte encryption key
   * @param iv - 12-byte initialization vector
   * @param version - Token version for additional authentication data
   * @returns Object containing encrypted data, IV, and authentication tag
   */
  encrypt(data: string, key: Buffer, iv: Buffer, version: string): TokenEncrypted {
    const cipher: CipherGCM = createCipheriv(this.algorithm, key, iv) as CipherGCM
    cipher.setAAD(Buffer.from(`secure-jwt-${version}`, 'utf8'), { plaintextLength: data.length })
    let encrypted: string = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const tag: Buffer = cipher.getAuthTag()
    ErrorHandler.validateAuthTag(tag)
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    }
  }

  /**
   * Decrypts data using ChaCha20-Poly1305
   * @param tokenEncrypted - Object containing encrypted data, IV, and authentication tag
   * @param key - 32-byte decryption key
   * @param version - Token version for additional authentication data
   * @returns Decrypted string data
   */
  decrypt(tokenEncrypted: TokenEncrypted, key: Buffer, version: string): string {
    const decipher: DecipherGCM = createDecipheriv(
      this.algorithm,
      key,
      Buffer.from(tokenEncrypted.iv, 'hex')
    ) as DecipherGCM
    decipher.setAAD(Buffer.from(`secure-jwt-${version}`, 'utf8'), {
      plaintextLength: tokenEncrypted.encrypted.length / 2
    })
    decipher.setAuthTag(Buffer.from(tokenEncrypted.tag, 'hex'))
    let decrypted: string = decipher.update(tokenEncrypted.encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }

  /**
   * Gets the required IV length for ChaCha20-Poly1305
   * @returns IV length in bytes (12)
   */
  getIVLength(): number {
    return 12
  }

  /**
   * Gets the required key length for ChaCha20-Poly1305
   * @returns Key length in bytes (32)
   */
  getKeyLength(): number {
    return 32
  }

  /**
   * Gets the algorithm name
   * @returns Algorithm name string
   */
  getAlgoName(): EncryptionAlgo {
    return this.algorithm as EncryptionAlgo
  }
}
