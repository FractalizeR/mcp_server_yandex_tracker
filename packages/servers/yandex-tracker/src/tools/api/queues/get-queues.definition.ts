/**
 * Определение MCP tool для получения списка очередей
 */

import {
  BaseToolDefinition,
  type ToolDefinition,
  type StaticToolMetadata,
} from '@mcp-framework/core';
import { GET_QUEUES_TOOL_METADATA } from './get-queues.metadata.js';

/**
 * Definition для GetQueuesTool
 */
export class GetQueuesDefinition extends BaseToolDefinition {
  protected getStaticMetadata(): StaticToolMetadata {
    return GET_QUEUES_TOOL_METADATA;
  }

  build(): ToolDefinition {
    return {
      name: this.getToolName(),
      description: this.buildDescription(),
      inputSchema: {
        type: 'object',
        properties: {
          perPage: this.buildPerPageParam(),
          page: this.buildPageParam(),
          expand: this.buildExpandParam(),
          fields: this.buildFieldsParam(),
        },
        required: ['fields'],
      },
    };
  }

  private buildDescription(): string {
    return (
      'Получить список всех очередей с поддержкой пагинации. ' +
      'Параметр fields обязателен для экономии токенов. ' +
      '\n\n' +
      'Для: просмотра доступных очередей, навигации по очередям. ' +
      '\n' +
      'Не для: получения одной очереди (get_queue), создания (create_queue).'
    );
  }

  private buildPerPageParam(): Record<string, unknown> {
    return this.buildNumberParam(
      'Количество очередей на странице (опционально, по умолчанию 50, максимум 100).',
      {
        minimum: 1,
        maximum: 100,
        examples: [50],
      }
    );
  }

  private buildPageParam(): Record<string, unknown> {
    return this.buildNumberParam('Номер страницы (опционально, начинается с 1).', {
      minimum: 1,
      examples: [1],
    });
  }

  private buildExpandParam(): Record<string, unknown> {
    return this.buildStringParam(
      'Дополнительные поля для включения в ответ (опционально). Примеры: "projects", "components".',
      {
        examples: ['projects'],
      }
    );
  }

  private buildFieldsParam(): Record<string, unknown> {
    return this.buildArrayParam(
      '⚠️ ОБЯЗАТЕЛЬНЫЙ параметр - список возвращаемых полей для экономии токенов. ' +
        'Укажите только необходимые поля. ' +
        '\n\n' +
        'Поля очереди: key, name, description, lead, assignAuto, defaultType, defaultPriority, ' +
        'teamUsers, issueTypes, versions, workflows, denyVoting, issueTypesConfig. ' +
        'Вложенные (dot-notation): lead.login, lead.display, defaultType.key, defaultPriority.key.',
      this.buildStringParam('Имя поля', {
        minLength: 1,
        examples: ['key', 'name', 'lead.login'],
      }),
      {
        minItems: 1,
        examples: [
          ['key', 'name', 'lead'],
          ['key', 'name', 'lead.login', 'defaultType.key'],
        ],
      }
    );
  }
}
