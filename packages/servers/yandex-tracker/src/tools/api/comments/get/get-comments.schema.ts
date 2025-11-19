/**
 * Zod схема для валидации параметров GetCommentsTool
 */

import { z } from 'zod';
import { IssueKeySchema, ExpandSchema, FieldsSchema } from '../../../../common/schemas/index.js';

/**
 * Схема параметров для получения комментариев
 */
export const GetCommentsParamsSchema = z.object({
  /**
   * Идентификатор или ключ задачи (обязательно)
   */
  issueId: IssueKeySchema.describe('Issue ID or key (e.g., TEST-123)'),

  /**
   * Количество комментариев на странице (опционально)
   */
  perPage: z.number().int().positive().max(500).optional(),

  /**
   * Номер страницы (опционально)
   */
  page: z.number().int().positive().optional(),

  /**
   * Параметр expand для включения дополнительных данных (опционально)
   */
  expand: ExpandSchema,

  /**
   * Массив полей для возврата в результате (обязательный)
   * Примеры: ['id', 'text', 'createdAt'], ['id', 'text', 'createdBy.login']
   */
  fields: FieldsSchema,
});

/**
 * Вывод типа из схемы
 */
export type GetCommentsParams = z.infer<typeof GetCommentsParamsSchema>;
