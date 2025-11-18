/**
 * DTO для параметров поиска задач в Яндекс.Трекере
 *
 * ВАЖНО: Используется для передачи параметров фильтрации в API.
 * Все поля опциональны.
 */
export interface SearchIssuesDto {
  /** Очередь */
  queue?: string | undefined;

  /** Статус */
  status?: string | undefined;

  /** Исполнитель */
  assignee?: string | undefined;

  /** Автор */
  createdBy?: string | undefined;

  /** Приоритет */
  priority?: string | undefined;

  /** Текст для поиска */
  query?: string | undefined;

  /** Дополнительные фильтры */
  [key: string]: unknown;
}
