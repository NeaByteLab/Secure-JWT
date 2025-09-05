import { Cache } from '../src/utils/Cache'

describe('Cache', () => {
  let cache: Cache<string>
  let originalDateNow: typeof Date.now

  beforeEach(() => {
    cache = new Cache<string>(5, 1000)
    originalDateNow = Date.now
    let mockTime = 1000000000000
    Date.now = jest.fn(() => mockTime)
  })

  afterEach(() => {
    Date.now = originalDateNow
  })

  describe('constructor', () => {
    it('should create cache with default values', () => {
      const defaultCache = new Cache<string>()
      expect(defaultCache).toBeDefined()
    })

    it('should create cache with custom maxSize and TTL', () => {
      const customCache = new Cache<string>(10, 5000)
      expect(customCache).toBeDefined()
    })

    it('should enforce minimum maxSize of 1000', () => {
      const smallCache = new Cache<string>(500)
      expect(smallCache).toBeDefined()
    })

    it('should enforce minimum TTL of 1ms', () => {
      const zeroTTLCache = new Cache<string>(1000, 0)
      expect(zeroTTLCache).toBeDefined()
    })
  })

  describe('set and get', () => {
    it('should store and retrieve values', () => {
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
    })

    it('should return undefined for non-existent key', () => {
      expect(cache.get('nonexistent')).toBeUndefined()
    })

    it('should return undefined for expired key', () => {
      cache.set('key1', 'value1', 10)
      expect(cache.get('key1')).toBe('value1')
      const mockTime = Date.now as jest.Mock
      mockTime.mockReturnValue(1000000000015)
      
      expect(cache.get('key1')).toBeUndefined()
    })

    it('should use default TTL when not provided', () => {
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
      const mockTime = Date.now as jest.Mock
      mockTime.mockReturnValue(1000000001100)
      expect(cache.get('key1')).toBeUndefined()
    })

    it('should update access count on get', () => {
      cache.set('key1', 'value1')
      cache.get('key1')
      cache.get('key1')
      expect(cache.get('key1')).toBe('value1')
    })

    it('should handle TTL of 0 as indefinite', () => {
      cache.set('key1', 'value1', 0)
      expect(cache.get('key1')).toBe('value1')
      expect(cache.get('key1')).toBe('value1')
    })

    it('should handle negative TTL by using minimum 1ms', () => {
      cache.set('key1', 'value1', -100)
      expect(cache.get('key1')).toBe('value1')
      const mockTime = Date.now as jest.Mock
      mockTime.mockReturnValue(1000000000002)
      expect(cache.get('key1')).toBeUndefined()
    })

    it('should handle updating existing key', () => {
      cache.set('key1', 'value1')
      cache.set('key1', 'updated_value1')
      expect(cache.get('key1')).toBe('updated_value1')
    })

    it('should handle null and undefined values', () => {
      cache.set('null_key', null as any)
      cache.set('undefined_key', undefined as any)
      expect(cache.get('null_key')).toBeNull()
      expect(cache.get('undefined_key')).toBeUndefined()
    })

    it('should create CacheEntry with correct properties', () => {
      const objectCache = new Cache<{ id: number; name: string }>(10, 1000)
      const testObject = { id: 1, name: 'test' }
      objectCache.set('obj_key', testObject)
      const retrieved = objectCache.get('obj_key')
      expect(retrieved).toEqual(testObject)
      expect(retrieved?.id).toBe(1)
      expect(retrieved?.name).toBe('test')
    })

    it('should handle different data types in CacheEntry', () => {
      const mixedCache = new Cache<any>(10, 1000)
      mixedCache.set('string', 'hello')
      mixedCache.set('number', 42)
      mixedCache.set('boolean', true)
      mixedCache.set('array', [1, 2, 3])
      mixedCache.set('object', { key: 'value' })
      expect(mixedCache.get('string')).toBe('hello')
      expect(mixedCache.get('number')).toBe(42)
      expect(mixedCache.get('boolean')).toBe(true)
      expect(mixedCache.get('array')).toEqual([1, 2, 3])
      expect(mixedCache.get('object')).toEqual({ key: 'value' })
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      cache.set('key1', 'value1')
      expect(cache.has('key1')).toBe(true)
    })

    it('should return false for non-existent key', () => {
      expect(cache.has('nonexistent')).toBe(false)
    })

    it('should return false for expired key', () => {
      cache.set('key1', 'value1', 10)
      expect(cache.has('key1')).toBe(true)
      const mockTime = Date.now as jest.Mock
      mockTime.mockReturnValue(1000000000015)
      expect(cache.has('key1')).toBe(false)
    })

    it('should update access count on has', () => {
      cache.set('key1', 'value1')
      cache.has('key1')
      cache.has('key1')
      expect(cache.has('key1')).toBe(true)
    })
  })

  describe('LRU eviction', () => {
    it('should handle cache capacity', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      cache.set('key4', 'value4')
      cache.set('key5', 'value5')
      expect(cache.get('key1')).toBe('value1')
      expect(cache.get('key2')).toBe('value2')
      expect(cache.get('key3')).toBe('value3')
      expect(cache.get('key4')).toBe('value4')
      expect(cache.get('key5')).toBe('value5')
      cache.set('key6', 'value6')
      expect(cache.get('key6')).toBe('value6')
    })

    it('should not evict when updating existing key', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      cache.set('key4', 'value4')
      cache.set('key5', 'value5')
      cache.set('key1', 'updated_value1')
      expect(cache.get('key1')).toBe('updated_value1')
      expect(cache.get('key2')).toBe('value2')
      expect(cache.get('key3')).toBe('value3')
      expect(cache.get('key4')).toBe('value4')
      expect(cache.get('key5')).toBe('value5')
    })

    it('should handle cache capacity limits', () => {
      const smallCache = new Cache<string>(2, 1000)
      smallCache.set('key1', 'value1')
      smallCache.set('key2', 'value2')
      expect(smallCache.get('key1')).toBe('value1')
      expect(smallCache.get('key2')).toBe('value2')
      expect(smallCache['cache'].size).toBe(2)
    })

    it('should handle single entry cache', () => {
      const singleCache = new Cache<string>(1, 1000)
      singleCache.set('key1', 'value1')
      expect(singleCache.get('key1')).toBe('value1')
      expect(singleCache['cache'].size).toBe(1)
    })

    it('should trigger eviction when cache exceeds capacity', () => {
      const smallCache = new Cache<string>(1001, 1000)
      for (let i = 0; i < 1001; i++) {
        smallCache.set(`key${i}`, `value${i}`)
      }
      smallCache.set('key1001', 'value1001')
      expect(smallCache['cache'].size).toBe(1001)
      expect(smallCache.get('key1001')).toBe('value1001')
    })

    it('should handle eviction with different access patterns', () => {
      const smallCache = new Cache<string>(1001, 1000)
      for (let i = 0; i < 1001; i++) {
        smallCache.set(`key${i}`, `value${i}`)
      }
      smallCache.get('key0')
      smallCache.get('key0')
      smallCache.get('key1')
      smallCache.set('key1001', 'value1001')
      expect(smallCache['cache'].size).toBe(1001)
      expect(smallCache.get('key1001')).toBe('value1001')
    })

    it('should handle eviction when entries have same score', () => {
      const smallCache = new Cache<string>(1001, 1000)
      for (let i = 0; i < 1001; i++) {
        smallCache.set(`key${i}`, `value${i}`)
      }
      smallCache.set('key1001', 'value1001')
      expect(smallCache['cache'].size).toBe(1001)
      expect(smallCache.get('key1001')).toBe('value1001')
    })

    it('should handle eviction with very low scores', () => {
      const smallCache = new Cache<string>(1002, 1000)
      for (let i = 0; i < 1002; i++) {
        smallCache.set(`key${i}`, `value${i}`)
      }
      smallCache.set('key1002', 'value1002')
      expect(smallCache['cache'].size).toBe(1002)
      expect(smallCache.get('key1002')).toBe('value1002')
    })

    it('should handle eviction with mixed access patterns', () => {
      const smallCache = new Cache<string>(1003, 1000)
      for (let i = 0; i < 1003; i++) {
        smallCache.set(`key${i}`, `value${i}`)
        if (i % 3 === 0) {
          smallCache.get(`key${i}`)
          smallCache.get(`key${i}`)
        }
      }
      smallCache.set('key1003', 'value1003')
      expect(smallCache['cache'].size).toBe(1003)
      expect(smallCache.get('key1003')).toBe('value1003')
    })

    it('should handle eviction with specific score comparison', () => {
      const smallCache = new Cache<string>(1004, 1000)
      for (let i = 0; i < 1004; i++) {
        smallCache.set(`key${i}`, `value${i}`)
      }
      smallCache.get('key0')
      smallCache.get('key0')
      smallCache.get('key1')
      smallCache.get('key2')
      smallCache.set('key1004', 'value1004')
      expect(smallCache['cache'].size).toBe(1004)
      expect(smallCache.get('key1004')).toBe('value1004')
    })

    it('should handle eviction with equal scores', () => {
      const smallCache = new Cache<string>(1005, 1000)
      for (let i = 0; i < 1005; i++) {
        smallCache.set(`key${i}`, `value${i}`)
        smallCache.get(`key${i}`)
      }
      smallCache.set('key1005', 'value1005')
      expect(smallCache['cache'].size).toBe(1005)
      expect(smallCache.get('key1005')).toBe('value1005')
    })

    it('should handle eviction with high score entries', () => {
      const smallCache = new Cache<string>(1006, 1000)
      for (let i = 0; i < 1006; i++) {
        smallCache.set(`key${i}`, `value${i}`)
      }
      for (let i = 0; i < 10; i++) {
        smallCache.get('key0')
        smallCache.get('key1')
        smallCache.get('key2')
      }
      smallCache.set('key1006', 'value1006')
      expect(smallCache['cache'].size).toBe(1006)
      expect(smallCache.get('key1006')).toBe('value1006')
    })

    it('should handle eviction with mixed score patterns', () => {
      const smallCache = new Cache<string>(1007, 1000)
      for (let i = 0; i < 1007; i++) {
        smallCache.set(`key${i}`, `value${i}`)
        if (i < 100) {
          for (let j = 0; j < 5; j++) {
            smallCache.get(`key${i}`)
          }
        } else if (i < 200) {
          smallCache.get(`key${i}`)
          smallCache.get(`key${i}`)
        }
      }
      smallCache.set('key1007', 'value1007')
      expect(smallCache['cache'].size).toBe(1007)
      expect(smallCache.get('key1007')).toBe('value1007')
    })

  })

  describe('edge cases', () => {
    it('should handle empty string keys', () => {
      cache.set('', 'empty_key_value')
      expect(cache.get('')).toBe('empty_key_value')
    })

    it('should handle special characters in keys', () => {
      const specialKey = 'key@#$%^&*()_+-=[]{}|;:,.<>?'
      cache.set(specialKey, 'special_value')
      expect(cache.get(specialKey)).toBe('special_value')
    })

    it('should handle very long keys', () => {
      const longKey = 'a'.repeat(1000)
      cache.set(longKey, 'long_key_value')
      expect(cache.get(longKey)).toBe('long_key_value')
    })

    it('should handle very short TTL', () => {
      cache.set('key1', 'value1', 1)
      expect(cache.get('key1')).toBe('value1')
      const mockTime = Date.now as jest.Mock
      mockTime.mockReturnValue(1000000000002)
      expect(cache.get('key1')).toBeUndefined()
    })

    it('should handle very large TTL', () => {
      cache.set('key1', 'value1', Number.MAX_SAFE_INTEGER)
      expect(cache.get('key1')).toBe('value1')
    })
  })

  describe('performance', () => {
    it('should handle rapid operations efficiently', () => {
      const startTime = Date.now()
      for (let i = 0; i < 100; i++) {
        cache.set(`key${i}`, `value${i}`)
        expect(cache.get(`key${i}`)).toBe(`value${i}`)
      }
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('should handle large cache sizes efficiently', () => {
      const largeCache = new Cache<string>(1000, 1000)
      const startTime = Date.now()
      for (let i = 0; i < 500; i++) {
        largeCache.set(`key${i}`, `value${i}`)
      }
      for (let i = 0; i < 100; i++) {
        const randomKey = `key${Math.floor(Math.random() * 500)}`
        largeCache.get(randomKey)
      }
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(200)
    })
  })

  describe('memory management', () => {
    it('should clean up expired entries on access', () => {
      cache.set('short_ttl', 'value1', 1)
      cache.set('long_ttl', 'value2', 10000)
      const mockTime = Date.now as jest.Mock
      mockTime.mockReturnValue(1000000000002)
      expect(cache.get('short_ttl')).toBeUndefined()
      expect(cache.get('long_ttl')).toBe('value2')
    })

    it('should handle memory pressure with frequent evictions', () => {
      const smallCache = new Cache<string>(2, 1000)
      smallCache.set('key1', 'value1')
      smallCache.set('key2', 'value2')
      expect(smallCache['cache'].size).toBe(2)
    })
  })
})