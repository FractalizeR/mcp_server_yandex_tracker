/**
 * DTO для ответов API, связанных с записями времени
 */
import type { Worklog } from '../../entities/worklog.entity.js';

/**
 * Ответ с одной записью времени
 *
 * Используется в AddWorklogOperation и UpdateWorklogOperation.
 */
export interface WorklogOutput {
  worklog: Worklog;
}

/**
 * Ответ со списком записей времени
 *
 * Используется в GetWorklogsOperation.
 */
export interface WorklogsListOutput {
  worklogs: Worklog[];
  total?: number;
}
