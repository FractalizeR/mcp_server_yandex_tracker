/**
 * DTO для создания задачи в Яндекс.Трекере
 *
 * ВАЖНО: Содержит только known поля для type-safe отправки в API.
 * Используется в UpdateIssueOperation и соответствующих tools.
 */
export interface CreateIssueDto {
  /** Ключ очереди (обязательно) */
  queue: string;

  /** Краткое описание (обязательно) */
  summary: string;

  /** Подробное описание */
  description?: string | undefined;

  /** Исполнитель (логин или UID) */
  assignee?: string | undefined;

  /** Приоритет (ключ приоритета) */
  priority?: string | undefined;

  /** Тип задачи (ключ типа) */
  type?: string | undefined;

  /** Дополнительные поля (для кастомных полей Трекера) */
  [key: string]: unknown;
}
