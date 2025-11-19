/**
 * Операция получения списка файлов (attachments) задачи
 *
 * Ответственность (SRP):
 * - ТОЛЬКО получение списка файлов по issueId
 * - Кеширование результата
 * - НЕТ загрузки/удаления/скачивания файлов
 *
 * API: GET /v2/issues/{issueId}/attachments
 */

import { BaseOperation } from '#tracker_api/api_operations/base-operation.js';
import { EntityCacheKey, EntityType } from '@mcp-framework/infrastructure';
import type { AttachmentWithUnknownFields } from '#tracker_api/entities/index.js';

/**
 * Получение списка прикрепленных файлов задачи
 */
export class GetAttachmentsOperation extends BaseOperation {
  /**
   * Получить список всех файлов, прикрепленных к задаче
   *
   * @param issueId - идентификатор или ключ задачи (например, 'QUEUE-123' или '12345')
   * @returns массив прикрепленных файлов
   *
   * @example
   * ```typescript
   * const attachments = await getAttachmentsOp.execute('TEST-123');
   * console.log(`Найдено ${attachments.length} файлов`);
   * ```
   */
  async execute(issueId: string): Promise<AttachmentWithUnknownFields[]> {
    const cacheKey = EntityCacheKey.createKey(EntityType.ATTACHMENT, `list:${issueId}`);

    return this.withCache(cacheKey, async () => {
      this.logger.debug(`GetAttachmentsOperation: получение списка файлов для ${issueId}`);

      const response = await this.httpClient.get<AttachmentWithUnknownFields[]>(
        `/v2/issues/${issueId}/attachments`
      );

      this.logger.info(
        `GetAttachmentsOperation: получено ${response.length} файлов для ${issueId}`
      );

      return response;
    });
  }
}
