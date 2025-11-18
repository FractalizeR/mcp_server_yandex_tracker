/**
 * Input DTO для скачивания файла (attachment) из задачи
 *
 * ВАЖНО: Используется для конфигурации процесса скачивания.
 * Позволяет выбрать формат возврата данных.
 */

/**
 * Параметры для скачивания файла
 */
export interface DownloadAttachmentInput {
  /**
   * Путь для сохранения файла (опционально)
   *
   * Если указан, файл будет сохранен по этому пути.
   * Если не указан, файл будет возвращен в памяти.
   *
   * @example "/downloads/report.pdf"
   * @example "./attachments/screenshot.png"
   */
  saveToPath?: string;

  /**
   * Вернуть данные как base64 строку вместо Buffer (опционально)
   *
   * По умолчанию: false (возвращается Buffer)
   * Полезно для передачи через MCP API, где Buffer не поддерживается.
   *
   * @default false
   */
  returnBase64?: boolean;
}
