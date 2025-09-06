/**
 * Jest setup file for Secure-JWT tests
 */

const mockCipher = {
  update: jest.fn((data: string) => Buffer.from(data)),
  final: jest.fn(() => Buffer.from('encrypted')),
  getAuthTag: jest.fn(() => Buffer.from('auth-tag')),
  setAAD: jest.fn()
}

const mockDecipher = {
  update: jest.fn((data: Buffer) => data.toString()),
  final: jest.fn(() => 'decrypted'),
  setAuthTag: jest.fn(),
  setAAD: jest.fn()
}

jest.mock('node:crypto', () => ({
  createCipheriv: jest.fn(() => mockCipher),
  createDecipheriv: jest.fn(() => mockDecipher),
  randomBytes: jest.fn((size: number) => Buffer.alloc(size, 0x01)),
  scrypt: jest.fn((password: string, salt: Buffer, keylen: number, callback: Function) => {
    callback(null, Buffer.alloc(keylen, 0x42))
  }),
  scryptSync: jest.fn((password: string, salt: Buffer, keylen: number) => {
    return Buffer.alloc(keylen, 0x42)
  })
}))

jest.setTimeout(10000)
const originalConsoleWarn = console.warn
console.warn = (...args: any[]) => {
  if (args[0]?.includes?.('deprecated') || args[0]?.includes?.('warning')) {
    return
  }
  originalConsoleWarn(...args)
}
