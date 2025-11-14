/**
 * Утилита для обработки результатов batch-операций
 *
 * Переиспользуемая логика для:
 * - Разделения успешных и неудачных результатов
 * - Применения фильтров к данным
 * - Стандартизированного форматирования результатов
 */

import type { BatchResult, FulfilledResult, RejectedResult } from '@types';

/**
 * Обработанный результат batch-операции
 */
export interface ProcessedBatchResult<T> {
  /** Успешно обработанные элементы */
  successful: Array<{ issueKey: string; data: T }>;
  /** Неудачные элементы с описанием ошибок */
  failed: Array<{ issueKey: string; error: string }>;
}

/**
 * Процессор для обработки результатов batch-операций
 *
 * Соблюдает SRP: только преобразование BatchResult в удобный формат
 */
export class BatchResultProcessor {
  /**
   * Обработать результаты batch-операции
   *
   * @param results - результаты batch-операции
   * @param filterFn - опциональная функция фильтрации данных (например, ResponseFieldFilter)
   * @returns обработанные результаты с разделением на успешные и неудачные
   */
  static process<TInput, TOutput = TInput>(
    results: BatchResult<TInput>,
    filterFn?: (item: TInput) => TOutput
  ): ProcessedBatchResult<TOutput> {
    const successful: Array<{ issueKey: string; data: TOutput }> = [];
    const failed: Array<{ issueKey: string; error: string }> = [];

    for (const result of results) {
      if (this.isFulfilledResult(result)) {
        // Type Guard: когда status === 'fulfilled', value всегда определено
        if (!result.value) {
          failed.push({
            issueKey: result.issueKey,
            error: 'Задача не найдена (пустой результат)',
          });
          continue;
        }

        // Применяем фильтр если указан, иначе используем данные как есть
        const data: TOutput = filterFn ? filterFn(result.value) : (result.value as TOutput);

        successful.push({
          issueKey: result.issueKey,
          data,
        });
      } else {
        const error =
          result.reason instanceof Error ? result.reason.message : String(result.reason);

        failed.push({
          issueKey: result.issueKey,
          error,
        });
      }
    }

    return { successful, failed };
  }

  /**
   * Type guard для проверки успешного результата
   */
  private static isFulfilledResult<T>(
    result: FulfilledResult<T> | RejectedResult
  ): result is FulfilledResult<T> {
    return result.status === 'fulfilled';
  }
}
