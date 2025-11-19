/**
 * Общие типы для базовых абстракций инструментов
 *
 * Этот файл разрывает циркулярную зависимость между base-definition.ts и tool-metadata.ts
 * Содержит только интерфейсы и типы, без реализаций
 */

/**
 * Определение инструмента для MCP
 */
export interface ToolDefinition {
  /** Уникальное имя инструмента */
  name: string;
  /** Описание функциональности инструмента */
  description: string;
  /** JSON Schema для валидации входных параметров */
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
  /** Категория инструмента для группировки */
  category?: string;
  /** Подкатегория для детальной группировки (опционально) */
  subcategory?: string;
  /** Приоритет инструмента для сортировки */
  priority?: 'critical' | 'high' | 'normal' | 'low';
}
