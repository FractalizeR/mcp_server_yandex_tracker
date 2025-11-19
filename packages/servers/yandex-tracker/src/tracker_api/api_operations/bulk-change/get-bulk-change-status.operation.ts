/**
 * Операция получения статуса bulk операции
 *
 * Ответственность (SRP):
 * - ТОЛЬКО получение статуса bulk операции по ID
 * - Отправка GET запроса на /v2/bulkchange/{operationId}
 * - Возврат актуального статуса операции
 * - НЕТ ожидания завершения (используется для polling)
 * - НЕТ автоматического повтора (один запрос = один статус)
 *
 * API: GET /v2/bulkchange/{operationId}
 */

import { BaseOperation } from '../base-operation.js';
import type { BulkChangeOperationWithUnknownFields } from '#tracker_api/entities/index.js';

export class GetBulkChangeStatusOperation extends BaseOperation {
  /**
   * Получить актуальный статус bulk операции
   *
   * @param operationId - идентификатор операции (из response.id при создании)
   * @returns актуальная информация о статусе операции
   *
   * ВАЖНО:
   * - Используется для polling статуса асинхронных операций
   * - НЕ ждёт завершения операции
   * - Возвращает мгновенный снапшот состояния
   * - Для ожидания завершения реализуй polling в вызывающем коде
   *
   * Возможные статусы:
   * - PENDING: операция в очереди
   * - RUNNING: операция выполняется
   * - COMPLETED: операция завершена успешно
   * - FAILED: операция завершена с ошибками
   * - CANCELLED: операция отменена
   *
   * @example
   * ```typescript
   * const status = await getBulkStatus.execute('12345');
   * console.log(`Статус: ${status.status}, прогресс: ${status.progress}%`);
   * console.log(`Обработано: ${status.processedIssues}/${status.totalIssues}`);
   * ```
   *
   * @example
   * // Polling с ожиданием завершения
   * ```typescript
   * async function waitForCompletion(operationId: string): Promise<BulkChangeOperation> {
   *   while (true) {
   *     const status = await getBulkStatus.execute(operationId);
   *
   *     if (status.status === 'COMPLETED' || status.status === 'FAILED') {
   *       return status;
   *     }
   *
   *     // Ждём 2 секунды перед следующей проверкой
   *     await new Promise(resolve => setTimeout(resolve, 2000));
   *   }
   * }
   * ```
   */
  async execute(operationId: string): Promise<BulkChangeOperationWithUnknownFields> {
    this.logger.debug(`Получение статуса bulk операции: ${operationId}`);

    const endpoint = `/v2/bulkchange/${operationId}`;

    const response = await this.httpClient.get<BulkChangeOperationWithUnknownFields>(endpoint);

    this.logger.debug(
      `Bulk операция ${operationId}: статус ${response.status}, прогресс ${response.progress ?? 'N/A'}%`
    );

    return response;
  }
}
