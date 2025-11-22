/**
 * Типы для ToolRegistry
 */

import type { BaseTool } from '../tools/base/index.js';
import { ToolPriority } from '../tools/base/tool-metadata.js';

/**
 * Конструктор класса Tool для DI
 */
export interface ToolConstructor {
  new (...args: any[]): BaseTool<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  name: string;
}

/**
 * Порядок приоритетов (меньше значение = выше приоритет)
 */
export const PRIORITY_ORDER: Record<string, number> = {
  [ToolPriority.CRITICAL]: 0,
  [ToolPriority.HIGH]: 1,
  [ToolPriority.NORMAL]: 2,
  [ToolPriority.LOW]: 3,
};

/**
 * Распарсенная структура фильтра категорий инструментов
 *
 * Используется для фильтрации tools по категориям и подкатегориям:
 * - categories: Set категорий для включения (без подкатегорий)
 * - categoriesWithSubcategories: Map категорий с конкретными подкатегориями
 * - includeAll: если true, включаются все инструменты (пустой фильтр)
 */
export interface ParsedCategoryFilter {
  categories: Set<string>;
  categoriesWithSubcategories: Map<string, Set<string>>;
  includeAll: boolean;
}
