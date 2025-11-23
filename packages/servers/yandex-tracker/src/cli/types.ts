import type { BaseMCPServerConfig } from '@mcp-framework/cli';

/**
 * Конфигурация MCP сервера Yandex Tracker
 */
export interface YandexTrackerMCPConfig extends BaseMCPServerConfig {
  /** OAuth токен Яндекс.Трекера */
  token: string;

  /** ID организации */
  orgId: string;

  /** Базовый URL API (опционально) */
  apiBase?: string;

  /** Таймаут запросов (опционально) */
  requestTimeout?: number;
}
