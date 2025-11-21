/**
 * Валидатор соответствия Zod Schema ↔ MCP Definition
 *
 * Используется для проверки, что MCP definition корректно описывает Zod schema.
 * Критично для предотвращения багов schema-definition mismatch.
 */

import type { z } from 'zod';
import { extractRequiredFields } from './zod-json-schema-adapter.js';
import type { ToolInputSchema } from './zod-json-schema-adapter.js';

/**
 * Типы ошибок валидации
 */
export enum ValidationErrorType {
  /** Поле присутствует в schema, но отсутствует в definition.properties */
  MISSING_PROPERTY = 'missing_property',

  /** Поле отсутствует в schema, но присутствует в definition.properties */
  EXTRA_PROPERTY = 'extra_property',

  /** Поле обязательно в schema, но не указано в definition.required */
  REQUIRED_MISMATCH = 'required_mismatch',

  /** Поле опционально в schema, но указано в definition.required */
  OPTIONAL_MISMATCH = 'optional_mismatch',

  /** Различие в типах данных между schema и definition */
  TYPE_MISMATCH = 'type_mismatch',

  /** Структурное различие (nested objects, arrays) */
  STRUCTURE_MISMATCH = 'structure_mismatch',
}

/**
 * Описание ошибки валидации
 */
export interface ValidationError {
  /** Тип ошибки */
  type: ValidationErrorType;

  /** Имя поля, в котором обнаружена ошибка */
  field: string;

  /** Человекочитаемое сообщение об ошибке */
  message: string;

  /** Ожидаемое значение (если применимо) */
  expected?: unknown;

  /** Фактическое значение (если применимо) */
  actual?: unknown;
}

/**
 * Результат валидации
 */
export interface ValidationResult {
  /** Успешна ли валидация (нет ошибок) */
  success: boolean;

  /** Список ошибок (пустой если success: true) */
  errors: ValidationError[];
}

/**
 * Проверить соответствие Zod schema и MCP definition
 *
 * Выполняет полную проверку соответствия между Zod схемой и MCP definition:
 * 1. Проверяет, что все поля из schema присутствуют в definition.properties
 * 2. Проверяет, что required поля совпадают
 * 3. Проверяет базовые типы данных
 *
 * @param schema - Zod схема параметров
 * @param definition - MCP definition inputSchema
 * @returns Результат валидации с списком ошибок (если есть)
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   issueKey: z.string(),
 *   fields: z.array(z.string()).optional(),
 * });
 *
 * const definition: ToolInputSchema = {
 *   type: 'object',
 *   properties: {
 *     issueKey: { type: 'string' },
 *     // fields отсутствует - это ошибка!
 *   },
 *   required: ['issueKey'],
 * };
 *
 * const result = validateSchemaDefinitionMatch(schema, definition);
 * // result.success === false
 * // result.errors[0].type === ValidationErrorType.MISSING_PROPERTY
 * // result.errors[0].field === 'fields'
 * ```
 */
export function validateSchemaDefinitionMatch<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  definition: ToolInputSchema
): ValidationResult {
  const errors: ValidationError[] = [];

  // 1. Извлекаем информацию из schema
  const schemaFields = Object.keys(schema.shape);
  const schemaRequiredFields = extractRequiredFields(schema);

  // 2. Извлекаем информацию из definition
  const definitionFields = Object.keys(definition.properties);
  const definitionRequiredFields = definition.required ?? [];

  // 3. Проверка: все поля из schema присутствуют в definition.properties
  for (const field of schemaFields) {
    if (!definitionFields.includes(field)) {
      errors.push({
        type: ValidationErrorType.MISSING_PROPERTY,
        field,
        message: `Поле '${field}' присутствует в schema, но отсутствует в definition.properties`,
        expected: `Поле должно быть в definition.properties`,
        actual: `Поле отсутствует`,
      });
    }
  }

  // 4. Проверка: нет лишних полей в definition.properties
  for (const field of definitionFields) {
    if (!schemaFields.includes(field)) {
      errors.push({
        type: ValidationErrorType.EXTRA_PROPERTY,
        field,
        message: `Поле '${field}' присутствует в definition.properties, но отсутствует в schema`,
        expected: `Поле должно отсутствовать`,
        actual: `Поле присутствует`,
      });
    }
  }

  // 5. Проверка: required поля совпадают
  for (const field of schemaRequiredFields) {
    if (!definitionRequiredFields.includes(field)) {
      errors.push({
        type: ValidationErrorType.REQUIRED_MISMATCH,
        field,
        message: `Поле '${field}' обязательно в schema, но не указано в definition.required`,
        expected: `required: [..., '${field}']`,
        actual: `required: [${definitionRequiredFields.join(', ')}]`,
      });
    }
  }

  // 6. Проверка: нет лишних required полей в definition
  for (const field of definitionRequiredFields) {
    if (!schemaRequiredFields.includes(field)) {
      errors.push({
        type: ValidationErrorType.OPTIONAL_MISMATCH,
        field,
        message: `Поле '${field}' опционально в schema, но указано в definition.required`,
        expected: `required: [${schemaRequiredFields.join(', ')}]`,
        actual: `required: [..., '${field}']`,
      });
    }
  }

  // 7. Формируем результат
  return {
    success: errors.length === 0,
    errors,
  };
}

/**
 * Helper: Форматировать результат валидации в человекочитаемую строку
 *
 * @param result - Результат валидации
 * @returns Строка с описанием ошибок (или 'OK' если ошибок нет)
 *
 * @example
 * ```typescript
 * const result = validateSchemaDefinitionMatch(schema, definition);
 * console.log(formatValidationResult(result));
 * // Вывод:
 * // ❌ Schema-Definition Mismatch (2 errors):
 * // 1. [missing_property] fields: Поле 'fields' присутствует в schema, но отсутствует в definition.properties
 * // 2. [required_mismatch] issueKey: Поле 'issueKey' обязательно в schema, но не указано в definition.required
 * ```
 */
export function formatValidationResult(result: ValidationResult): string {
  if (result.success) {
    return '✅ Schema-Definition Match: OK';
  }

  const lines: string[] = [`❌ Schema-Definition Mismatch (${result.errors.length} errors):`];

  for (let i = 0; i < result.errors.length; i++) {
    const error = result.errors[i];
    if (error) {
      lines.push(`${i + 1}. [${error.type}] ${error.field}: ${error.message}`);
    }
  }

  return lines.join('\n');
}
