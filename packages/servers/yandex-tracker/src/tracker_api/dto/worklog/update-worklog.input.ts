/**
 * DTO для обновления записи времени
 *
 * Используется в UpdateWorklogOperation и yandex_tracker_update_worklog tool.
 *
 * ВАЖНО: Все поля опциональны - можно обновить только нужные поля.
 * duration может быть в человекочитаемом формате ("1h 30m")
 * или в ISO 8601 Duration ("PT1H30M").
 */
export interface UpdateWorklogInput {
  /**
   * Дата и время начала работы (ISO 8601 timestamp, опционально)
   *
   * Формат: YYYY-MM-DDTHH:mm:ss.sss+0000
   *
   * @example "2023-01-15T10:00:00.000+0000"
   * @example "2023-01-15T10:00:00Z"
   */
  start?: string;

  /**
   * Продолжительность работы (опционально)
   *
   * Поддерживаются форматы:
   * - Человекочитаемый: "1h", "30m", "1h 30m", "2 hours 15 minutes"
   * - ISO 8601 Duration: "PT1H", "PT30M", "PT1H30M"
   *
   * @example "1h 30m"
   * @example "PT1H30M"
   * @example "2 hours"
   */
  duration?: string;

  /**
   * Комментарий к записи времени (опционально)
   *
   * Описывает, на что было затрачено время
   *
   * @example "Работал над реализацией API"
   */
  comment?: string;
}
