/**
 * Утилиты для работы с пагинацией
 *
 * Используются в API operations для построения query параметров
 * и парсинга ответов с пагинацией.
 */

import type { PaginationParams, PaginatedResponse } from '../entities/common/index.js';

/**
 * Утилита для работы с пагинацией
 */
export class PaginationUtil {
  /**
   * Построить query параметры для пагинации
   *
   * @param params - параметры пагинации
   * @returns URLSearchParams с параметрами пагинации
   *
   * @example
   * ```typescript
   * const params = PaginationUtil.buildQueryParams({
   *   perPage: 50,
   *   page: 2
   * });
   * // URLSearchParams { perPage: "50", page: "2" }
   * ```
   */
  static buildQueryParams(params: PaginationParams): URLSearchParams {
    const searchParams = new URLSearchParams();

    if (params.perPage !== undefined) {
      searchParams.set('perPage', params.perPage.toString());
    }

    if (params.page !== undefined) {
      searchParams.set('page', params.page.toString());
    }

    return searchParams;
  }

  /**
   * Распарсить ответ с пагинацией от API
   *
   * ВАЖНО: Яндекс.Трекер API v3 может возвращать пагинацию по-разному:
   * 1. Массив с заголовками X-Total-Count, X-Page, X-Per-Page
   * 2. Объект с полями { items, total, page, perPage }
   *
   * Этот метод обрабатывает второй случай.
   * Для первого случая используйте parseFromHeaders().
   *
   * @param response - ответ от API
   * @returns типизированный ответ с пагинацией
   *
   * @example
   * ```typescript
   * const response = {
   *   items: [comment1, comment2],
   *   total: 150,
   *   page: 2,
   *   perPage: 50
   * };
   * const parsed = PaginationUtil.parsePaginatedResponse<Comment>(response);
   * ```
   */
  static parsePaginatedResponse<T>(response: unknown): PaginatedResponse<T> {
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid paginated response: response is not an object');
    }

    const obj = response as Record<string, unknown>;

    if (!Array.isArray(obj['items'])) {
      throw new Error('Invalid paginated response: items is not an array');
    }

    if (typeof obj['total'] !== 'number') {
      throw new Error('Invalid paginated response: total is not a number');
    }

    if (typeof obj['page'] !== 'number') {
      throw new Error('Invalid paginated response: page is not a number');
    }

    if (typeof obj['perPage'] !== 'number') {
      throw new Error('Invalid paginated response: perPage is not a number');
    }

    return {
      items: obj['items'] as T[],
      total: obj['total'],
      page: obj['page'],
      perPage: obj['perPage'],
    };
  }

  /**
   * Распарсить пагинацию из заголовков HTTP ответа
   *
   * Используется когда API возвращает массив с информацией о пагинации в заголовках.
   *
   * @param items - массив элементов из ответа
   * @param headers - заголовки HTTP ответа
   * @returns типизированный ответ с пагинацией
   *
   * @example
   * ```typescript
   * const items = [comment1, comment2];
   * const headers = {
   *   'x-total-count': '150',
   *   'x-page': '2',
   *   'x-per-page': '50'
   * };
   * const parsed = PaginationUtil.parseFromHeaders(items, headers);
   * ```
   */
  static parseFromHeaders<T>(
    items: T[],
    headers: Record<string, string | undefined>
  ): PaginatedResponse<T> {
    const total = parseInt(headers['x-total-count'] ?? '0', 10);
    const page = parseInt(headers['x-page'] ?? '1', 10);
    const perPage = parseInt(headers['x-per-page'] ?? '50', 10);

    return {
      items,
      total,
      page,
      perPage,
    };
  }

  /**
   * Вычислить общее количество страниц
   *
   * @param total - общее количество элементов
   * @param perPage - количество элементов на странице
   * @returns количество страниц
   *
   * @example
   * ```typescript
   * const totalPages = PaginationUtil.calculateTotalPages(150, 50);
   * // 3
   * ```
   */
  static calculateTotalPages(total: number, perPage: number): number {
    if (perPage <= 0) {
      throw new Error('perPage must be greater than 0');
    }

    return Math.ceil(total / perPage);
  }
}
