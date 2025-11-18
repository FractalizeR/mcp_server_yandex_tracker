/**
 * Output DTO для результата скачивания файла
 *
 * ВАЖНО: Содержит как сам файл, так и метаданные о нем.
 * Позволяет клиенту узнать информацию о скачанном файле.
 */

import type { Attachment } from '../../entities/attachment.entity.js';

/**
 * Результат скачивания файла
 */
export interface DownloadAttachmentOutput {
  /**
   * Содержимое файла
   *
   * Может быть:
   * - Buffer: бинарные данные файла
   * - string: base64-encoded данные (если returnBase64=true)
   */
  content: Buffer | string;

  /**
   * Метаданные о файле
   *
   * Включает информацию из Attachment entity:
   * - имя файла
   * - MIME тип
   * - размер
   * - и т.д.
   */
  metadata: Attachment;

  /**
   * Путь к сохраненному файлу (если saveToPath был указан)
   *
   * @example "/downloads/report.pdf"
   */
  savedPath?: string;
}
