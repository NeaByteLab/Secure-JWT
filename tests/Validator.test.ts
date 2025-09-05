import { isValidTokenData, isValidPayloadData } from '../src/utils/Validator'
import type { TokenData, PayloadData } from '../src/interfaces/index'

describe('Validator', () => {
  describe('isValidTokenData', () => {
    it('should return true for valid token data', () => {
      const validTokenData: TokenData = {
        encrypted: 'encrypted-data',
        iv: 'iv-data',
        tag: 'tag-data',
        exp: 1234567890,
        iat: 1234567800,
        version: '1.0.0'
      }
      expect(isValidTokenData(validTokenData)).toBe(true)
    })

    it('should return false for null', () => {
      expect(isValidTokenData(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isValidTokenData(undefined)).toBe(false)
    })

    it('should return false for non-object', () => {
      expect(isValidTokenData('string')).toBe(false)
      expect(isValidTokenData(123)).toBe(false)
      expect(isValidTokenData(true)).toBe(false)
    })

    it('should return false for object missing encrypted property', () => {
      const invalidData = {
        iv: 'iv-data',
        tag: 'tag-data',
        exp: 1234567890,
        iat: 1234567800,
        version: '1.0.0'
      }
      expect(isValidTokenData(invalidData)).toBe(false)
    })

    it('should return false for object missing iv property', () => {
      const invalidData = {
        encrypted: 'encrypted-data',
        tag: 'tag-data',
        exp: 1234567890,
        iat: 1234567800,
        version: '1.0.0'
      }
      expect(isValidTokenData(invalidData)).toBe(false)
    })

    it('should return false for object missing tag property', () => {
      const invalidData = {
        encrypted: 'encrypted-data',
        iv: 'iv-data',
        exp: 1234567890,
        iat: 1234567800,
        version: '1.0.0'
      }
      expect(isValidTokenData(invalidData)).toBe(false)
    })

    it('should return false for object missing exp property', () => {
      const invalidData = {
        encrypted: 'encrypted-data',
        iv: 'iv-data',
        tag: 'tag-data',
        iat: 1234567800,
        version: '1.0.0'
      }
      expect(isValidTokenData(invalidData)).toBe(false)
    })

    it('should return false for object missing iat property', () => {
      const invalidData = {
        encrypted: 'encrypted-data',
        iv: 'iv-data',
        tag: 'tag-data',
        exp: 1234567890,
        version: '1.0.0'
      }
      expect(isValidTokenData(invalidData)).toBe(false)
    })

    it('should return false for object missing version property', () => {
      const invalidData = {
        encrypted: 'encrypted-data',
        iv: 'iv-data',
        tag: 'tag-data',
        exp: 1234567890,
        iat: 1234567800
      }
      expect(isValidTokenData(invalidData)).toBe(false)
    })

    it('should return false for wrong property types', () => {
      const invalidData = {
        encrypted: 123,
        iv: 'iv-data',
        tag: 'tag-data',
        exp: 1234567890,
        iat: 1234567800,
        version: '1.0.0'
      }
      expect(isValidTokenData(invalidData)).toBe(false)
    })

    it('should return false for wrong exp type', () => {
      const invalidData = {
        encrypted: 'encrypted-data',
        iv: 'iv-data',
        tag: 'tag-data',
        exp: 'not-a-number',
        iat: 1234567800,
        version: '1.0.0'
      }
      expect(isValidTokenData(invalidData)).toBe(false)
    })

    it('should return false for wrong iat type', () => {
      const invalidData = {
        encrypted: 'encrypted-data',
        iv: 'iv-data',
        tag: 'tag-data',
        exp: 1234567890,
        iat: 'not-a-number',
        version: '1.0.0'
      }
      expect(isValidTokenData(invalidData)).toBe(false)
    })

    it('should return false for wrong version type', () => {
      const invalidData = {
        encrypted: 'encrypted-data',
        iv: 'iv-data',
        tag: 'tag-data',
        exp: 1234567890,
        iat: 1234567800,
        version: 123
      }
      expect(isValidTokenData(invalidData)).toBe(false)
    })
  })

  describe('isValidPayloadData', () => {
    it('should return true for valid payload data', () => {
      const validPayloadData: PayloadData = {
        data: 'some-data',
        exp: 1234567890,
        iat: 1234567800,
        version: '1.0.0'
      }
      expect(isValidPayloadData(validPayloadData)).toBe(true)
    })

    it('should return false for null', () => {
      expect(isValidPayloadData(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isValidPayloadData(undefined)).toBe(false)
    })

    it('should return false for non-object', () => {
      expect(isValidPayloadData('string')).toBe(false)
      expect(isValidPayloadData(123)).toBe(false)
      expect(isValidPayloadData(true)).toBe(false)
    })

    it('should return false for object missing data property', () => {
      const invalidData = {
        exp: 1234567890,
        iat: 1234567800,
        version: '1.0.0'
      }
      expect(isValidPayloadData(invalidData)).toBe(false)
    })

    it('should return false for object missing exp property', () => {
      const invalidData = {
        data: 'some-data',
        iat: 1234567800,
        version: '1.0.0'
      }
      expect(isValidPayloadData(invalidData)).toBe(false)
    })

    it('should return false for object missing iat property', () => {
      const invalidData = {
        data: 'some-data',
        exp: 1234567890,
        version: '1.0.0'
      }
      expect(isValidPayloadData(invalidData)).toBe(false)
    })

    it('should return false for object missing version property', () => {
      const invalidData = {
        data: 'some-data',
        exp: 1234567890,
        iat: 1234567800
      }
      expect(isValidPayloadData(invalidData)).toBe(false)
    })

    it('should return false for wrong exp type', () => {
      const invalidData = {
        data: 'some-data',
        exp: 'not-a-number',
        iat: 1234567800,
        version: '1.0.0'
      }
      expect(isValidPayloadData(invalidData)).toBe(false)
    })

    it('should return false for wrong iat type', () => {
      const invalidData = {
        data: 'some-data',
        exp: 1234567890,
        iat: 'not-a-number',
        version: '1.0.0'
      }
      expect(isValidPayloadData(invalidData)).toBe(false)
    })

    it('should return false for wrong version type', () => {
      const invalidData = {
        data: 'some-data',
        exp: 1234567890,
        iat: 1234567800,
        version: 123
      }
      expect(isValidPayloadData(invalidData)).toBe(false)
    })
  })
})