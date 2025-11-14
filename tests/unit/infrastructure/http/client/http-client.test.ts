/**
 * Unit тесты для HttpClient
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HttpClient } from '@infrastructure/http/client/http-client.js';
import type { HttpConfig } from '@infrastructure/http/client/http-config.interface.js';
import type { Logger } from '@infrastructure/logging/index.js';
import type { RetryStrategy } from '@infrastructure/http/retry/retry-strategy.interface.js';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

/**
 * Создаёт мок логгера
 */
function createMockLogger(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } as unknown as Logger;
}

/**
 * Создаёт мок retry стратегии (без повторов)
 */
function createMockRetryStrategy(): RetryStrategy {
  return {
    maxRetries: 0, // Без повторов для упрощения тестов
    shouldRetry: (): boolean => false,
    getDelay: (): number => 0,
  };
}

/**
 * Создаёт мок AxiosInstance
 */
function createMockAxiosInstance() {
  const mockInstance = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn(() => 0),
      },
      response: {
        use: vi.fn(() => 0),
      },
    },
  };
  return mockInstance;
}

describe('HttpClient', () => {
  let httpClient: HttpClient;
  let logger: Logger;
  let config: HttpConfig;
  let retryStrategy: RetryStrategy;
  let mockAxiosInstance: ReturnType<typeof createMockAxiosInstance>;

  beforeEach(() => {
    vi.clearAllMocks();

    logger = createMockLogger();
    retryStrategy = createMockRetryStrategy();
    config = {
      baseURL: 'https://api.tracker.yandex.net',
      timeout: 30000,
      token: 'test-token',
      orgId: 'test-org-id',
      maxBatchSize: 100,
      maxConcurrentRequests: 5,
    };

    mockAxiosInstance = createMockAxiosInstance();
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

    httpClient = new HttpClient(config, logger, retryStrategy);
  });

  describe('constructor', () => {
    it('должен создать HttpClient с правильной конфигурацией (с orgId)', () => {
      // Arrange
      const configWithOrgId: HttpConfig = {
        baseURL: 'https://api.tracker.yandex.net',
        timeout: 30000,
        token: 'test-token',
        orgId: 'test-org-id',
        maxBatchSize: 100,
        maxConcurrentRequests: 5,
      };

      // Act
      const client = new HttpClient(configWithOrgId, logger, retryStrategy);

      // Assert
      expect(client).toBeDefined();
      expect(client.get).toBeDefined();
      expect(client.post).toBeDefined();
      expect(client.patch).toBeDefined();
      expect(client.delete).toBeDefined();
    });

    it('должен создать HttpClient с правильной конфигурацией (с cloudOrgId)', () => {
      // Arrange
      const configWithCloudOrgId: HttpConfig = {
        baseURL: 'https://api.tracker.yandex.net',
        timeout: 30000,
        token: 'test-token',
        cloudOrgId: 'bpf3crucp1v2test',
        maxBatchSize: 100,
        maxConcurrentRequests: 5,
      };

      // Act
      const client = new HttpClient(configWithCloudOrgId, logger, retryStrategy);

      // Assert
      expect(client).toBeDefined();
      expect(client.get).toBeDefined();
      expect(client.post).toBeDefined();
      expect(client.patch).toBeDefined();
      expect(client.delete).toBeDefined();
    });

    it('должен создать HttpClient даже если оба ID не указаны (для тестов)', () => {
      // Arrange
      const configWithoutOrgIds: HttpConfig = {
        baseURL: 'https://api.tracker.yandex.net',
        timeout: 30000,
        token: 'test-token',
        maxBatchSize: 100,
        maxConcurrentRequests: 5,
      };

      // Act
      const client = new HttpClient(configWithoutOrgIds, logger, retryStrategy);

      // Assert
      expect(client).toBeDefined();
    });
  });

  describe('одиночные методы с retry', () => {
    describe('get', () => {
      it('должен иметь метод get', () => {
        // Assert
        expect(httpClient.get).toBeDefined();
        expect(typeof httpClient.get).toBe('function');
      });
    });

    describe('post', () => {
      it('должен иметь метод post', () => {
        // Assert
        expect(httpClient.post).toBeDefined();
        expect(typeof httpClient.post).toBe('function');
      });
    });

    describe('patch', () => {
      it('должен иметь метод patch', () => {
        // Assert
        expect(httpClient.patch).toBeDefined();
        expect(typeof httpClient.patch).toBe('function');
      });
    });

    describe('delete', () => {
      it('должен иметь метод delete', () => {
        // Assert
        expect(httpClient.delete).toBeDefined();
        expect(typeof httpClient.delete).toBe('function');
      });
    });
  });

  describe('пакетные методы', () => {
    describe('getBatch', () => {
      it('должен вернуть BatchResult с успешными результатами', async () => {
        // Arrange
        const paths = ['/v3/issues/QUEUE-1', '/v3/issues/QUEUE-2', '/v3/issues/QUEUE-3'];
        const mockResponses = [
          { data: { key: 'QUEUE-1', summary: 'Issue 1' } },
          { data: { key: 'QUEUE-2', summary: 'Issue 2' } },
          { data: { key: 'QUEUE-3', summary: 'Issue 3' } },
        ];

        mockAxiosInstance.get
          .mockResolvedValueOnce(mockResponses[0])
          .mockResolvedValueOnce(mockResponses[1])
          .mockResolvedValueOnce(mockResponses[2]);

        // Act
        const result = await httpClient.getBatch(paths);

        // Assert
        expect(result).toHaveLength(3);

        // Проверяем, что все результаты успешные
        const fulfilled = result.filter((r) => r.status === 'fulfilled');
        expect(fulfilled).toHaveLength(3);

        // Проверяем структуру успешных результатов
        fulfilled.forEach((r, idx) => {
          expect(r.status).toBe('fulfilled');
          expect(r.key).toBe(paths[idx]);
          expect(r.index).toBe(idx);
          if (r.status === 'fulfilled') {
            expect(r.value).toEqual(mockResponses[idx]?.data);
          }
        });
      });

      it('должен вернуть BatchResult с частично успешными результатами', async () => {
        // Arrange
        const paths = ['/v3/issues/QUEUE-1', '/v3/issues/QUEUE-2', '/v3/issues/QUEUE-3'];
        const mockResponse1 = { data: { key: 'QUEUE-1', summary: 'Issue 1' } };
        const mockError = new Error('Not found');
        const mockResponse3 = { data: { key: 'QUEUE-3', summary: 'Issue 3' } };

        mockAxiosInstance.get
          .mockResolvedValueOnce(mockResponse1)
          .mockRejectedValueOnce(mockError)
          .mockResolvedValueOnce(mockResponse3);

        // Act
        const result = await httpClient.getBatch(paths);

        // Assert
        expect(result).toHaveLength(3);

        // Проверяем успешные результаты
        const fulfilled = result.filter((r) => r.status === 'fulfilled');
        expect(fulfilled).toHaveLength(2);

        // Проверяем неудачные результаты
        const rejected = result.filter((r) => r.status === 'rejected');
        expect(rejected).toHaveLength(1);

        // Проверяем структуру rejected результата
        const rejectedResult = rejected[0];
        expect(rejectedResult).toBeDefined();
        if (rejectedResult) {
          expect(rejectedResult.status).toBe('rejected');
          expect(rejectedResult.key).toBe(paths[1]);
          expect(rejectedResult.index).toBe(1);
          if (rejectedResult.status === 'rejected') {
            expect(rejectedResult.reason).toBeInstanceOf(Error);
          }
        }
      });

      it('должен вернуть BatchResult с ошибками для всех запросов', async () => {
        // Arrange
        const paths = ['/v3/issues/QUEUE-1', '/v3/issues/QUEUE-2'];
        const mockError1 = new Error('Error 1');
        const mockError2 = new Error('Error 2');

        mockAxiosInstance.get.mockRejectedValueOnce(mockError1).mockRejectedValueOnce(mockError2);

        // Act
        const result = await httpClient.getBatch(paths);

        // Assert
        expect(result).toHaveLength(2);

        // Все результаты должны быть rejected
        const rejected = result.filter((r) => r.status === 'rejected');
        expect(rejected).toHaveLength(2);

        // Проверяем структуру
        rejected.forEach((r, idx) => {
          expect(r.status).toBe('rejected');
          expect(r.key).toBe(paths[idx]);
          expect(r.index).toBe(idx);
          if (r.status === 'rejected') {
            expect(r.reason).toBeInstanceOf(Error);
          }
        });
      });
    });

    describe('postBatch', () => {
      it('должен вернуть BatchResult с успешными результатами', async () => {
        // Arrange
        const requests = [
          { path: '/v3/issues', data: { queue: 'PROJ', summary: 'Issue 1' } },
          { path: '/v3/issues', data: { queue: 'PROJ', summary: 'Issue 2' } },
        ];
        const mockResponses = [
          { data: { key: 'PROJ-1', summary: 'Issue 1' } },
          { data: { key: 'PROJ-2', summary: 'Issue 2' } },
        ];

        mockAxiosInstance.post
          .mockResolvedValueOnce(mockResponses[0])
          .mockResolvedValueOnce(mockResponses[1]);

        // Act
        const result = await httpClient.postBatch(requests);

        // Assert
        expect(result).toHaveLength(2);

        const fulfilled = result.filter((r) => r.status === 'fulfilled');
        expect(fulfilled).toHaveLength(2);

        fulfilled.forEach((r, idx) => {
          expect(r.status).toBe('fulfilled');
          expect(r.key).toBe(requests[idx]?.path);
          expect(r.index).toBe(idx);
          if (r.status === 'fulfilled') {
            expect(r.value).toEqual(mockResponses[idx]?.data);
          }
        });
      });

      it('должен вернуть BatchResult с частично успешными результатами', async () => {
        // Arrange
        const requests = [
          { path: '/v3/issues', data: { queue: 'PROJ', summary: 'Issue 1' } },
          { path: '/v3/issues', data: { queue: 'PROJ', summary: 'Issue 2' } },
        ];
        const mockResponse = { data: { key: 'PROJ-1', summary: 'Issue 1' } };
        const mockError = new Error('Validation error');

        mockAxiosInstance.post.mockResolvedValueOnce(mockResponse).mockRejectedValueOnce(mockError);

        // Act
        const result = await httpClient.postBatch(requests);

        // Assert
        expect(result).toHaveLength(2);

        const fulfilled = result.filter((r) => r.status === 'fulfilled');
        expect(fulfilled).toHaveLength(1);

        const rejected = result.filter((r) => r.status === 'rejected');
        expect(rejected).toHaveLength(1);

        if (rejected[0]) {
          expect(rejected[0].key).toBe(requests[1]?.path);
        }
      });
    });

    describe('patchBatch', () => {
      it('должен вернуть BatchResult с успешными результатами', async () => {
        // Arrange
        const requests = [
          { path: '/v3/issues/QUEUE-1', data: { summary: 'Updated 1' } },
          { path: '/v3/issues/QUEUE-2', data: { summary: 'Updated 2' } },
        ];
        const mockResponses = [
          { data: { key: 'QUEUE-1', summary: 'Updated 1' } },
          { data: { key: 'QUEUE-2', summary: 'Updated 2' } },
        ];

        mockAxiosInstance.patch
          .mockResolvedValueOnce(mockResponses[0])
          .mockResolvedValueOnce(mockResponses[1]);

        // Act
        const result = await httpClient.patchBatch(requests);

        // Assert
        expect(result).toHaveLength(2);

        const fulfilled = result.filter((r) => r.status === 'fulfilled');
        expect(fulfilled).toHaveLength(2);

        fulfilled.forEach((r, idx) => {
          expect(r.status).toBe('fulfilled');
          expect(r.key).toBe(requests[idx]?.path);
          expect(r.index).toBe(idx);
          if (r.status === 'fulfilled') {
            expect(r.value).toEqual(mockResponses[idx]?.data);
          }
        });
      });

      it('должен вернуть BatchResult с частично успешными результатами', async () => {
        // Arrange
        const requests = [
          { path: '/v3/issues/QUEUE-1', data: { summary: 'Updated 1' } },
          { path: '/v3/issues/QUEUE-2', data: { summary: 'Updated 2' } },
        ];
        const mockResponse = { data: { key: 'QUEUE-1', summary: 'Updated 1' } };
        const mockError = new Error('Update failed');

        mockAxiosInstance.patch
          .mockResolvedValueOnce(mockResponse)
          .mockRejectedValueOnce(mockError);

        // Act
        const result = await httpClient.patchBatch(requests);

        // Assert
        expect(result).toHaveLength(2);

        const fulfilled = result.filter((r) => r.status === 'fulfilled');
        expect(fulfilled).toHaveLength(1);

        const rejected = result.filter((r) => r.status === 'rejected');
        expect(rejected).toHaveLength(1);

        if (rejected[0]) {
          expect(rejected[0].key).toBe(requests[1]?.path);
        }
      });
    });

    describe('deleteBatch', () => {
      it('должен вернуть BatchResult с успешными результатами', async () => {
        // Arrange
        const paths = ['/v3/issues/QUEUE-1', '/v3/issues/QUEUE-2'];
        const mockResponses = [{ data: {} }, { data: {} }];

        mockAxiosInstance.delete
          .mockResolvedValueOnce(mockResponses[0])
          .mockResolvedValueOnce(mockResponses[1]);

        // Act
        const result = await httpClient.deleteBatch(paths);

        // Assert
        expect(result).toHaveLength(2);

        const fulfilled = result.filter((r) => r.status === 'fulfilled');
        expect(fulfilled).toHaveLength(2);

        fulfilled.forEach((r, idx) => {
          expect(r.status).toBe('fulfilled');
          expect(r.key).toBe(paths[idx]);
          expect(r.index).toBe(idx);
        });
      });

      it('должен вернуть BatchResult с частично успешными результатами', async () => {
        // Arrange
        const paths = ['/v3/issues/QUEUE-1', '/v3/issues/QUEUE-2'];
        const mockResponse = { data: {} };
        const mockError = new Error('Delete failed');

        mockAxiosInstance.delete
          .mockResolvedValueOnce(mockResponse)
          .mockRejectedValueOnce(mockError);

        // Act
        const result = await httpClient.deleteBatch(paths);

        // Assert
        expect(result).toHaveLength(2);

        const fulfilled = result.filter((r) => r.status === 'fulfilled');
        expect(fulfilled).toHaveLength(1);

        const rejected = result.filter((r) => r.status === 'rejected');
        expect(rejected).toHaveLength(1);

        if (rejected[0]) {
          expect(rejected[0].key).toBe(paths[1]);
        }
      });
    });
  });
});
