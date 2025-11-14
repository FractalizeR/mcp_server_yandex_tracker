/**
 * Реестр всех MCP инструментов
 *
 * Ответственность (SRP):
 * - Регистрация инструментов
 * - Получение списка определений
 * - Маршрутизация вызовов к нужному инструменту
 *
 * АВТОМАТИЧЕСКАЯ РЕГИСТРАЦИЯ (Open/Closed Principle):
 * - Tools автоматически извлекаются из DI контейнера
 * - Для добавления нового tool: добавь класс в composition-root/definitions/tool-definitions.ts
 * - НЕ нужно модифицировать этот файл при добавлении новых tools
 */

import type { Container } from 'inversify';
import type { Logger } from '@infrastructure/logging/index.js';
import type { ToolCallParams, ToolResult } from '@types';
import type { BaseTool, ToolDefinition } from '@mcp/tools/base/index.js';
import { TOOL_CLASSES } from '@composition-root/definitions/tool-definitions.js';

/**
 * Реестр инструментов
 *
 * Централизованное управление всеми инструментами проекта
 */
export class ToolRegistry {
  private tools: Map<string, BaseTool>;
  private logger: Logger;

  /**
   * @param container - DI контейнер с зарегистрированными tools
   * @param logger - Logger для логирования
   */
  constructor(container: Container, logger: Logger) {
    this.logger = logger;
    this.tools = new Map();

    // АВТОМАТИЧЕСКАЯ регистрация всех tools из DI контейнера
    for (const ToolClass of TOOL_CLASSES) {
      const symbol = Symbol.for(ToolClass.name);
      const tool = container.get<BaseTool>(symbol);
      this.registerTool(tool);
    }

    this.logger.debug(`Зарегистрировано инструментов: ${this.tools.size}`);
  }

  /**
   * Регистрация нового инструмента
   */
  private registerTool(tool: BaseTool): void {
    const definition = tool.getDefinition();
    this.tools.set(definition.name, tool);
    this.logger.debug(`Зарегистрирован инструмент: ${definition.name}`);
  }

  /**
   * Получить определения всех зарегистрированных инструментов
   */
  getDefinitions(): ToolDefinition[] {
    return Array.from(this.tools.values()).map((tool) => tool.getDefinition());
  }

  /**
   * Получить tool по имени
   */
  getTool(name: string): BaseTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Получить все зарегистрированные tools
   */
  getAllTools(): BaseTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Выполнить инструмент по имени
   */
  async execute(name: string, params: ToolCallParams): Promise<ToolResult> {
    this.logger.info(`Вызов инструмента: ${name}`);
    this.logger.debug('Параметры:', params);

    const tool = this.tools.get(name);

    if (!tool) {
      this.logger.error(`Инструмент не найден: ${name}`);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                message: `Инструмент "${name}" не найден`,
                availableTools: Array.from(this.tools.keys()),
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }

    try {
      const result = await tool.execute(params);
      this.logger.info(`Инструмент ${name} выполнен успешно`);
      return result;
    } catch (error) {
      this.logger.error(`Ошибка при выполнении инструмента ${name}:`, error);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                message: error instanceof Error ? error.message : 'Неизвестная ошибка',
                tool: name,
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
  }
}
