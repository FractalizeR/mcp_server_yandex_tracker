import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PingOperation } from '@tracker_api/operations/user/ping.operation.js';
import type { HttpClient } from '@infrastructure/http/client/http-client.js';
import type { RetryHandler } from '@infrastructure/http/retry/retry-handler.js';
import type { CacheManager } from '@infrastructure/cache/cache-manager.interface.js';
import type { Logger } from '@infrastructure/logging/index.js';
import type { User } from '@tracker_api/entities/user.entity.js';
import type { ApiError } from '@types';

describe('PingOperation', () => {
  let operation: PingOperation;
  let mockHttpClient: HttpClient;
  let mockRetryHandler: RetryHandler;
  let mockCacheManager: CacheManager;
  let mockLogger: Logger;

  beforeEach(() => {
    // Mock HttpClient
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    } as unknown as HttpClient;

    // Mock RetryHandler - всегда выполняет функцию напрямую
    mockRetryHandler = {
      executeWithRetry: vi.fn(async (fn) => await fn()),
    } as unknown as RetryHandler;

    // Mock CacheManager - по умолчанию возвращает undefined (нет кеша)
    mockCacheManager = {
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn(),
      has: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
    } as unknown as CacheManager;

    // Mock Logger
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      child: vi.fn(() => mockLogger),
    } as unknown as Logger;

    operation = new PingOperation(mockHttpClient, mockRetryHandler, mockCacheManager, mockLogger);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('execute', () => {
    it('должна успешно выполнить проверку подключения', async () => {
      // Arrange
      const mockUser: User = {
        self: 'https://api.tracker.yandex.net/v3/users/123',
        id: '123',
        display: 'Test User',
        cloudUid: 'cloud-123',
        passportUid: 123456,
        login: 'testuser',
        trackerUid: 987654,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockUser);

      // Act
      const result = await operation.execute();

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('Test User');
      expect(result.message).toContain('v3');
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Проверка подключения к API Яндекс.Трекера (v3)...'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('Подключение успешно', { user: 'Test User' });
      expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/myself');
    });

    it('должна использовать кеш при повторном вызове', async () => {
      // Arrange
      const mockUser: User = {
        self: 'https://api.tracker.yandex.net/v3/users/456',
        id: '456',
        display: 'Cached User',
        cloudUid: 'cloud-456',
        passportUid: 456789,
        login: 'cacheduser',
        trackerUid: 987654,
        firstName: 'Cached',
        lastName: 'User',
        email: 'cached@example.com',
      };

      // Первый раз кеша нет
      vi.mocked(mockCacheManager.get).mockReturnValueOnce(undefined);
      vi.mocked(mockHttpClient.get).mockResolvedValue(mockUser);

      // Act - первый вызов
      const result1 = await operation.execute();

      // Второй раз данные из кеша
      vi.mocked(mockCacheManager.get).mockReturnValueOnce(mockUser);

      // Act - второй вызов
      const result2 = await operation.execute();

      // Assert
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result2.message).toContain('Cached User');
      expect(mockHttpClient.get).toHaveBeenCalledTimes(1); // HTTP запрос только один раз
      expect(mockCacheManager.set).toHaveBeenCalledTimes(1);
    });

    it('должна обработать ошибку подключения', async () => {
      // Arrange
      const apiError: ApiError = {
        name: 'ApiError',
        message: 'Unauthorized',
        statusCode: 401,
        requestId: 'req-123',
        timestamp: new Date().toISOString(),
      };

      vi.mocked(mockHttpClient.get).mockRejectedValue(apiError);

      // Act
      const result = await operation.execute();

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Ошибка подключения');
      expect(result.message).toContain('Unauthorized');
      expect(result.message).toContain('401');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('должна обработать сетевую ошибку', async () => {
      // Arrange
      const networkError: ApiError = {
        name: 'NetworkError',
        message: 'Network timeout',
        statusCode: 0,
        requestId: 'req-456',
        timestamp: new Date().toISOString(),
      };

      vi.mocked(mockHttpClient.get).mockRejectedValue(networkError);

      // Act
      const result = await operation.execute();

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Network timeout');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('должна использовать retry handler при выполнении запроса', async () => {
      // Arrange
      const mockUser: User = {
        self: 'https://api.tracker.yandex.net/v3/users/789',
        id: '789',
        display: 'Retry User',
        cloudUid: 'cloud-789',
        passportUid: 789123,
        login: 'retryuser',
        trackerUid: 987654,
        firstName: 'Retry',
        lastName: 'User',
        email: 'retry@example.com',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockUser);

      // Act
      await operation.execute();

      // Assert
      expect(mockRetryHandler.executeWithRetry).toHaveBeenCalled();
    });
  });
});
