/**
 * Batch-операция обновления нескольких задач параллельно
 *
 * Ответственность (SRP):
 * - ТОЛЬКО обновление нескольких задач (batch-режим)
 * - Параллельное выполнение запросов через Promise.allSettled
 * - Валидация количества запросов против maxParallelRequests
 * - НЕТ получения/создания/удаления
 * - НЕТ кеширования (PATCH не кешируется)
 */

import { BaseOperation } from '@tracker_api/operations/base-operation.js';
import type { IssueWithUnknownFields } from '@tracker_api/entities/index.js';
import type { UpdateIssueDto } from '@tracker_api/dto/index.js';

/**
 * Параметры для batch-обновления одной задачи
 */
export interface UpdateIssueItem {
  /** Ключ задачи */
  issueKey: string;
  /** Параметры обновления (только known поля) */
  request: UpdateIssueDto;
}

/**
 * Результат batch-операции для одного обновления задачи
 */
export interface BatchUpdateIssueResult {
  /** Статус операции */
  status: 'fulfilled' | 'rejected';
  /** Ключ задачи */
  issueKey: string;
  /** Обновлённая задача (если успех) - с возможными unknown полями */
  value?: IssueWithUnknownFields;
  /** Причина ошибки (если провал) */
  reason?: Error;
}

export class UpdateIssuesOperation extends BaseOperation {
  /**
   * Обновляет несколько задач параллельно
   * @param items - массив параметров обновления задач
   * @returns массив результатов (fulfilled | rejected) в том же порядке, что и входные items
   * @throws {Error} если количество запросов превышает maxBatchSize (валидация в ParallelExecutor)
   */
  async execute(items: UpdateIssueItem[]): Promise<BatchUpdateIssueResult[]> {
    // Проверка на пустой массив
    if (items.length === 0) {
      this.logger.warn('UpdateIssuesOperation: пустой массив items');
      return [];
    }

    this.logger.info(`Обновление ${items.length} задач параллельно`);

    // Создаем массив промисов для параллельного выполнения
    const promises = items.map(async (item): Promise<IssueWithUnknownFields> => {
      // PATCH запросы НЕ кешируются, только retry
      return this.withRetry(() =>
        this.httpClient.patch<IssueWithUnknownFields>(`/v3/issues/${item.issueKey}`, item.request)
      );
    });

    // Выполняем все запросы параллельно с Promise.allSettled
    const results = await Promise.allSettled(promises);

    // Преобразуем результаты в BatchUpdateIssueResult с привязкой к оригинальным ключам
    return results.map((result, index) => {
      const item = items[index] as UpdateIssueItem; // Safe: index всегда в пределах массива

      if (result.status === 'fulfilled') {
        return {
          status: 'fulfilled',
          issueKey: item.issueKey,
          value: result.value,
        };
      } else {
        this.logger.error(`Ошибка обновления задачи ${item.issueKey}:`, result.reason);
        return {
          status: 'rejected',
          issueKey: item.issueKey,
          reason: result.reason instanceof Error ? result.reason : new Error(String(result.reason)),
        };
      }
    });
  }
}
