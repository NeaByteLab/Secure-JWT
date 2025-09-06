import { randomBytes } from 'node:crypto'
import AES256 from '@algorithms/AES256'
import ChaCha20 from '@algorithms/ChaCha20'
import { EncryptionError, getErrorMessage } from '@utils/index'
import type { EncryptionAlgo, IEncryptionAlgo } from '@interfaces/index'

/**
 * Algorithms factory class
 * Creates encryption algorithm instances and generates random bytes
 */
export default class Algorithms {
  /**
   * Generates cryptographically secure random bytes
   * @param length - Number of bytes to generate
   * @returns Buffer containing random bytes
   */
  static getRandomBytes(length: number): Buffer {
    return randomBytes(length)
  }

  /**
   * Creates an encryption algorithm instance
   * @param algorithm - Algorithm type to create
   * @returns Encryption algorithm instance
   * @throws EncryptionError when algorithm is not supported
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
