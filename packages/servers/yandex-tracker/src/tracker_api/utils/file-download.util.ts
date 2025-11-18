/**
 * Утилиты для работы со скачиванием файлов
 *
 * Используются в API operations для обработки скачанных файлов
 * и конвертации форматов.
 *
 * ВАЖНО: Дополняет FileUploadUtil для полного цикла работы с файлами.
 */

import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';

/**
 * Утилита для работы со скачиванием и обработкой файлов
 */
export class FileDownloadUtil {
  /**
   * Конвертировать Buffer в base64 строку
   *
   * Используется для передачи бинарных данных через MCP API,
   * где Buffer не поддерживается напрямую.
   *
   * @param buffer - бинарные данные файла
   * @returns base64-encoded строка
   *
   * @example
   * ```typescript
   * const buffer = Buffer.from('Hello World');
   * const base64 = FileDownloadUtil.bufferToBase64(buffer);
   * // 'SGVsbG8gV29ybGQ='
   * ```
   */
  static bufferToBase64(buffer: Buffer): string {
    return buffer.toString('base64');
  }

  /**
   * Конвертировать base64 строку в Buffer
   *
   * Обратная операция для bufferToBase64().
   * Используется при получении файлов через MCP API.
   *
   * @param base64 - base64-encoded строка
   * @returns Buffer с бинарными данными
   *
   * @example
   * ```typescript
   * const buffer = FileDownloadUtil.base64ToBuffer('SGVsbG8gV29ybGQ=');
   * // Buffer.from('Hello World')
   * ```
   */
  static base64ToBuffer(base64: string): Buffer {
    return Buffer.from(base64, 'base64');
  }

  /**
   * Сохранить Buffer в файл
   *
   * ВАЖНО: Автоматически создает директории, если они не существуют.
   * Использует fs.promises для асинхронной работы.
   *
   * @param buffer - бинарные данные файла
   * @param path - путь для сохранения файла
   * @throws Error если не удалось создать директории или записать файл
   *
   * @example
   * ```typescript
   * const buffer = Buffer.from('file content');
   * await FileDownloadUtil.saveBufferToFile(
   *   buffer,
   *   '/downloads/report.pdf'
   * );
   * ```
   */
  static async saveBufferToFile(buffer: Buffer, path: string): Promise<void> {
    // Создаем директории, если не существуют
    const dir = dirname(path);
    await fs.mkdir(dir, { recursive: true });

    // Записываем файл
    await fs.writeFile(path, buffer);
  }

  /**
   * Получить расширение файла из пути
   *
   * ВАЖНО: Это дубликат FileUploadUtil.getFileExtension() для удобства.
   * Позволяет использовать FileDownloadUtil независимо.
   *
   * @param filename - имя файла или путь
   * @returns расширение файла (без точки) в нижнем регистре
   *
   * @example
   * ```typescript
   * FileDownloadUtil.getFileExtension('report.pdf'); // 'pdf'
   * FileDownloadUtil.getFileExtension('/path/to/image.PNG'); // 'png'
   * FileDownloadUtil.getFileExtension('no-extension'); // ''
   * ```
   */
  static getFileExtension(filename: string): string {
    const parts = filename.split('.');
    if (parts.length < 2) {
      return '';
    }
    const lastPart = parts[parts.length - 1];
    return lastPart ? lastPart.toLowerCase() : '';
  }

  /**
   * Проверить, является ли файл изображением по MIME типу
   *
   * Полезно для определения, поддерживает ли файл миниатюры.
   *
   * @param mimetype - MIME тип файла
   * @returns true если файл является изображением
   *
   * @example
   * ```typescript
   * FileDownloadUtil.isImage('image/png'); // true
   * FileDownloadUtil.isImage('image/jpeg'); // true
   * FileDownloadUtil.isImage('application/pdf'); // false
   * ```
   */
  static isImage(mimetype: string): boolean {
    return mimetype.startsWith('image/');
  }

  /**
   * Проверить, является ли файл изображением по расширению
   *
   * Альтернативная проверка, если MIME тип недоступен.
   *
   * @param filename - имя файла
   * @returns true если расширение указывает на изображение
   *
   * @example
   * ```typescript
   * FileDownloadUtil.isImageByExtension('photo.jpg'); // true
   * FileDownloadUtil.isImageByExtension('doc.pdf'); // false
   * ```
   */
  static isImageByExtension(filename: string): boolean {
    const ext = FileDownloadUtil.getFileExtension(filename);
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    return imageExtensions.includes(ext);
  }
}
