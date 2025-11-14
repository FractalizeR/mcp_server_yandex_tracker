/**
 * Определение DemoTool для MCP
 *
 * ФИКТИВНЫЙ TOOL для демонстрации удобства масштабирования
 */

import type { ToolDefinition } from '@mcp/tools/base/index.js';
import { BaseToolDefinition } from '@mcp/tools/base/index.js';

export class DemoDefinition extends BaseToolDefinition {
  build(): ToolDefinition {
    return {
      name: 'demo',
      description: 'Демонстрационный инструмент для проверки масштабируемости архитектуры',
      inputSchema: {
        type: 'object',
        properties: {
          message: this.buildStringParam('Сообщение для демонстрации'),
        },
        required: ['message'],
      },
    };
  }
}
