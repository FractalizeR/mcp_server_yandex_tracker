import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ToolRegistry } from '@mcp/tool-registry.js';
import type { YandexTrackerFacade } from '@tracker_api/facade/yandex-tracker.facade.js';
import type { Logger } from '@infrastructure/logging/index.js';
import type { ToolCallParams } from '@types';
import type { PingResult } from '@tracker_api/operations/user/ping.operation.js';
import type { BatchIssueResult } from '@tracker_api/operations/issue/get-issues.operation.js';

describe('ToolRegistry', () => {
  let registry: ToolRegistry;
  let mockFacade: YandexTrackerFacade;
  let mockLogger: Logger;

  beforeEach(() => {
    // Mock YandexTrackerFacade
    mockFacade = {
      ping: vi.fn(),
      getIssues: vi.fn(),
    } as unknown as YandexTrackerFacade;

    // Mock Logger
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      child: vi.fn(() => mockLogger),
    } as unknown as Logger;

    registry = new ToolRegistry(mockFacade, mockLogger);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('должна зарегистрировать все доступные инструменты', () => {
      // Assert
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Зарегистрирован инструмент: yandex_tracker_ping'
      );
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Зарегистрирован инструмент: yandex_tracker_get_issues'
      );
      expect(mockLogger.debug).toHaveBeenCalledWith('Зарегистрировано инструментов: 2');
    });
  });

  describe('getDefinitions', () => {
    it('должна вернуть определения всех зарегистрированных инструментов', () => {
      // Act
      const definitions = registry.getDefinitions();

      // Assert
      expect(definitions).toHaveLength(2);

      const pingDef = definitions.find((d) => d.name === 'yandex_tracker_ping');
      const getIssuesDef = definitions.find((d) => d.name === 'yandex_tracker_get_issues');

      expect(pingDef).toBeDefined();
      expect(getIssuesDef).toBeDefined();

      expect(pingDef?.description).toContain('API Яндекс.Трекера');
      expect(getIssuesDef?.description).toContain('задач');
    });

    it('все определения должны иметь корректную структуру', () => {
      // Act
      const definitions = registry.getDefinitions();

      // Assert
      definitions.forEach((def) => {
        expect(def.name).toBeTruthy();
        expect(def.description).toBeTruthy();
        expect(def.inputSchema).toBeDefined();
        expect(def.inputSchema.type).toBe('object');
        expect(def.inputSchema.properties).toBeDefined();
      });
    });
  });

  describe('execute', () => {
    it('должна успешно выполнить ping инструмент', async () => {
      // Arrange
      const params: ToolCallParams = {};
      const mockPingResult: PingResult = {
        success: true,
        message: 'Подключение успешно',
      };

      vi.mocked(mockFacade.ping).mockResolvedValue(mockPingResult);

      // Act
      const result = await registry.execute('yandex_tracker_ping', params);

      // Assert
      expect(result.isError).toBeUndefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0]!.type).toBe('text');

      expect(mockLogger.info).toHaveBeenCalledWith('Вызов инструмента: yandex_tracker_ping');
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Инструмент yandex_tracker_ping выполнен успешно'
      );
      expect(mockLogger.debug).toHaveBeenCalledWith('Параметры:', params);
    });

    it('должна успешно выполнить get_issues инструмент', async () => {
      // Arrange
      const params: ToolCallParams = { issueKeys: ['TEST-1'] };
      const mockResults: BatchIssueResult[] = [
        {
          status: 'fulfilled',
          value: {
            self: 'https://api.tracker.yandex.net/v3/issues/TEST-1',
            id: '1',
            key: 'TEST-1',
            version: 1,
            summary: 'Test',
            statusStartTime: '2023-01-01T00:00:00.000+0000',
            updatedAt: '2023-01-01T00:00:00.000+0000',
            createdAt: '2023-01-01T00:00:00.000+0000',
          },
        },
      ];

      vi.mocked(mockFacade.getIssues).mockResolvedValue(mockResults);

      // Act
      const result = await registry.execute('yandex_tracker_get_issues', params);

      // Assert
      expect(result.isError).toBeUndefined();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Инструмент yandex_tracker_get_issues выполнен успешно'
      );
    });

    it('должна вернуть ошибку для несуществующего инструмента', async () => {
      // Arrange
      const params: ToolCallParams = {};

      // Act
      const result = await registry.execute('non_existent_tool', params);

      // Assert
      expect(result.isError).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]!.type).toBe('text');

      const content = JSON.parse(result.content[0]!.text);
      expect(content.success).toBe(false);
      expect(content.message).toContain('не найден');
      expect(content.availableTools).toContain('yandex_tracker_ping');
      expect(content.availableTools).toContain('yandex_tracker_get_issues');

      expect(mockLogger.error).toHaveBeenCalledWith('Инструмент не найден: non_existent_tool');
    });

    it('должна обработать ошибку при выполнении инструмента', async () => {
      // Arrange
      const params: ToolCallParams = {};
      const error = new Error('Execution failed');

      vi.mocked(mockFacade.ping).mockRejectedValue(error);

      // Act
      const result = await registry.execute('yandex_tracker_ping', params);

      // Assert
      expect(result.isError).toBe(true);
      expect(result.content).toHaveLength(1);

      const content = JSON.parse(result.content[0]!.text);
      expect(content.success).toBe(false);
      expect(content.message).toContain('Ошибка при проверке подключения');
      expect(content.tool).toBeUndefined(); // BaseTool не добавляет tool в formatError

      // Logger может быть вызван из PingTool или ToolRegistry
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('должна обработать нестандартную ошибку', async () => {
      // Arrange
      const params: ToolCallParams = {};

      vi.mocked(mockFacade.ping).mockRejectedValue('String error');

      // Act
      const result = await registry.execute('yandex_tracker_ping', params);

      // Assert
      expect(result.isError).toBe(true);

      const content = JSON.parse(result.content[0]!.text);
      expect(content.message).toContain('Ошибка при проверке подключения');
    });

    it('должна логировать параметры вызова', async () => {
      // Arrange
      const params: ToolCallParams = { key: 'value', nested: { prop: 123 } };
      const mockPingResult: PingResult = {
        success: true,
        message: 'OK',
      };

      vi.mocked(mockFacade.ping).mockResolvedValue(mockPingResult);

      // Act
      await registry.execute('yandex_tracker_ping', params);

      // Assert
      expect(mockLogger.debug).toHaveBeenCalledWith('Параметры:', params);
    });
  });
});
