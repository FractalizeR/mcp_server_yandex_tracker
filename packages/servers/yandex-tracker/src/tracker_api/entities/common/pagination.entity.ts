/**
 * Общие типы для пагинации
 *
 * Используются во всех API endpoints, поддерживающих постраничную выборку:
 * - Comments API
 * - Links API
 * - Attachments API
 * - Worklog API
 * - Projects API
 * - Components API
 */

/**
 * Параметры пагинации для запросов к API
 *
 * @example
 * ```typescript
 * const params: PaginationParams = {
 *   perPage: 50,
 *   page: 2
 * };
 * ```
 */
export interface PaginationParams {
  /**
   * Количество элементов на странице
   *
   * По умолчанию: 50
   * Максимум: зависит от endpoint (обычно 200-500)
   */
  readonly perPage?: number | undefined;

  /**
   * Номер страницы (начинается с 1)
   *
   * По умолчанию: 1
   */
  readonly page?: number | undefined;
}

/**
 * Ответ с пагинацией от API
 *
 * @example
 * ```typescript
 * const response: PaginatedResponse<Comment> = {
 *   items: [comment1, comment2],
 *   total: 150,
 *   page: 2,
 *   perPage: 50
 * };
 * ```
 */
export interface PaginatedResponse<T> {
  /**
   * Элементы текущей страницы
   */
  readonly items: T[];

  /**
   * Общее количество элементов (всего)
   */
  readonly total: number;

  /**
   * Текущая страница
   */
  readonly page: number;

  /**
   * Количество элементов на странице
   */
  readonly perPage: number;
}
