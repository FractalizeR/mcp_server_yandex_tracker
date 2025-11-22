/**
 * Cache модуль - экспорт всех компонентов
 *
 * Включает:
 * - Интерфейс CacheManager
 * - EntityCacheKey - генератор ключей для entity-based кеширования
 * - EntityType - enum типов сущностей
 * - InMemoryCacheManager - реализация in-memory кеша
 * - NoOpCache - заглушка (Null Object Pattern)
 */

export type { CacheManager } from './cache-manager.interface.js';
export { InMemoryCacheManager } from './in-memory-cache-manager.js';
export { NoOpCache } from './no-op-cache.js';
export { EntityCacheKey, EntityType } from './entity-cache-key.js';
