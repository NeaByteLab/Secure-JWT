import { randomBytes, pbkdf2Sync } from 'node:crypto'
import AES256 from '@algorithms/AES256'
import ChaCha20 from '@algorithms/ChaCha20'
import { EncryptionError, getErrorMessage } from '@utils/index'
import type { EncryptionAlgo, IEncryptionAlgo } from '@interfaces/index'

/**
 * Algorithms factory class
 * Creates encryption algorithm instances and generates random data
 */
export default class Algorithms {
  /**
   * Generates secure random bytes
   * @param length - Number of bytes to generate
   * @returns Buffer containing random bytes
   */
  static getRandomBytes(length: number): Buffer {
    return randomBytes(length)
  }

  /**
   * Creates a derived key using basic key derivation
   * @param secret - Secret string to derive key from
   * @returns Buffer containing derived key
   */
  static getDerivedKeyBasic(secret: string): Buffer {
    const salt = this.getRandomBytes(32)
    return Buffer.concat([salt, Buffer.from(secret, 'utf8')])
  }

  /**
   * Creates a derived key using PBKDF2
   * @param secret - Secret string to derive key from
   * @param iterations - Number of iterations for PBKDF2
   * @returns Buffer containing derived key
   */
  static getDerivedKeyPBKDF2(secret: string, iterations: number = 50000): Buffer {
    const salt = this.getRandomBytes(32)
    return pbkdf2Sync(secret, salt, iterations, 32, 'sha256')
  }

  /**
   * Creates an encryption algorithm instance
   * @param algorithm - Algorithm type to create
   * @returns Encryption algorithm instance
   * @throws {EncryptionError} When algorithm is not supported
   */
  static getInstance(algorithm: EncryptionAlgo): IEncryptionAlgo {
    if (algorithm === 'aes-256-gcm') {
      return new AES256()
    } else if (algorithm === 'chacha20-poly1305') {
      return new ChaCha20()
    } else {
      throw new EncryptionError(getErrorMessage('INVALID_ALGORITHM'))
    }
  }
}
