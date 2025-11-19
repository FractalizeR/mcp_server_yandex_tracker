/**
 * Доменный тип: Bulk Change Operation в Яндекс.Трекере
 *
 * Соответствует API v2: /v2/bulkchange/*
 *
 * Bulk Change API позволяет выполнять массовые операции над задачами:
 * - Массовое обновление полей (_update)
 * - Массовая смена статусов (_transition)
 * - Массовое перемещение между очередями (_move)
 *
 * ВАЖНО: Операции выполняются асинхронно на сервере.
 * Сервер возвращает operationId, по которому можно проверить статус.
 */

import type { WithUnknownFields } from './types.js';

/**
 * Статус bulk операции
 */
export type BulkChangeStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

/**
 * Тип bulk операции
 */
export type BulkChangeType = 'UPDATE' | 'TRANSITION' | 'MOVE';

/**
 * Информация об ошибке при выполнении bulk операции
 */
export interface BulkChangeError {
  /** Код ошибки */
  readonly errorCode?: string;

  /** Сообщение об ошибке */
  readonly message?: string;

  /** Ключ задачи, на которой произошла ошибка */
  readonly issueKey?: string;
}

/**
 * Результат выполнения bulk операции
 *
 * ВАЖНО: Типизация основана на документации API v2 и Python клиента.
 */
export interface BulkChangeOperation {
  /** Идентификатор операции (используется для проверки статуса) */
  readonly id: string;

  /** URL для проверки статуса операции */
  readonly self: string;

  /** Статус выполнения операции */
  readonly status: BulkChangeStatus;

  /** Тип операции */
  readonly type?: BulkChangeType;

  /** Общее количество задач в операции */
  readonly totalIssues?: number;

  /** Количество успешно обработанных задач */
  readonly processedIssues?: number;

  /** Количество задач с ошибками */
  readonly failedIssues?: number;

  /** Прогресс выполнения в процентах (0-100) */
  readonly progress?: number;

  /** Дата создания операции (ISO 8601) */
  readonly createdAt?: string;

  /** Дата начала выполнения операции (ISO 8601) */
  readonly startedAt?: string;

  /** Дата завершения операции (ISO 8601) */
  readonly completedAt?: string;

  /** Ошибки, возникшие при обработке задач */
  readonly errors?: BulkChangeError[];

  /** Дополнительная информация о параметрах операции */
  readonly parameters?: {
    /** Очередь назначения (для MOVE операций) */
    readonly queue?: string;

    /** ID перехода (для TRANSITION операций) */
    readonly transition?: string;

    /** Обновляемые поля (для UPDATE операций) */
    readonly values?: Record<string, unknown>;
  };
}

/**
 * Bulk Change Operation с возможными unknown полями из API.
 * Используется при получении данных от API Трекера.
 */
export type BulkChangeOperationWithUnknownFields = WithUnknownFields<BulkChangeOperation>;
