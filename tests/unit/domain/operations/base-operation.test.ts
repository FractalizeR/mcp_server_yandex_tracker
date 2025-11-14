/**
 * Тесты для BaseOperation
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { BaseOperation } from '../../../../src/domain/operations/base-operation.js';
import type { HttpClient } from '../../../../src/infrastructure/http/client/http-client.js';
import type { RetryHandler } from '../../../../src/infrastructure/http/retry/retry-handler.js';
import type { CacheManager } from '../../../../src/infrastructure/cache/cache-manager.interface.js';
import type { Logger } from '../../../../src/infrastructure/logger.js';

/**
 * Конкретная реализация BaseOperation для тестирования
 */
class TestOperation extends BaseOperation {
  async executeWithCache<T>(key: string, fn: () => Promise<T>): Promise<T> {
    return this.withCache(key, fn);
  }

  async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    return this.withRetry(fn);
  }
}

function createMockHttpClient(): HttpClient {
  return {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  } as unknown as HttpClient;
}

function createMockRetryHandler(): RetryHandler {
  return {
    executeWithRetry: jest.fn(<T>(fn: () => Promise<T>) => fn()),
  } as unknown as RetryHandler;
}

function createMockCache(): CacheManager {
  return {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    prune: jest.fn(),
  } as unknown as CacheManager;
}

function createMockLogger(): Logger {
  return {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as Logger;
}

describe('BaseOperation', () => {
  let mockHttpClient: HttpClient;
  let mockRetryHandler: RetryHandler;
  let mockCache: CacheManager;
  let mockLogger: Logger;
  let operation: TestOperation;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    mockRetryHandler = createMockRetryHandler();
    mockCache = createMockCache();
    mockLogger = createMockLogger();

    operation = new TestOperation(
      mockHttpClient,
      mockRetryHandler,
      mockCache,
      mockLogger
    );

    jest.clearAllMocks();
  });

  describe('withCache', () => {
    it('должен вернуть значение из кеша при наличии', async () => {
      const cacheKey = 'test:key';
      const cachedValue = { data: 'cached' };

      (mockCache.get as jest.Mock).mockReturnValue(cachedValue);

      const fn = jest.fn<() => Promise<unknown>>();
      const result = await operation.executeWithCache(cacheKey, fn);

      expect(result).toEqual(cachedValue);
      expect(mockCache.get).toHaveBeenCalledWith(cacheKey);
      expect(fn).not.toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('cache hit')
      );
    });

    it('должен выполнить функцию при отсутствии в кеше', async () => {
      const cacheKey = 'test:key';
      const freshValue = { data: 'fresh' };

      (mockCache.get as jest.Mock).mockReturnValue(undefined);
      const fn = jest.fn(async () => freshValue);

      const result = await operation.executeWithCache(cacheKey, fn);

      expect(result).toEqual(freshValue);
      expect(mockCache.get).toHaveBeenCalledWith(cacheKey);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(mockCache.set).toHaveBeenCalledWith(cacheKey, freshValue);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('cache miss')
      );
    });

    it('должен сохранить результат в кеш', async () => {
      const cacheKey = 'test:key';
      const value = { data: 'new' };

      (mockCache.get as jest.Mock).mockReturnValue(undefined);
      const fn = jest.fn(async () => value);

      await operation.executeWithCache(cacheKey, fn);

      expect(mockCache.set).toHaveBeenCalledWith(cacheKey, value);
    });
  });

  describe('withRetry', () => {
    it('должен делегировать выполнение RetryHandler', async () => {
      const fn = jest.fn(async () => 'result');

      const result = await operation.executeWithRetry(fn);

      expect(result).toBe('result');
      expect(mockRetryHandler.executeWithRetry).toHaveBeenCalledWith(fn);
    });

    it('должен пробросить ошибку от RetryHandler', async () => {
      const error = new Error('Retry failed');
      const fn = jest.fn(async () => { throw error; });

      jest.mocked(mockRetryHandler.executeWithRetry).mockRejectedValue(error);

      await expect(operation.executeWithRetry(fn)).rejects.toThrow('Retry failed');
    });
  });
});
