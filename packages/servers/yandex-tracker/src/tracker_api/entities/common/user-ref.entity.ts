/**
 * Референс на пользователя (облегченная версия User)
 *
 * Используется во всех API, где объект содержит ссылку на пользователя,
 * но не требуется полная информация о пользователе.
 *
 * Примеры использования:
 * - Comment.createdBy - автор комментария
 * - Worklog.createdBy - кто записал время
 * - Attachment.createdBy - кто прикрепил файл
 *
 * ВАЖНО: API Трекера возвращает UserRef в формате:
 * ```json
 * {
 *   "self": "https://api.tracker.yandex.net/v3/users/1234567890",
 *   "id": "1234567890",
 *   "display": "Ivan Ivanov"
 * }
 * ```
 */

import type { WithUnknownFields } from '../types.js';

/**
 * Референс на пользователя
 *
 * ВАЖНО: Все поля обязательны - API всегда возвращает полную информацию.
 */
export interface UserRef {
  /**
   * URL ссылка на пользователя в API
   * @example "https://api.tracker.yandex.net/v3/users/1234567890"
   */
  readonly self: string;

  /**
   * Уникальный идентификатор пользователя
   * @example "1234567890"
   */
  readonly id: string;

  /**
   * Отображаемое имя пользователя
   * @example "Ivan Ivanov"
   */
  readonly display: string;
}

/**
 * UserRef с возможными unknown полями из API.
 * Используется при получении данных от API Трекера.
 */
export type UserRefWithUnknownFields = WithUnknownFields<UserRef>;
