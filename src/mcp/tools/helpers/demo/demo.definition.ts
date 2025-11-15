/**
 * Определение DemoTool для MCP
 *
 * ФИКТИВНЫЙ TOOL для демонстрации удобства масштабирования
 */

import type { ToolDefinition, StaticToolMetadata } from '@mcp/tools/base/index.js';
import { BaseToolDefinition } from '@mcp/tools/base/index.js';
import { DemoTool } from './demo.tool.js';

export class DemoDefinition extends BaseToolDefinition {
  protected getStaticMetadata(): StaticToolMetadata {
    return DemoTool.METADATA;
  }

  build(): ToolDefinition {
    return {
      name: 'demo',
      description: this.wrapWithSafetyWarning(
        'Демонстрационный инструмент для проверки масштабируемости архитектуры'
      ),
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
