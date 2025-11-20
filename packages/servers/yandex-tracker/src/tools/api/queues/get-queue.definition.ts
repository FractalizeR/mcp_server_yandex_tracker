/**
 * Определение MCP tool для получения одной очереди
 */

import {
  BaseToolDefinition,
  type ToolDefinition,
  type StaticToolMetadata,
} from '@mcp-framework/core';
import { GET_QUEUE_TOOL_METADATA } from './get-queue.metadata.js';

export class GetQueueDefinition extends BaseToolDefinition {
  protected getStaticMetadata(): StaticToolMetadata {
    return GET_QUEUE_TOOL_METADATA;
  }

  build(): ToolDefinition {
    return {
      name: this.getToolName(),
      description: this.buildDescription(),
      inputSchema: {
        type: 'object',
        properties: {
          queueId: this.buildQueueIdParam(),
          expand: this.buildExpandParam(),
          fields: this.buildFieldsParam(),
        },
        required: ['queueId', 'fields'],
      },
    };
  }

  private buildDescription(): string {
    return (
      'Получить детальную информацию об одной очереди по ID или ключу. ' +
      'Параметр fields обязателен для экономии токенов. ' +
      '\n\n' +
      'Для: просмотра настроек очереди, получения руководителя, типов задач. ' +
      '\n' +
      'Не для: списка очередей (get_queues), создания (create_queue).'
    );
  }

  private buildQueueIdParam(): Record<string, unknown> {
    return this.buildStringParam(
      '⚠️ ОБЯЗАТЕЛЬНЫЙ. Идентификатор или ключ очереди (например: "PROJ", "TEST").',
      {
        minLength: 1,
        examples: ['PROJ'],
      }
    );
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
