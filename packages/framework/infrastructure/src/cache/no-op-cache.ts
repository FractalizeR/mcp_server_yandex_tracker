/**
 * Заглушка для отключения кеширования
 *
 * Ответственность (SRP):
 * - ТОЛЬКО предоставление пустой реализации CacheManager
 * - Используется когда кеширование отключено
 *
 * Паттерн: Null Object Pattern
 * Позволяет избежать проверок на null в коде, использующем кеш
 *
 * @example
 * // Вместо:
 * if (cache) {
 *   const value = await cache.get(key);
 * }
 *
 * // Используем:
 * const cache = config.enableCache ? new InMemoryCache() : new NoOpCache();
 * const value = await cache.get(key); // Всегда null для NoOpCache
 */

import type { CacheManager } from './cache-manager.interface.js';

export class NoOpCache implements CacheManager {
  /**
   * Всегда возвращает null (cache miss)
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async get<T>(_key: string): Promise<T | null> {
    return null;
  }

  /**
   * Ничего не делает (не сохраняет)
   */
  async set<T>(_key: string, _value: T, _ttl?: number): Promise<void> {
    // Ничего не делаем
  }

  /**
   * Ничего не делает (нечего удалять)
   */
  async delete(_key: string): Promise<void> {
    // Ничего не делаем
  }

  /**
   * Ничего не делает (нечего очищать)
   */
  async clear(): Promise<void> {
    // Ничего не делаем
  }

  /**
   * Ничего не делает (нечего удалять)
   */
  async prune(): Promise<void> {
    // Ничего не делаем
  }
}
