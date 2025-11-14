/**
 * Issue operations модуль - экспорт операций для работы с задачами
 */

// Get operations (batch only)
export { GetIssuesOperation } from '@tracker_api/operations/issue/get-issues.operation.js';
export type { BatchIssueResult } from './get-issues.operation.js';

// Batch operations (create, update, delete)
export { CreateIssuesOperation } from '@tracker_api/operations/issue/create-issues.operation.js';
export type { BatchCreateIssueResult } from './create-issues.operation.js';

export { UpdateIssuesOperation } from '@tracker_api/operations/issue/update-issues.operation.js';
export type { UpdateIssueItem, BatchUpdateIssueResult } from './update-issues.operation.js';

export { DeleteIssuesOperation } from '@tracker_api/operations/issue/delete-issues.operation.js';
export type { BatchDeleteIssueResult } from './delete-issues.operation.js';
