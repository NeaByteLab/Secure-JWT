import { timeToMs, parseTimeString, parsetimeToMs } from '../src/utils/TimeParser'
import { TimeFormatError } from '../src/utils/ErrorBase'

describe('TimeParser', () => {
  describe('timeToMs', () => {
    it('should convert milliseconds to milliseconds', () => {
      expect(timeToMs({ value: 1000, unit: 'ms' })).toBe(1000)
    })

    it('should convert seconds to milliseconds', () => {
      expect(timeToMs({ value: 5, unit: 's' })).toBe(5000)
    })

    it('should convert minutes to milliseconds', () => {
      expect(timeToMs({ value: 2, unit: 'm' })).toBe(120000)
    })

    it('should convert hours to milliseconds', () => {
      expect(timeToMs({ value: 1, unit: 'h' })).toBe(3600000)
    })

    it('should convert days to milliseconds', () => {
      expect(timeToMs({ value: 1, unit: 'd' })).toBe(86400000)
    })

    it('should convert months to milliseconds', () => {
      expect(timeToMs({ value: 1, unit: 'M' })).toBe(2592000000)
    })

    it('should convert years to milliseconds', () => {
      expect(timeToMs({ value: 1, unit: 'y' })).toBe(31536000000)
    })

    it('should handle decimal values', () => {
      expect(timeToMs({ value: 1.5, unit: 'm' })).toBe(90000)
    })

    it('should throw TimeFormatError for unsupported unit', () => {
      expect(() => timeToMs({ value: 1, unit: 'x' as any })).toThrow(TimeFormatError)
    })
  })

  describe('parseTimeString', () => {
    it('should parse valid time strings', () => {
      expect(parseTimeString('1ms')).toEqual({ value: 1, unit: 'ms' })
      expect(parseTimeString('5s')).toEqual({ value: 5, unit: 's' })
      expect(parseTimeString('2m')).toEqual({ value: 2, unit: 'm' })
      expect(parseTimeString('1h')).toEqual({ value: 1, unit: 'h' })
      expect(parseTimeString('1d')).toEqual({ value: 1, unit: 'd' })
      expect(parseTimeString('1M')).toEqual({ value: 1, unit: 'M' })
      expect(parseTimeString('1y')).toEqual({ value: 1, unit: 'y' })
    })

    it('should parse decimal values', () => {
      expect(parseTimeString('1.5m')).toEqual({ value: 1.5, unit: 'm' })
      expect(parseTimeString('2.5h')).toEqual({ value: 2.5, unit: 'h' })
    })

    it('should throw TimeFormatError for invalid format', () => {
      expect(() => parseTimeString('invalid')).toThrow(TimeFormatError)
      expect(() => parseTimeString('1')).toThrow(TimeFormatError)
      expect(() => parseTimeString('m')).toThrow(TimeFormatError)
      expect(() => parseTimeString('1x')).toThrow(TimeFormatError)
      expect(() => parseTimeString('')).toThrow(TimeFormatError)
    })

    it('should throw TimeFormatError for negative values', () => {
      expect(() => parseTimeString('-1m')).toThrow(TimeFormatError)
      expect(() => parseTimeString('0m')).toThrow(TimeFormatError)
    })
  })

  describe('parsetimeToMs', () => {
    it('should parse and convert time string to milliseconds', () => {
      expect(parsetimeToMs('1m')).toBe(60000)
      expect(parsetimeToMs('5s')).toBe(5000)
      expect(parsetimeToMs('1h')).toBe(3600000)
    })

    it('should throw TimeFormatError for empty string', () => {
      expect(() => parsetimeToMs('')).toThrow(TimeFormatError)
    })

    it('should throw TimeFormatError for non-string input', () => {
      expect(() => parsetimeToMs(123 as any)).toThrow(TimeFormatError)
    })

    it('should accept exactly 1 year expiration', () => {
      expect(parsetimeToMs('365d')).toBe(365 * 24 * 60 * 60 * 1000)
      expect(parsetimeToMs('1y')).toBe(365 * 24 * 60 * 60 * 1000)
    })

    it('should throw TimeFormatError for expiration longer than 1 year', () => {
      expect(() => parsetimeToMs('366d')).toThrow(TimeFormatError)
      expect(() => parsetimeToMs('2y')).toThrow(TimeFormatError)
      expect(() => parsetimeToMs('1000d')).toThrow(TimeFormatError)
    })

    it('should accept various valid time formats under 1 year', () => {
      expect(parsetimeToMs('364d')).toBe(364 * 24 * 60 * 60 * 1000)
      expect(parsetimeToMs('12M')).toBe(12 * 30 * 24 * 60 * 60 * 1000)
      expect(parsetimeToMs('8760h')).toBe(8760 * 60 * 60 * 1000)
    })

    it('should throw TimeFormatError for very large time values', () => {
      expect(() => parsetimeToMs('1000y')).toThrow(TimeFormatError)
      expect(() => parsetimeToMs('10000d')).toThrow(TimeFormatError)
    })
  })
})