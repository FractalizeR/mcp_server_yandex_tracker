/**
 * Batch-операция получения нескольких задач параллельно
 *
 * Ответственность (SRP):
 * - ТОЛЬКО получение нескольких задач по ключам (batch-режим)
 * - Параллельное выполнение запросов через Promise.allSettled
 * - Валидация количества запросов против maxParallelRequests
 * - НЕТ создания/обновления/удаления
 * - НЕТ поиска задач
 */

import { BaseOperation } from '@tracker_api/operations/base-operation.js';
import { EntityCacheKey, EntityType } from '@infrastructure/cache/entity-cache-key.js';
import type { IssueWithUnknownFields } from '@tracker_api/entities/index.js';

/**
 * Результат batch-операции для одной задачи
 */
export interface BatchIssueResult {
  /** Статус операции */
  status: 'fulfilled' | 'rejected';
  /** Ключ задачи */
  issueKey: string;
  /** Данные задачи (если успех) - с возможными unknown полями */
  value?: IssueWithUnknownFields;
  /** Причина ошибки (если провал) */
  reason?: Error;
}

export class GetIssuesOperation extends BaseOperation {
  /**
   * Получает несколько задач параллельно
   * @param issueKeys - массив ключей задач (например, ['QUEUE-123', 'QUEUE-456'])
   * @returns массив результатов (fulfilled | rejected) в том же порядке, что и входные ключи
   * @throws {Error} если количество ключей превышает maxBatchSize (валидация в ParallelExecutor)
   */
  async execute(issueKeys: string[]): Promise<BatchIssueResult[]> {
    // Проверка на пустой массив
    if (issueKeys.length === 0) {
      this.logger.warn('GetIssuesOperation: пустой массив ключей');
      return [];
    }

    this.logger.info(`Получение ${issueKeys.length} задач параллельно: ${issueKeys.join(', ')}`);

    // Создаем массив промисов для параллельного выполнения
    const promises = issueKeys.map(async (issueKey): Promise<IssueWithUnknownFields> => {
      const cacheKey = EntityCacheKey.createKey(EntityType.ISSUE, issueKey);

      return this.withCache(cacheKey, async () => {
        return this.withRetry(() =>
          this.httpClient.get<IssueWithUnknownFields>(`/v3/issues/${issueKey}`)
        );
      });
    });

    // Выполняем все запросы параллельно с Promise.allSettled
    // Это гарантирует, что все промисы завершатся (fulfilled или rejected)
    const results = await Promise.allSettled(promises);

    // Преобразуем результаты в BatchIssueResult с привязкой к оригинальным ключам
    return results.map((result, index) => {
      const issueKey = issueKeys[index] as string; // Safe: index всегда в пределах массива

      if (result.status === 'fulfilled') {
        return {
          status: 'fulfilled',
          issueKey,
          value: result.value,
        };
      } else {
        this.logger.error(`Ошибка получения задачи ${issueKey}:`, result.reason);
        return {
          status: 'rejected',
          issueKey,
          reason: result.reason instanceof Error ? result.reason : new Error(String(result.reason)),
        };
      }
    });
  }
}
