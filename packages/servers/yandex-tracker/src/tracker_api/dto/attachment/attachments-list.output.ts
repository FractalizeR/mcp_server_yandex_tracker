/**
 * Output DTO для списка файлов (attachments)
 *
 * ВАЖНО: Возвращается операцией GetAttachmentsOperation.
 * Представляет собой массив всех файлов, прикрепленных к задаче.
 */

import type { Attachment } from '../../entities/attachment.entity.js';

/**
 * Результат получения списка файлов задачи
 */
export interface AttachmentsListOutput {
  /**
   * Массив прикрепленных файлов
   *
   * Может быть пустым, если к задаче не прикреплены файлы.
   */
  attachments: readonly Attachment[];

  /**
   * Общее количество файлов
   */
  total: number;

  /**
   * Общий размер всех файлов в байтах
   *
   * Полезно для отображения статистики и проверки лимитов.
   */
  totalSize: number;
}
