import { env } from '../config/env.js';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class CacheService {
  private static store = new Map<string, CacheEntry<unknown>>();

  /**
   * Set a key-value pair in the cache with a specified TTL (in seconds).
   */
  static set<T>(key: string, value: T, ttlSeconds: number = env.CACHE_TTL_SECONDS): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  /**
   * Get fresh cached item. Returns null if expired or missing.
   */
  static getFresh<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      return null;
    }

    return entry.value;
  }

  /**
   * Get cached item even if expired (for stale fallback on external service failure).
   */
  static getStale<T>(key: string): { value: T; isStale: boolean } | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const isStale = Date.now() > entry.expiresAt;
    return { value: entry.value, isStale };
  }

  /**
   * Check if a key exists in cache
   */
  static has(key: string): boolean {
    return this.store.has(key);
  }

  /**
   * Delete a specific cache key
   */
  static delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear the entire cache store
   */
  static clear(): void {
    this.store.clear();
  }
}
