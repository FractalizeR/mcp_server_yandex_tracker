/**
 * Operations модуль - экспорт всех операций API
 */

// Base
export { BaseOperation } from './base-operation.js';

// User operations
export { PingOperation } from './user/ping.operation.js';
export type { PingResult } from './user/ping.operation.js';

// Issue operations (экспортируем только то, что есть в папке issue)
export * from './issue/index.js';
