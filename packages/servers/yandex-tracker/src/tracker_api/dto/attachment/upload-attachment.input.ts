/**
 * Input DTO для загрузки файла (attachment) в задачу
 *
 * ВАЖНО: Содержит только known поля для type-safe отправки в API.
 * Используется в UploadAttachmentOperation и соответствующих tools.
 */

/**
 * Параметры для загрузки файла
 */
export interface UploadAttachmentInput {
  /**
   * Имя файла
   *
   * ВАЖНО: Должно содержать расширение для правильного определения MIME типа.
   *
   * @example "screenshot.png"
   * @example "document.pdf"
   */
  filename: string;

  /**
   * Содержимое файла
   *
   * Может быть:
   * - Buffer: для прямой загрузки бинарных данных
   * - string (base64): для передачи через MCP API
   *
   * @example Buffer.from('file content')
   * @example "iVBORw0KGgoAAAANSUhEUg..." // base64
   */
  file: Buffer | string;

  /**
   * MIME тип файла (опционально)
   *
   * Если не указан, будет определен автоматически по расширению файла
   * с помощью FileUploadUtil.getMimeType().
   *
   * @example "image/png"
   * @example "application/pdf"
   * @example "text/plain"
   */
  mimetype?: string;
}
