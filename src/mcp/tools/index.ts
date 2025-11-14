/**
 * Экспорт всех MCP инструментов
 *
 * Каждый инструмент находится в отдельном файле
 * согласно принципу Single Responsibility Principle (SRP)
 */

export { BaseTool } from './base-tool.js';
export type { ToolDefinition } from './base-tool.js';
export { PingTool } from './ping.tool.js';
export { GetIssuesTool } from './get-issues.tool.js';

// Здесь будут добавляться новые инструменты:
// export { CreateIssueTool } from './create-issue.tool.js';
// export { UpdateIssueTool } from './update-issue.tool.js';
// export { SearchIssuesTool } from './search-issues.tool.js';
