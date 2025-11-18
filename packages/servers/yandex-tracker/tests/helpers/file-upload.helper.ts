/**
 * Helpers для тестирования загрузки файлов
 */

/**
 * Создать mock Buffer для тестов
 *
 * @param content - содержимое файла (строка)
 * @returns Buffer с содержимым
 *
 * @example
 * ```typescript
 * const buffer = createMockFileBuffer('test content');
 * ```
 */
export function createMockFileBuffer(content: string): Buffer {
  return Buffer.from(content, 'utf-8');
}

/**
 * Создать mock Buffer для бинарного файла
 *
 * @param size - размер файла в байтах
 * @returns Buffer заданного размера
 *
 * @example
 * ```typescript
 * const buffer = createMockBinaryBuffer(1024); // 1KB файл
 * ```
 */
export function createMockBinaryBuffer(size: number): Buffer {
  return Buffer.alloc(size, 0);
}

/**
 * Создать mock FormData с файлом для тестов
 *
 * @param buffer - содержимое файла
 * @param filename - имя файла
 * @param fieldName - имя поля формы
 * @returns FormData с файлом
 *
 * @example
 * ```typescript
 * const buffer = createMockFileBuffer('test');
 * const formData = createMockFormData(buffer, 'test.txt');
 * ```
 */
export function createMockFormData(buffer: Buffer, filename: string, fieldName = 'file'): FormData {
  const formData = new FormData();
  const blob = new Blob([buffer]);
  formData.append(fieldName, blob, filename);
  return formData;
}

/**
 * Создать mock файл с заданными параметрами
 *
 * @param options - параметры файла
 * @returns объект с Buffer и метаданными
 *
 * @example
 * ```typescript
 * const file = createMockFile({
 *   content: 'test content',
 *   filename: 'document.pdf',
 *   mimeType: 'application/pdf'
 * });
 * ```
 */
export function createMockFile(options: { content: string; filename: string; mimeType?: string }): {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  size: number;
} {
  const buffer = createMockFileBuffer(options.content);

  return {
    buffer,
    filename: options.filename,
    mimeType: options.mimeType || 'application/octet-stream',
    size: buffer.length,
  };
}
