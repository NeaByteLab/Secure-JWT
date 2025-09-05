import type { TimeUnit } from '@interfaces/index'
import { ErrorHandler, TimeFormatError, errorMessages } from '@utils/index'

/**
 * Converts time unit to milliseconds
 * @param timeUnit - TimeUnit object with value and unit to convert
 * @returns Time in milliseconds
 * @throws {TimeFormatError} when unit is not supported
 */
export function timeToMs(timeUnit: TimeUnit): number {
  const { value, unit } = timeUnit
  switch (unit) {
    case 'ms':
      return value
    case 's':
      return value * 1000
    case 'm':
      return value * 60 * 1000
    case 'h':
      return value * 60 * 60 * 1000
    case 'd':
      return value * 24 * 60 * 60 * 1000
    case 'M':
      return value * 30 * 24 * 60 * 60 * 1000
    case 'y':
      return value * 365 * 24 * 60 * 60 * 1000
    default:
      throw new TimeFormatError(errorMessages.TIME_UNIT_UNSUPPORTED.replace('{unit}', String(unit)))
  }
}

/**
 * Parses time expressions into TimeUnit objects
 * @param timeString - Time string to parse (e.g., '1m', '5h', '1d', '1M', '1y')
 * @returns TimeUnit object with value and unit
 * @throws {TimeFormatError} when time string format is invalid or value is negative
 */
export function parseTimeString(timeString: string): TimeUnit {
  const timeRegex = /^(\d+(?:\.\d+)?)(ms|s|m|h|d|M|y)$/
  const match = timeRegex.exec(timeString)
  if (!match || match.length < 3 || match[1] === undefined || match[2] === undefined) {
    throw new TimeFormatError(errorMessages.TIME_FORMAT_INVALID)
  }
  const value = parseFloat(match[1])
  const unit = match[2] as TimeUnit['unit']
  if (value <= 0) {
    throw new TimeFormatError(errorMessages.TIME_VALUE_NEGATIVE)
  }
  return { value, unit }
}

/**
 * Parses time string and converts to milliseconds
 * @param timeString - Time string to parse (e.g., '1m', '5h', '1d')
 * @returns Time in milliseconds
 * @throws {TimeFormatError} when time string format is invalid
 */
export function parsetimeToMs(timeString: string): number {
  ErrorHandler.validateTimeString(timeString)
  const timeUnit = parseTimeString(timeString)
  const milliseconds = timeToMs(timeUnit)
  const maxExpirationMs = 365 * 24 * 60 * 60 * 1000
  if (milliseconds > maxExpirationMs) {
    throw new TimeFormatError(errorMessages.TIME_VALUE_TOO_LARGE)
  }
  return milliseconds
}
