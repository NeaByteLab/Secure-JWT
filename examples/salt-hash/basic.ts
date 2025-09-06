/**
 * Basic Salt & Hash Example
 * Shows fundamental cryptographic operations for salt generation and hashing
 */

import { randomBytes, scrypt, pbkdf2, createHash } from 'node:crypto'
import { promisify } from 'node:util'
import SecureJWT from '../../src/index'

/**
 * Promise-based versions of scrypt and PBKDF2
 */
const scryptAsync = promisify(scrypt)
const pbkdf2Async = promisify(pbkdf2)

/**
 * Creates a random salt for cryptographic operations
 * @param length - Salt length in bytes (default: 32)
 * @returns Random salt buffer
 */
function generateSalt(length: number = 32): Buffer {
  return randomBytes(length)
}

/**
 * Creates hash using SHA-256 algorithm
 * @param data - Data to hash
 * @returns SHA-256 hash as hexadecimal string
 */
function generateSHA256(data: string): string {
  return createHash('sha256').update(data).digest('hex')
}

/**
 * Creates hash using SHA-512 algorithm
 * @param data - Data to hash
 * @returns SHA-512 hash as hexadecimal string
 */
function generateSHA512(data: string): string {
  return createHash('sha512').update(data).digest('hex')
}

/**
 * Creates key using scrypt key derivation function
 * @param password - Password to derive key from
 * @param salt - Salt for key derivation
 * @param keyLength - Key length in bytes (default: 32)
 * @returns Derived key buffer
 */
async function generateScryptKey(password: string, salt: Buffer, keyLength: number = 32): Promise<Buffer> {
  return await scryptAsync(password, salt, keyLength) as Buffer
}

/**
 * Creates key using PBKDF2 key derivation function
 * @param password - Password to derive key from
 * @param salt - Salt for key derivation
 * @param iterations - Number of iterations (default: 100000)
 * @param keyLength - Key length in bytes (default: 32)
 * @returns Derived key buffer
 */
async function generatePBKDF2Key(password: string, salt: Buffer, iterations: number = 100000, keyLength: number = 32): Promise<Buffer> {
  return await pbkdf2Async(password, salt, iterations, keyLength, 'sha256') as Buffer
}

/**
 * Demonstrates basic salt and hash operations
 * Displays salt generation, hashing, and key derivation examples
 */
async function demonstrateBasicOperations() {
  console.log('=== Basic Salt & Hash Operations ===\n')

  // 1. Generate random salt
  console.log('1. Generating Random Salt:')
  const salt = generateSalt(32)
  console.log('Salt (hex):', salt.toString('hex'))
  console.log('Salt length:', salt.length, 'bytes\n')

  // 2. Basic hashing
  console.log('2. Basic Hashing:')
  const data = 'Hello, Secure-JWT!'
  const sha256Hash = generateSHA256(data)
  const sha512Hash = generateSHA512(data)
  console.log('Data:', data)
  console.log('SHA-256:', sha256Hash)
  console.log('SHA-512:', sha512Hash)
  console.log('SHA-256 length:', sha256Hash.length, 'characters')
  console.log('SHA-512 length:', sha512Hash.length, 'characters\n')

  // 3. Key derivation with scrypt
  console.log('3. Key Derivation with scrypt:')
  const password = 'my-secure-password'
  const scryptKey = await generateScryptKey(password, salt)
  console.log('Password:', password)
  console.log('Salt:', salt.toString('hex'))
  console.log('Scrypt key:', scryptKey.toString('hex'))
  console.log('Key length:', scryptKey.length, 'bytes\n')

  // 4. Key derivation with PBKDF2
  console.log('4. Key Derivation with PBKDF2:')
  const pbkdf2Key = await generatePBKDF2Key(password, salt, 100000)
  console.log('Password:', password)
  console.log('Salt:', salt.toString('hex'))
  console.log('PBKDF2 key:', pbkdf2Key.toString('hex'))
  console.log('Key length:', pbkdf2Key.length, 'bytes\n')

  // 5. Different salts produce different keys
  console.log('5. Different Salts = Different Keys:')
  const salt1 = generateSalt()
  const salt2 = generateSalt()
  const key1 = await generateScryptKey(password, salt1)
  const key2 = await generateScryptKey(password, salt2)
  console.log('Same password, different salts:')
  console.log('Salt 1:', salt1.toString('hex'))
  console.log('Key 1:', key1.toString('hex'))
  console.log('Salt 2:', salt2.toString('hex'))
  console.log('Key 2:', key2.toString('hex'))
  console.log('Keys are different:', !key1.equals(key2), '\n')

  // 6. Same salt + password = same key
  console.log('6. Same Salt + Password = Same Key:')
  const sameKey1 = await generateScryptKey(password, salt)
  const sameKey2 = await generateScryptKey(password, salt)
  console.log('Same password and salt:')
  console.log('Key 1:', sameKey1.toString('hex'))
  console.log('Key 2:', sameKey2.toString('hex'))
  console.log('Keys are identical:', sameKey1.equals(sameKey2), '\n')

  // 7. Performance comparison
  console.log('7. Performance Comparison:')
  const iterations = 1000
  const testPassword = 'performance-test-password'
  const testSalt = generateSalt()
  console.log(`Running ${iterations} iterations...`)

  // Test scrypt performance
  const scryptStart = Date.now()
  for (let i = 0; i < iterations; i++) {
    await generateScryptKey(testPassword, testSalt)
  }
  const scryptTime = Date.now() - scryptStart

  // Test PBKDF2 performance
  const pbkdf2Start = Date.now()
  for (let i = 0; i < iterations; i++) {
    await generatePBKDF2Key(testPassword, testSalt, 10000)
  }
  const pbkdf2Time = Date.now() - pbkdf2Start
  console.log(`Scrypt (${iterations} iterations): ${scryptTime}ms`)
  console.log(`PBKDF2 (${iterations} iterations): ${pbkdf2Time}ms`)
  console.log(`Scrypt is ${(pbkdf2Time / scryptTime).toFixed(2)}x faster\n`)

  // 8. Secure-JWT integration
  console.log('8. Secure-JWT Integration:')
  const jwtSecret = scryptKey.toString('hex')
  const jwt = new SecureJWT({
    secret: jwtSecret,
    expireIn: '1h',
    algorithm: 'aes-256-gcm',
    keyDerivation: 'basic'
  })
  const testData = { userId: 123, role: 'admin' }
  const token = jwt.sign(testData)
  const isValid = jwt.verify(token)
  const decoded = jwt.decode(token)
  console.log('JWT Secret (from scrypt):', jwtSecret.substring(0, 16) + '...')
  console.log('Test data:', testData)
  console.log('Generated token:', token.substring(0, 50) + '...')
  console.log('Token valid:', isValid)
  console.log('Decoded data:', decoded)
}

/**
 * Demonstrates salt security best practices
 * Displays recommended salt lengths and password strength examples
 */
function demonstrateSecurityBestPractices() {
  console.log('\n=== Security Best Practices ===\n')

  // 1. Salt length recommendations
  console.log('1. Salt Length Recommendations:')
  const shortSalt = generateSalt(8)
  const mediumSalt = generateSalt(16)
  const longSalt = generateSalt(32)
  const veryLongSalt = generateSalt(64)
  console.log('8 bytes (64 bits):', shortSalt.toString('hex'), '- Too short!')
  console.log('16 bytes (128 bits):', mediumSalt.toString('hex'), '- Minimum recommended')
  console.log('32 bytes (256 bits):', longSalt.toString('hex'), '- Recommended')
  console.log('64 bytes (512 bits):', veryLongSalt.toString('hex'), '- Overkill but secure\n')

  // 2. Password strength
  console.log('2. Password Strength Examples:')
  const weakPasswords = ['123456', 'password', 'admin', 'qwerty']
  const strongPasswords = [
    'MyStr0ng!P@ssw0rd',
    'Tr0ub4dor&3',
    'CorrectHorseBatteryStaple',
    'P@ssw0rd!2024'
  ]
  console.log('Weak passwords (avoid these):')
  weakPasswords.forEach(pwd => {
    const hash = generateSHA256(pwd)
    console.log(`  "${pwd}" -> ${hash.substring(0, 16)}...`)
  })
  console.log('\nStrong passwords (use these):')
  strongPasswords.forEach(pwd => {
    const hash = generateSHA256(pwd)
    console.log(`  "${pwd}" -> ${hash.substring(0, 16)}...`)
  })
}

/**
 * Executes the examples
 * Runs basic operations and security best practices demonstrations
 */
demonstrateBasicOperations()
  .then(() => demonstrateSecurityBestPractices())
  .catch(console.error)