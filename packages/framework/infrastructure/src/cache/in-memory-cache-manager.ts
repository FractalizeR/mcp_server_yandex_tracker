/**
 * In-memory реализация кеша
 *
 * Ответственность (SRP):
 * - ТОЛЬКО управление кешом в памяти процесса
 * - Поддержка TTL и автоматического удаления устаревших записей
 *
 * Паттерн: Strategy Pattern
 * Асинхронный интерфейс для совместимости с внешними кешами (Redis, Memcached)
 *
 * @example
 * const cache = new InMemoryCacheManager(300000); // TTL 5 минут
 * await cache.set('user:123', userData, 600000); // Кастомный TTL 10 минут
 * const user = await cache.get<User>('user:123');
 */

import type { CacheManager } from './cache-manager.interface.js';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class InMemoryCacheManager implements CacheManager {
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private readonly defaultTtl: number;

  /**
   * @param defaultTtl - время жизни записей по умолчанию в миллисекундах (по умолчанию 5 минут)
   */
  constructor(defaultTtl: number = 300000) {
    this.defaultTtl = defaultTtl;
  }

  /**
   * Получить значение из кеша
   * @param key - ключ кеша
   * @returns значение или null, если ключ не найден или истёк TTL
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Сохранить значение в кеш
   * @param key - ключ кеша
   * @param value - значение для сохранения
   * @param ttl - опциональное время жизни в миллисекундах
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const expiresAt = Date.now() + (ttl ?? this.defaultTtl);
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Удалить значение из кеша
   * @param key - ключ кеша
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * Очистить весь кеш
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Удалить устаревшие записи из кеша (с истёкшим TTL)
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async prune(): Promise<void> {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}
