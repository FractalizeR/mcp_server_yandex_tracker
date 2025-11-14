/**
 * Метаданные инструментов для поиска и категоризации
 *
 * Responsibilities:
 * - Описание категорий и тегов tools
 * - Типы для compile-time индексации
 * - Структура метаданных для поиска
 */

import type { ToolDefinition } from './base-definition.js';

/**
 * Категории инструментов
 *
 * Используются для группировки и фильтрации
 */
export enum ToolCategory {
  // API операции
  ISSUES = 'issues',
  USERS = 'users',
  PROJECTS = 'projects',
  BOARDS = 'boards',
  SPRINTS = 'sprints',
  COMMENTS = 'comments',

  // Helper инструменты
  SEARCH = 'search',
  URL_GENERATION = 'url-generation',
  VALIDATION = 'validation',
  DEMO = 'demo',
}

/**
 * Метаданные инструмента для поиска
 *
 * Расширяет ToolDefinition дополнительной информацией
 */
export interface ToolMetadata {
  /** Базовое определение (name, description, inputSchema) */
  definition: ToolDefinition;

  /** Категория инструмента */
  category: ToolCategory;

  /** Теги для поиска */
  tags: readonly string[];

  /** Примеры использования (для подсказок модели) */
  examples?: readonly string[];

  /** Является ли tool helper'ом (не API операция) */
  isHelper: boolean;
}

/**
 * Статические метаданные для compile-time индексации
 *
 * Используется в:
 * - BaseTool.METADATA (статическое свойство)
 * - scripts/generate-tool-index.ts (генерация индекса)
 */
export interface StaticToolMetadata {
  /** Имя инструмента */
  name: string;

  /** Описание инструмента */
  description: string;

  /** Категория */
  category: ToolCategory;

  /** Теги для поиска */
  tags: readonly string[];

  /** Helper или API tool */
  isHelper: boolean;

  /** Примеры использования (опционально) */
  examples?: readonly string[];
}
