export interface CacheService {
  get: (key: string) => Promise<string | null>
  set: (key: string, value: string, ttlSeconds?: number) => Promise<void>
  delete: (key: string) => Promise<void>
  clear: () => Promise<void>
}
