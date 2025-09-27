import { CacheService } from '../../data/protocols/cache-service'

export class MemoryCacheAdapter implements CacheService {
  private cache = new Map<string, { value: string; expires?: number }>()

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (item.expires && Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const expires = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : undefined
    this.cache.set(key, { value, expires })
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }
}
