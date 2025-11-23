/**
 * Zod схема для валидации параметров GetIssueL inksTool
 */

import { z } from 'zod';
import { IssueKeysSchema, FieldsSchema } from '#common/schemas/index.js';

/**
 * Схема параметров для получения связей задач
 */
export const GetIssueLinksParamsSchema = z.object({
  /**
   * Массив ключей или ID задач для получения связей
   */
  issueIds: IssueKeysSchema.describe('Array of issue IDs or keys'),

  /**
   * Массив полей для возврата в результате (обязательный)
   * Примеры: ['id', 'type', 'object'], ['id', 'type.id', 'object.key']
   */
  fields: FieldsSchema,
});

/**
 * Вывод типа из схемы
 */
export type GetIssueLinksParams = z.infer<typeof GetIssueLinksParamsSchema>;
