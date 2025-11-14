/**
 * InversifyJS DI Container
 *
 * Централизованная конфигурация всех зависимостей проекта.
 * Использует Symbol-based токены для типобезопасной привязки.
 */

import 'reflect-metadata';
import { Container } from 'inversify';
import type { ServerConfig } from '@types';
import { Logger } from '@infrastructure/logging/index.js';
import { TYPES } from '@composition-root/types.js';

// HTTP Layer
import { HttpClient } from '@infrastructure/http/client/http-client.js';
import { RetryHandler } from '@infrastructure/http/retry/retry-handler.js';
import type { RetryStrategy } from '@infrastructure/http/retry/retry-strategy.interface.js';
import { ExponentialBackoffStrategy } from '@infrastructure/http/retry/exponential-backoff.strategy.js';

// Cache Layer
import type { CacheManager } from '@infrastructure/cache/cache-manager.interface.js';
import { NoOpCache } from '@infrastructure/cache/no-op-cache.js';

// Yandex Tracker Facade
import { YandexTrackerFacade } from '@tracker_api/facade/yandex-tracker.facade.js';

// Tool Registry
import { ToolRegistry } from '@mcp/tool-registry.js';

// Автоматически импортируемые определения
import { TOOL_CLASSES, OPERATION_CLASSES } from './definitions/index.js';

/**
 * Регистрация базовых зависимостей (config, logger)
 */
function bindInfrastructure(container: Container, config: ServerConfig): void {
  container.bind<ServerConfig>(TYPES.ServerConfig).toConstantValue(config);

  // Logger создаётся на основе конфигурации
  container.bind<Logger>(TYPES.Logger).toDynamicValue(() => {
    return new Logger({
      level: config.logLevel,
      logsDir: config.prettyLogs ? undefined : config.logsDir,
      pretty: config.prettyLogs,
      rotation: {
        maxSize: config.logMaxSize,
        maxFiles: config.logMaxFiles,
      },
    });
  });
}

/**
 * Регистрация HTTP слоя (retry, http client)
 */
function bindHttpLayer(container: Container): void {
  container
    .bind<RetryStrategy>(TYPES.RetryStrategy)
    .toConstantValue(new ExponentialBackoffStrategy(3, 1000, 10000));

  container.bind<HttpClient>(TYPES.HttpClient).toDynamicValue(() => {
    const retryStrategy = container.get<RetryStrategy>(TYPES.RetryStrategy);
    const loggerInstance = container.get<Logger>(TYPES.Logger);
    const configInstance = container.get<ServerConfig>(TYPES.ServerConfig);

    return new HttpClient(
      {
        baseURL: configInstance.apiBase,
        timeout: configInstance.requestTimeout,
        token: configInstance.token,
        orgId: configInstance.orgId,
        cloudOrgId: configInstance.cloudOrgId,
        maxBatchSize: configInstance.maxBatchSize,
        maxConcurrentRequests: configInstance.maxConcurrentRequests,
      },
      loggerInstance,
      retryStrategy
    );
  });

  container.bind<RetryHandler>(TYPES.RetryHandler).toDynamicValue(() => {
    const retryStrategy = container.get<RetryStrategy>(TYPES.RetryStrategy);
    const loggerInstance = container.get<Logger>(TYPES.Logger);
    return new RetryHandler(retryStrategy, loggerInstance);
  });
}

/**
 * Регистрация кеша
 */
function bindCacheLayer(container: Container): void {
  container.bind<CacheManager>(TYPES.CacheManager).to(NoOpCache);
}

/**
 * Регистрация операций Yandex Tracker
 *
 * АВТОМАТИЧЕСКАЯ РЕГИСТРАЦИЯ:
 * - Все операции из OPERATION_CLASSES автоматически регистрируются
 * - Символы создаются из имени класса (ClassName → Symbol.for('ClassName'))
 * - Для добавления новой операции: добавь класс в definitions/operation-definitions.ts
 */
function bindOperations(container: Container): void {
  for (const OperationClass of OPERATION_CLASSES) {
    const symbol = Symbol.for(OperationClass.name);

    container.bind(symbol).toDynamicValue(() => {
      const httpClient = container.get<HttpClient>(TYPES.HttpClient);
      const retryHandler = container.get<RetryHandler>(TYPES.RetryHandler);
      const cacheManager = container.get<CacheManager>(TYPES.CacheManager);
      const loggerInstance = container.get<Logger>(TYPES.Logger);
      const configInstance = container.get<ServerConfig>(TYPES.ServerConfig);
      return new OperationClass(
        httpClient,
        retryHandler,
        cacheManager,
        loggerInstance,
        configInstance
      );
    });
  }
}

/**
 * Регистрация Facade
 *
 * КРИТИЧЕСКИЕ ИЗМЕНЕНИЯ:
 * - Передаём контейнер вместо зависимостей
 * - Facade извлекает Operations ленив но из контейнера
 * - Масштабируется до 50+ операций БЕЗ изменения регистрации
 */
function bindFacade(container: Container): void {
  container.bind<YandexTrackerFacade>(TYPES.YandexTrackerFacade).toDynamicValue(() => {
    return new YandexTrackerFacade(container);
  });
}

/**
 * Регистрация Tools
 *
 * АВТОМАТИЧЕСКАЯ РЕГИСТРАЦИЯ:
 * - Все tools из TOOL_CLASSES автоматически регистрируются
 * - Символы создаются из имени класса (ClassName → Symbol.for('ClassName'))
 * - Для добавления нового tool: добавь класс в definitions/tool-definitions.ts
 */
function bindTools(container: Container): void {
  for (const ToolClass of TOOL_CLASSES) {
    const symbol = Symbol.for(ToolClass.name);

    container.bind(symbol).toDynamicValue(() => {
      const facade = container.get<YandexTrackerFacade>(TYPES.YandexTrackerFacade);
      const loggerInstance = container.get<Logger>(TYPES.Logger);
      return new ToolClass(facade, loggerInstance);
    });
  }
}

/**
 * Регистрация ToolRegistry
 *
 * ВАЖНО: ToolRegistry автоматически извлекает все tools из контейнера
 */
function bindToolRegistry(container: Container): void {
  container.bind<ToolRegistry>(TYPES.ToolRegistry).toDynamicValue(() => {
    const loggerInstance = container.get<Logger>(TYPES.Logger);
    // Передаём контейнер для автоматической регистрации всех tools
    return new ToolRegistry(container, loggerInstance);
  });
}

/**
 * Создание и конфигурация DI контейнера
 */
export function createContainer(config: ServerConfig): Container {
  const container = new Container({
    defaultScope: 'Singleton', // Все зависимости по умолчанию Singleton
  });

  bindInfrastructure(container, config);
  bindHttpLayer(container);
  bindCacheLayer(container);
  bindOperations(container);
  bindFacade(container);
  bindTools(container);
  bindToolRegistry(container);

  return container;
}
