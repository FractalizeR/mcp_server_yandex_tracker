/**
 * Базовая абстракция для MCP инструментов
 *
 * Следует принципу Single Responsibility Principle (SRP):
 * - Каждый инструмент отвечает только за свою функциональность
 * - Общая логика вынесена в базовый класс
 * - Валидация делегирована в Zod schemas
 */

import type { YandexTrackerFacade } from '@tracker_api/facade/yandex-tracker.facade.js';
import type { Logger } from '@infrastructure/logging/index.js';
import type { ToolCallParams, ToolResult } from '@types';
import type { ToolDefinition } from '@mcp/tools/base/base-definition.js';
import type { ZodSchema, ZodError } from 'zod';

/**
 * Абстрактный базовый класс для всех инструментов
 *
 * Инкапсулирует общую логику:
 * - Доступ к Yandex Tracker Facade (высокоуровневый API)
 * - Логирование
 * - Валидация параметров через Zod
 * - Обработка ошибок
 * - Форматирование результатов
 */
export abstract class BaseTool {
  protected readonly trackerFacade: YandexTrackerFacade;
  protected readonly logger: Logger;

  constructor(trackerFacade: YandexTrackerFacade, logger: Logger) {
    this.trackerFacade = trackerFacade;
    this.logger = logger;
  }

  /**
   * Получить определение инструмента
   */
  abstract getDefinition(): ToolDefinition;

  /**
   * Выполнить инструмент
   */
  abstract execute(params: ToolCallParams): Promise<ToolResult>;

  /**
   * Валидация параметров через Zod
   *
   * @param params - параметры для валидации
   * @param schema - Zod схема валидации
   * @returns результат валидации или ToolResult с ошибкой
   */
  protected validateParams<T>(
    params: ToolCallParams,
    schema: ZodSchema<T>
  ): { success: true; data: T } | { success: false; error: ToolResult } {
    const validationResult = schema.safeParse(params);

    if (!validationResult.success) {
      return {
        success: false,
        error: this.formatValidationError(validationResult.error),
      };
    }

    return {
      success: true,
      data: validationResult.data,
    };
  }

  /**
   * Форматирование успешного результата
   */
  protected formatSuccess(data: unknown): ToolResult {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              data,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  /**
   * Форматирование ошибки
   */
  protected formatError(message: string, error?: unknown): ToolResult {
    this.logger.error(message, error);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              message,
              error: error instanceof Error ? error.message : undefined,
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }

  /**
   * Форматирование ошибки валидации Zod
   */
  private formatValidationError(zodError: ZodError): ToolResult {
    const errorMessage = zodError.errors.map((e) => e.message).join('; ');
    return this.formatError('Ошибка валидации параметров', new Error(errorMessage));
  }
}
