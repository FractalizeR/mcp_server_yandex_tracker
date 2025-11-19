/**
 * DTO для создания проекта в Яндекс.Трекере
 *
 * ВАЖНО: Ключ проекта должен быть уникальным в рамках организации.
 */

import type { ProjectStatus } from '#tracker_api/entities/index.js';

export interface CreateProjectDto {
  /** Уникальный ключ проекта */
  key: string;

  /** Название проекта */
  name: string;

  /** ID или login руководителя проекта */
  lead: string;

  /** Статус проекта */
  status?: ProjectStatus | undefined;

  /** Описание проекта */
  description?: string | undefined;

  /** Дата начала проекта (формат: YYYY-MM-DD) */
  startDate?: string | undefined;

  /** Дата окончания проекта (формат: YYYY-MM-DD) */
  endDate?: string | undefined;

  /**
   * Массив ключей очередей, связанных с проектом
   * @example ['QUEUE1', 'QUEUE2']
   */
  queueIds?: string[] | undefined;

  /**
   * Массив ID или login участников проекта
   * @example ['user1', 'user2']
   */
  teamUserIds?: string[] | undefined;

  /** Дополнительные поля */
  [key: string]: unknown;
}
