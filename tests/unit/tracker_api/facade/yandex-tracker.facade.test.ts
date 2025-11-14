import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { YandexTrackerFacade } from '@tracker_api/facade/yandex-tracker.facade.js';
import type { HttpClient } from '@infrastructure/http/client/http-client.js';
import type { RetryHandler } from '@infrastructure/http/retry/retry-handler.js';
import type { CacheManager } from '@infrastructure/cache/cache-manager.interface.js';
import type { Logger } from '@infrastructure/logging/index.js';
import type { ServerConfig } from '@types';
import type { PingResult } from '@tracker_api/operations/user/ping.operation.js';
import type { BatchIssueResult } from '@tracker_api/operations/issue/get-issues.operation.js';
import type { User } from '@tracker_api/entities/user.entity.js';
import type { Issue } from '@tracker_api/entities/issue.entity.js';

describe('YandexTrackerFacade', () => {
  let facade: YandexTrackerFacade;
  let mockHttpClient: HttpClient;
  let mockRetryHandler: RetryHandler;
  let mockCacheManager: CacheManager;
  let mockLogger: Logger;
  let mockConfig: ServerConfig;

  beforeEach(() => {
    // Mock HttpClient
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    } as unknown as HttpClient;

    // Mock RetryHandler
    mockRetryHandler = {
      executeWithRetry: vi.fn(async (fn) => await fn()),
    } as unknown as RetryHandler;

    // Mock CacheManager
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

    // Mock Config
    mockConfig = {
      organizationId: 'test-org',
      oauthToken: 'test-token',
      apiBaseUrl: 'https://api.tracker.yandex.net',
    } as ServerConfig;

    facade = new YandexTrackerFacade(
      mockHttpClient,
      mockRetryHandler,
      mockCacheManager,
      mockLogger,
      mockConfig
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('ping', () => {
    it('должна успешно вызвать операцию ping', async () => {
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
      const result: PingResult = await facade.ping();

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('Test User');
      expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/myself');
    });

    it('должна делегировать обработку ошибок операции ping', async () => {
      // Arrange
      const apiError = {
        name: 'ApiError',
        message: 'Unauthorized',
        statusCode: 401,
        requestId: 'req-123',
        timestamp: new Date().toISOString(),
      };

      vi.mocked(mockHttpClient.get).mockRejectedValue(apiError);

      // Act
      const result: PingResult = await facade.ping();

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Ошибка подключения');
    });
  });

  describe('getIssues', () => {
    it('должна успешно получить несколько задач', async () => {
      // Arrange
      const issueKeys = ['TEST-1', 'TEST-2'];
      const mockIssue1: Issue = {
        self: 'https://api.tracker.yandex.net/v3/issues/TEST-1',
        id: '1',
        key: 'TEST-1',
        version: 1,
        summary: 'Test Issue 1',
        statusStartTime: '2023-01-01T00:00:00.000+0000',
        updatedAt: '2023-01-01T00:00:00.000+0000',
        createdAt: '2023-01-01T00:00:00.000+0000',
      };
      const mockIssue2: Issue = {
        self: 'https://api.tracker.yandex.net/v3/issues/TEST-2',
        id: '2',
        key: 'TEST-2',
        version: 1,
        summary: 'Test Issue 2',
        statusStartTime: '2023-01-02T00:00:00.000+0000',
        updatedAt: '2023-01-02T00:00:00.000+0000',
        createdAt: '2023-01-02T00:00:00.000+0000',
      };

      vi.mocked(mockHttpClient.get)
        .mockResolvedValueOnce(mockIssue1)
        .mockResolvedValueOnce(mockIssue2);

      // Act
      const results: BatchIssueResult[] = await facade.getIssues(issueKeys);

      // Assert
      expect(results).toHaveLength(2);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');

      if (results[0].status === 'fulfilled') {
        expect(results[0].value.key).toBe('TEST-1');
      }
      if (results[1].status === 'fulfilled') {
        expect(results[1].value.key).toBe('TEST-2');
      }

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/issues/TEST-1');
      expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/issues/TEST-2');
    });

    it('должна обработать частичные ошибки при получении задач', async () => {
      // Arrange
      const issueKeys = ['TEST-1', 'INVALID'];
      const mockIssue: Issue = {
        self: 'https://api.tracker.yandex.net/v3/issues/TEST-1',
        id: '1',
        key: 'TEST-1',
        version: 1,
        summary: 'Test Issue',
        statusStartTime: '2023-01-01T00:00:00.000+0000',
        updatedAt: '2023-01-01T00:00:00.000+0000',
        createdAt: '2023-01-01T00:00:00.000+0000',
      };
      const apiError = new Error('Not Found');

      vi.mocked(mockHttpClient.get)
        .mockResolvedValueOnce(mockIssue)
        .mockRejectedValueOnce(apiError);

      // Act
      const results: BatchIssueResult[] = await facade.getIssues(issueKeys);

      // Assert
      expect(results).toHaveLength(2);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');

      if (results[0].status === 'fulfilled') {
        expect(results[0].value.key).toBe('TEST-1');
      }
      if (results[1].status === 'rejected') {
        expect(results[1].reason).toBeInstanceOf(Error);
        expect(results[1].reason.message).toBe('Not Found');
      }
    });

    it('должна вернуть пустой массив для пустого списка ключей', async () => {
      // Arrange
      const issueKeys: string[] = [];

      // Act
      const results: BatchIssueResult[] = await facade.getIssues(issueKeys);

      // Assert
      expect(results).toHaveLength(0);
      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });
  });

  describe('constructor', () => {
    it('должна правильно инициализировать operations', () => {
      // Act - создание нового экземпляра
      const newFacade = new YandexTrackerFacade(
        mockHttpClient,
        mockRetryHandler,
        mockCacheManager,
        mockLogger,
        mockConfig
      );

      // Assert - проверяем, что можем вызвать методы
      expect(newFacade.ping).toBeDefined();
      expect(newFacade.getIssues).toBeDefined();
      expect(typeof newFacade.ping).toBe('function');
      expect(typeof newFacade.getIssues).toBe('function');
    });
  });
});
