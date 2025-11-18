/**
 * DTO для добавления записи времени к задаче
 *
 * Используется в AddWorklogOperation и yandex_tracker_add_worklog tool.
 *
 * ВАЖНО: duration может быть в человекочитаемом формате ("1h 30m")
 * или в ISO 8601 Duration ("PT1H30M"). DurationUtil автоматически
 * конвертирует человекочитаемый формат в ISO 8601.
 */
export interface AddWorklogInput {
  /**
   * Дата и время начала работы (ISO 8601 timestamp)
   *
   * Формат: YYYY-MM-DDTHH:mm:ss.sss+0000
   *
   * @example "2023-01-15T10:00:00.000+0000"
   * @example "2023-01-15T10:00:00Z"
   */
  start: string;

  /**
   * Продолжительность работы
   *
   * Поддерживаются форматы:
   * - Человекочитаемый: "1h", "30m", "1h 30m", "2 hours 15 minutes"
   * - ISO 8601 Duration: "PT1H", "PT30M", "PT1H30M"
   *
   * @example "1h 30m"
   * @example "PT1H30M"
   * @example "2 hours"
   * @example "45 minutes"
   */
  duration: string;

  /**
   * Комментарий к записи времени (опционально)
   *
   * Описывает, на что было затрачено время
   *
   * @example "Работал над реализацией API"
   * @example "Код ревью и тестирование"
   */
  comment?: string;
}
