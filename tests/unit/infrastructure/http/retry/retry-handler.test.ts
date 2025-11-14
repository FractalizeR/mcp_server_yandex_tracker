/**
 * Тесты для RetryHandler
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { RetryHandler } from '../../../../src/infrastructure/http/retry/retry-handler.js';
import type { RetryStrategy } from '../../../../src/infrastructure/http/retry/retry-strategy.interface.js';
import type { Logger } from '../../../../src/infrastructure/logger.js';
import type { ApiError } from '../../../../../src/types.js';

/**
 * Создание мок стратегии
 */
function createMockStrategy(overrides: Partial<RetryStrategy> = {}): RetryStrategy {
  return {
    maxRetries: 3,
    shouldRetry: jest.fn(() => true),
    getDelay: jest.fn(() => 100),
    ...overrides,
  } as RetryStrategy;
}

/**
 * Создание мок логгера
 */
function createMockLogger(): Logger {
  return {
    debug: jest.fn() as jest.Mock,
    info: jest.fn() as jest.Mock,
    warn: jest.fn() as jest.Mock,
    error: jest.fn() as jest.Mock,
  } as unknown as Logger;
}

describe('RetryHandler', () => {
  let mockStrategy: RetryStrategy;
  let mockLogger: Logger;
  let retryHandler: RetryHandler;

  beforeEach(() => {
    mockStrategy = createMockStrategy();
    mockLogger = createMockLogger();
    retryHandler = new RetryHandler(mockStrategy, mockLogger);

    // Сбрасываем моки перед каждым тестом
    jest.clearAllMocks();
  });

  describe('executeWithRetry', () => {
    describe('Успешное выполнение', () => {
      it('должен вернуть результат при успешном выполнении с первой попытки', async () => {
        const fn = jest.fn(async () => 'success');

        const result = await retryHandler.executeWithRetry(fn);

        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(1);
        expect(mockStrategy.shouldRetry).not.toHaveBeenCalled();
      });

      it('должен работать с любым типом возвращаемого значения', async () => {
        const objectFn = jest.fn(async () => ({ data: 'test' }));
        const numberFn = jest.fn(async () => 42);
        const arrayFn = jest.fn(async () => [1, 2, 3]);

        const objectResult = await retryHandler.executeWithRetry(objectFn);
        const numberResult = await retryHandler.executeWithRetry(numberFn);
        const arrayResult = await retryHandler.executeWithRetry(arrayFn);

        expect(objectResult).toEqual({ data: 'test' });
        expect(numberResult).toBe(42);
        expect(arrayResult).toEqual([1, 2, 3]);
      });
    });

    describe('Retry при ошибках', () => {
      it('должен повторить запрос после неудачной попытки', async () => {
        const error: ApiError = { statusCode: 500, message: 'Server Error' };
        const fn = jest.fn<() => Promise<string>>()
          .mockRejectedValueOnce(error)
          .mockResolvedValueOnce('success');

        const result = await retryHandler.executeWithRetry(fn);

        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(2);
        expect(mockStrategy.shouldRetry).toHaveBeenCalledWith(error, 0);
        expect(mockStrategy.getDelay).toHaveBeenCalledWith(0, error);
        expect(mockLogger.warn).toHaveBeenCalled();
      });

      it('должен повторить запрос несколько раз до успеха', async () => {
        const error: ApiError = { statusCode: 503, message: 'Service Unavailable' };
        const fn = jest.fn<() => Promise<string>>()
          .mockRejectedValueOnce(error)
          .mockRejectedValueOnce(error)
          .mockResolvedValueOnce('success');

        const result = await retryHandler.executeWithRetry(fn);

        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(3);
        expect(mockStrategy.shouldRetry).toHaveBeenCalledTimes(2);
      });

      it('должен использовать задержку из стратегии', async () => {
        const error: ApiError = { statusCode: 500, message: 'Server Error' };
        const customDelay = 500;

        jest.mocked(mockStrategy.getDelay).mockImplementation(() => customDelay);

        const fn = jest.fn<() => Promise<string>>()
          .mockRejectedValueOnce(error)
          .mockResolvedValueOnce('success');

        const startTime = Date.now();
        await retryHandler.executeWithRetry(fn);
        const duration = Date.now() - startTime;

        // Проверяем, что прошло не менее customDelay миллисекунд
        expect(duration).toBeGreaterThanOrEqual(customDelay - 50); // -50 для погрешности
        expect(mockStrategy.getDelay).toHaveBeenCalledWith(0, error);
      });
    });

    describe('Достижение лимита попыток', () => {
      it('должен выбросить ошибку после достижения maxRetries', async () => {
        const error: ApiError = { statusCode: 500, message: 'Server Error' };

        // Настраиваем стратегию: разрешаем retry только для попыток 0, 1, 2
        jest.mocked(mockStrategy.shouldRetry).mockImplementation((_, attempt) => attempt < 3);

        const fn = jest.fn<() => Promise<string>>().mockRejectedValue(error);

        await expect(retryHandler.executeWithRetry(fn)).rejects.toEqual(error);

        expect(fn).toHaveBeenCalledTimes(4); // Первоначальная + 3 retry
        expect(mockLogger.warn).toHaveBeenCalledWith(
          expect.stringContaining('Достигнут максимум попыток')
        );
      });

      it('должен логировать причину отказа от повтора', async () => {
        const error: ApiError = { statusCode: 500, message: 'Server Error' };

        jest.mocked(mockStrategy.shouldRetry).mockImplementation(() => false);
        const fn = jest.fn<() => Promise<string>>().mockRejectedValue(error);

        await expect(retryHandler.executeWithRetry(fn)).rejects.toEqual(error);

        // При attempt=0 и shouldRetry=false вызывается debug (не повторяемая ошибка)
        expect(mockLogger.debug).toHaveBeenCalledWith(
          expect.stringContaining('не является повторяемой')
        );
      });
    });

    describe('Неповторяемые ошибки', () => {
      it('должен немедленно выбросить ошибку для неповторяемых статус-кодов', async () => {
        const error: ApiError = { statusCode: 400, message: 'Bad Request' };

        jest.mocked(mockStrategy.shouldRetry).mockImplementation(() => false);
        const fn = jest.fn<() => Promise<string>>().mockRejectedValue(error);

        await expect(retryHandler.executeWithRetry(fn)).rejects.toEqual(error);

        expect(fn).toHaveBeenCalledTimes(1); // Только первая попытка
        expect(mockStrategy.shouldRetry).toHaveBeenCalledWith(error, 0);
        expect(mockLogger.debug).toHaveBeenCalledWith(
          expect.stringContaining('не является повторяемой')
        );
      });

      it('должен немедленно выбросить ошибку 404', async () => {
        const error: ApiError = { statusCode: 404, message: 'Not Found' };

        jest.mocked(mockStrategy.shouldRetry).mockImplementation(() => false);
        const fn = jest.fn<() => Promise<string>>().mockRejectedValue(error);

        await expect(retryHandler.executeWithRetry(fn)).rejects.toEqual(error);

        expect(fn).toHaveBeenCalledTimes(1);
      });
    });

    describe('Логирование', () => {
      it('должен логировать информацию о повторе', async () => {
        const error: ApiError = { statusCode: 500, message: 'Server Error' };
        const fn = jest.fn<() => Promise<string>>()
          .mockRejectedValueOnce(error)
          .mockResolvedValueOnce('success');

        await retryHandler.executeWithRetry(fn);

        expect(mockLogger.warn).toHaveBeenCalledWith(
          expect.stringContaining('Попытка 1/')
        );
        expect(mockLogger.warn).toHaveBeenCalledWith(
          expect.stringContaining('Server Error')
        );
        expect(mockLogger.warn).toHaveBeenCalledWith(
          expect.stringContaining('Ожидание')
        );
      });

      it('должен логировать код ошибки', async () => {
        const error: ApiError = { statusCode: 503, message: 'Service Unavailable' };
        const fn = jest.fn<() => Promise<string>>()
          .mockRejectedValueOnce(error)
          .mockResolvedValueOnce('success');

        await retryHandler.executeWithRetry(fn);

        expect(mockLogger.warn).toHaveBeenCalledWith(
          expect.stringContaining('код: 503')
        );
      });

      it('должен логировать задержку', async () => {
        const error: ApiError = { statusCode: 500, message: 'Server Error' };
        const delay = 2000;

        jest.mocked(mockStrategy.getDelay).mockImplementation(() => delay);
        const fn = jest.fn<() => Promise<string>>()
          .mockRejectedValueOnce(error)
          .mockResolvedValueOnce('success');

        await retryHandler.executeWithRetry(fn);

        expect(mockLogger.warn).toHaveBeenCalledWith(
          expect.stringContaining('Ожидание 2000ms')
        );
      });
    });

    describe('Специальные сценарии', () => {
      it('должен обработать rate limiting с retryAfter', async () => {
        const error: ApiError = {
          statusCode: 429,
          message: 'Rate limit exceeded',
          retryAfter: 60,
        };

        jest.mocked(mockStrategy.getDelay).mockImplementation(() => 100); // Короткая задержка для теста
        const fn = jest.fn<() => Promise<string>>()
          .mockRejectedValueOnce(error)
          .mockResolvedValueOnce('success');

        await retryHandler.executeWithRetry(fn);

        expect(mockStrategy.getDelay).toHaveBeenCalledWith(0, error);
        expect(fn).toHaveBeenCalledTimes(2);
      });

      it('должен обработать сетевую ошибку (statusCode = 0)', async () => {
        const error: ApiError = { statusCode: 0, message: 'Network Error' };
        const fn = jest.fn<() => Promise<string>>()
          .mockRejectedValueOnce(error)
          .mockResolvedValueOnce('success');

        await retryHandler.executeWithRetry(fn);

        expect(fn).toHaveBeenCalledTimes(2);
        expect(mockStrategy.shouldRetry).toHaveBeenCalledWith(error, 0);
      });

      it('должен обработать ошибки с дополнительными полями', async () => {
        const error: ApiError = {
          statusCode: 500,
          message: 'Server Error',
          errors: {
            field1: ['Error 1'],
            field2: ['Error 2'],
          },
        };
        const fn = jest.fn<() => Promise<string>>()
          .mockRejectedValueOnce(error)
          .mockResolvedValueOnce('success');

        await retryHandler.executeWithRetry(fn);

        expect(fn).toHaveBeenCalledTimes(2);
      });
    });

    describe('Граничные случаи', () => {
      it('должен обработать нулевую задержку', async () => {
        const error: ApiError = { statusCode: 500, message: 'Server Error' };

        jest.mocked(mockStrategy.getDelay).mockImplementation(() => 0);
        const fn = jest.fn<() => Promise<string>>()
          .mockRejectedValueOnce(error)
          .mockResolvedValueOnce('success');

        const startTime = Date.now();
        await retryHandler.executeWithRetry(fn);
        const duration = Date.now() - startTime;

        expect(duration).toBeLessThan(100); // Минимальная задержка
        expect(fn).toHaveBeenCalledTimes(2);
      });

      it('должен передать попытку с правильным индексом', async () => {
        const error: ApiError = { statusCode: 500, message: 'Server Error' };
        const fn = jest.fn<() => Promise<string>>()
          .mockRejectedValueOnce(error)
          .mockRejectedValueOnce(error)
          .mockResolvedValueOnce('success');

        await retryHandler.executeWithRetry(fn);

        expect(mockStrategy.shouldRetry).toHaveBeenNthCalledWith(1, error, 0);
        expect(mockStrategy.shouldRetry).toHaveBeenNthCalledWith(2, error, 1);
      });

      it('должен обработать начальную попытку не с 0', async () => {
        const error: ApiError = { statusCode: 500, message: 'Server Error' };
        const fn = jest.fn<() => Promise<string>>()
          .mockRejectedValueOnce(error)
          .mockResolvedValueOnce('success');

        // Вызываем с attempt = 2
        await retryHandler.executeWithRetry(fn, 2);

        expect(mockStrategy.shouldRetry).toHaveBeenCalledWith(error, 2);
      });
    });
  });

  describe('Интеграция со стратегией', () => {
    it('должен корректно работать с реальной ExponentialBackoffStrategy', async () => {
      const realStrategy: RetryStrategy = {
        maxRetries: 2,
        shouldRetry: (error: ApiError, attempt: number) => {
          if (attempt >= 2) return false;
          return [0, 408, 429, 500, 502, 503, 504].includes(error.statusCode);
        },
        getDelay: (attempt: number) => Math.min(100 * Math.pow(2, attempt), 1000),
      };

      const handler = new RetryHandler(realStrategy, mockLogger);
      const error: ApiError = { statusCode: 503, message: 'Service Unavailable' };

      const fn = jest.fn<() => Promise<string>>()
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce('success');

      const result = await handler.executeWithRetry(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });
});
