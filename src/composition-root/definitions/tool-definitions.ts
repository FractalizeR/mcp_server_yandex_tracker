/**
 * Определения всех MCP Tools
 *
 * ВАЖНО: При добавлении нового Tool:
 * 1. Импортируй класс Tool
 * 2. Добавь его в массив TOOL_CLASSES
 * 3. Всё остальное произойдёт автоматически (DI регистрация, ToolRegistry)
 */

import { PingTool } from '@mcp/tools/ping.tool.js';
import { GetIssuesTool } from '@mcp/tools/api/issues/get/index.js';
import { CreateIssueTool } from '@mcp/tools/api/issues/create/index.js';
import { FindIssuesTool } from '@mcp/tools/api/issues/find/index.js';
import { UpdateIssueTool } from '@mcp/tools/api/issues/update/index.js';
import { GetIssueChangelogTool } from '@mcp/tools/api/issues/changelog/index.js';
import { GetIssueTransitionsTool } from '@mcp/tools/api/issues/transitions/get/index.js';
import { TransitionIssueTool } from '@mcp/tools/api/issues/transitions/execute/index.js';
import { IssueUrlTool } from '@mcp/tools/helpers/issue-url/index.js';
import { DemoTool } from '@mcp/tools/helpers/demo/index.js';
import { SearchToolsTool } from '@mcp/tools/helpers/search/index.js';

/**
 * Массив всех Tool классов в проекте
 *
 * КОНВЕНЦИЯ ИМЕНОВАНИЯ:
 * - Класс ДОЛЖЕН заканчиваться на "Tool"
 * - Symbol автоматически создаётся как Symbol.for(ClassName)
 * - Пример: PingTool → Symbol.for('PingTool')
 *
 * ДОБАВЛЕНИЕ НОВОГО TOOL:
 * 1. Импортируй класс
 * 2. Добавь в массив TOOL_CLASSES
 * 3. ВСЁ! (DI регистрация, ToolRegistry, TYPES — автоматически)
 */
export const TOOL_CLASSES = [
  PingTool,
  GetIssuesTool,
  CreateIssueTool,
  FindIssuesTool,
  UpdateIssueTool,
  GetIssueChangelogTool,
  GetIssueTransitionsTool,
  TransitionIssueTool,
  IssueUrlTool,
  DemoTool,
  SearchToolsTool, // ← Helper tool для поиска других инструментов
] as const;

/**
 * Тип для Tool классов (type-safe)
 */
export type ToolClass = (typeof TOOL_CLASSES)[number];
