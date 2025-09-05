import type { CacheEntry } from '@interfaces/index'

/**
 * In-memory cache that stores data with expiration
 */
export class Cache<T> {
  private readonly cache = new Map<string, CacheEntry<T>>()
  private readonly maxSize: number
  private readonly defaultTTL: number

  /**
   * Creates a cache instance
   * @param maxSize - Maximum number of items to store (default: 1000, minimum: 1000)
   * @param defaultTTL - Default expiration time in milliseconds (optional, minimum: 1ms)
   */
  constructor(maxSize: number = 1000, defaultTTL?: number) {
    this.maxSize = Math.max(1000, maxSize)
    this.defaultTTL = Math.max(1, defaultTTL ?? 0)
  }

  /**
   * Gets a value from the cache
   * @param key - Key to look up
   * @returns Cached value or undefined if not found or expired
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key)
    if (!entry) {
      return undefined
    }
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return undefined
    }
    entry.accessCount++
    return entry.data
  }

  /**
   * Stores a value in the cache
   * @param key - Key to store under
   * @param value - Value to store
   * @param ttl - Expiration time in milliseconds (optional, uses default if not provided, minimum: 1ms)
   */
  set(key: string, value: T, ttl?: number): void {
    const now = Date.now()
    const requestedTTL = ttl ?? this.defaultTTL
    const finalTTL = Math.max(1, requestedTTL)
    const expiresAt = now + finalTTL
    const entry: CacheEntry<T> = {
      data: value,
      expiresAt,
      createdAt: now,
      accessCount: 1
    }
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU()
    }
    this.cache.set(key, entry)
  }

  /**
   * Checks if a key exists in the cache and is not expired
   * @param key - Key to check
   * @returns True if the key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) {
      return false
    }
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }
    entry.accessCount++
    return true
  }

  /**
   * Removes the least recently used item from the cache
   * Uses access count and creation time to decide which item to remove
   */
  private evictLRU(): void {
    let lruKey = ''
    let lruScore = Number.MAX_SAFE_INTEGER
    for (const [key, entry] of this.cache.entries()) {
      const age = Date.now() - entry.createdAt
      const score = entry.accessCount + age / 1000
      if (score < lruScore) {
        lruScore = score
        lruKey = key
      }
    }
    if (lruKey) {
      this.cache.delete(lruKey)
    }
  }
}
