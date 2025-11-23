/**
 * Unit tests for connectCommand
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { connectCommand } from '../../../src/commands/connect.command.js';
import { ConnectorRegistry } from '../../../src/connectors/registry.js';
import { ConfigManager } from '../../../src/utils/config-manager.js';
import { InteractivePrompter } from '../../../src/utils/interactive-prompter.js';
import { Logger } from '../../../src/utils/logger.js';
import type {
  IConnector,
  BaseMCPServerConfig,
  ConnectionStatus,
  MCPClientInfo,
} from '../../../src/types.js';

// Mock зависимостей
vi.mock('../../../src/utils/logger.js');

// Mock InteractivePrompter instance method
const mockPromptServerConfig = vi.fn();
/* eslint-disable @typescript-eslint/consistent-type-imports */
vi.mock('../../../src/utils/interactive-prompter.js', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../../src/utils/interactive-prompter.js')>();
  return {
    ...actual,
    InteractivePrompter: class MockInteractivePrompter {
      static promptClientSelection = vi.fn();
      static promptConfirmation = vi.fn();
      static promptSelection = vi.fn();

      promptServerConfig = mockPromptServerConfig;
    },
  };
});
/* eslint-enable @typescript-eslint/consistent-type-imports */

interface TestConfig extends BaseMCPServerConfig {
  projectPath: string;
  token?: string;
  orgId?: string;
}

describe('connectCommand', () => {
  let registry: ConnectorRegistry<TestConfig>;
  let configManager: ConfigManager<TestConfig>;
  let mockConnector: IConnector<TestConfig>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Logger methods
    vi.mocked(Logger.header).mockImplementation(() => {});
    vi.mocked(Logger.newLine).mockImplementation(() => {});
    vi.mocked(Logger.info).mockImplementation(() => {});
    vi.mocked(Logger.success).mockImplementation(() => {});
    vi.mocked(Logger.error).mockImplementation(() => {});
    const mockSpinner = {
      stop: vi.fn(),
      succeed: vi.fn(),
      fail: vi.fn(),
    };
    vi.mocked(Logger.spinner).mockReturnValue(mockSpinner as never);

    // Create registry
    registry = new ConnectorRegistry<TestConfig>();

    // Create config manager
    configManager = new ConfigManager<TestConfig>({
      projectName: 'test-server',
      safeFields: ['orgId'],
    });

    // Create mock connector
    mockConnector = {
      getClientInfo: vi.fn().mockReturnValue({
        name: 'test-client',
        displayName: 'Test Client',
        description: 'Test Client Description',
        configPath: '/test/path',
        platforms: ['darwin', 'linux', 'win32'],
      } as MCPClientInfo),
      isInstalled: vi.fn().mockResolvedValue(true),
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      getStatus: vi.fn().mockResolvedValue({
        connected: true,
        details: {
          configPath: '/test/path/config.json',
        },
      } as ConnectionStatus),
      validateConfig: vi.fn().mockResolvedValue([]),
    };
  });

  describe('when no clients are installed', () => {
    it('should display error and exit', async () => {
      await connectCommand({
        registry,
        configManager,
        configPrompts: [],
      });

      expect(Logger.error).toHaveBeenCalledWith('Не найдено установленных MCP клиентов');
      expect(Logger.info).toHaveBeenCalledWith(
        'Поддерживаемые клиенты: Claude Desktop, Claude Code, Codex, Gemini, Qwen'
      );
    });
  });

  describe('when client is specified via CLI options', () => {
    beforeEach(() => {
      registry.register(mockConnector);
    });

    it('should use the specified client', async () => {
      mockPromptServerConfig.mockResolvedValue({
        projectPath: '/test/path',
        token: 'test-token',
      } as TestConfig);
      InteractivePrompter.promptConfirmation.mockResolvedValue(false);

      await connectCommand({
        registry,
        configManager,
        configPrompts: [],
        cliOptions: { client: 'test-client' },
      });

      expect(Logger.info).toHaveBeenCalledWith('Выбран клиент: Test Client');
      expect(mockConnector.connect).toHaveBeenCalled();
    });

    it('should display error if specified client not found', async () => {
      await connectCommand({
        registry,
        configManager,
        configPrompts: [],
        cliOptions: { client: 'non-existent' },
      });

      expect(Logger.error).toHaveBeenCalledWith('Клиент "non-existent" не найден');
      expect(mockConnector.connect).not.toHaveBeenCalled();
    });

    it.skip('should display error if specified client not installed', async () => {
      vi.mocked(mockConnector.isInstalled).mockResolvedValue(false);

      await connectCommand({
        registry,
        configManager,
        configPrompts: [],
        cliOptions: { client: 'test-client' },
      });

      expect(Logger.error).toHaveBeenCalledWith('Клиент "test-client" не установлен');
      expect(mockConnector.connect).not.toHaveBeenCalled();
    });
  });

  describe('when client is selected interactively', () => {
    beforeEach(() => {
      registry.register(mockConnector);
    });

    it('should prompt for client selection', async () => {
      InteractivePrompter.promptClientSelection.mockResolvedValue('test-client');
      mockPromptServerConfig.mockResolvedValue({
        projectPath: '/test/path',
      } as TestConfig);
      InteractivePrompter.promptConfirmation.mockResolvedValue(false);

      await connectCommand({
        registry,
        configManager,
        configPrompts: [],
      });

      expect(InteractivePrompter.promptClientSelection).toHaveBeenCalled();
      expect(mockConnector.connect).toHaveBeenCalled();
    });

    it('should handle when connector selection returns invalid client', async () => {
      InteractivePrompter.promptClientSelection.mockResolvedValue('invalid-client');

      await connectCommand({
        registry,
        configManager,
        configPrompts: [],
      });

      expect(Logger.error).toHaveBeenCalledWith('Не удалось выбрать клиент');
      expect(mockConnector.connect).not.toHaveBeenCalled();
    });
  });

  describe('configuration handling', () => {
    beforeEach(() => {
      registry.register(mockConnector);
      InteractivePrompter.promptConfirmation.mockResolvedValue(false);
    });

    it('should use saved configuration if available', async () => {
      const savedConfig: TestConfig = {
        projectPath: '/test/path',
        orgId: 'saved-org',
      };

      vi.spyOn(configManager, 'load').mockResolvedValue(savedConfig);
      mockPromptServerConfig.mockResolvedValue(savedConfig);

      await connectCommand({
        registry,
        configManager,
        configPrompts: [],
        cliOptions: { client: 'test-client' },
      });

      expect(Logger.info).toHaveBeenCalledWith(
        'Найдена сохраненная конфигурация (секретные поля будут запрошены заново)'
      );
      expect(mockPromptServerConfig).toHaveBeenCalledWith(savedConfig);
    });

    it('should use buildConfig function if provided', async () => {
      const buildConfig = vi.fn().mockReturnValue({
        projectPath: '/custom/path',
        customField: 'value',
      });

      mockPromptServerConfig.mockResolvedValue({
        projectPath: '/test/path',
      } as TestConfig);

      await connectCommand({
        registry,
        configManager,
        configPrompts: [],
        cliOptions: { client: 'test-client' },
        buildConfig,
      });

      expect(buildConfig).toHaveBeenCalled();
      expect(mockConnector.connect).toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    beforeEach(() => {
      registry.register(mockConnector);
      mockPromptServerConfig.mockResolvedValue({
        projectPath: '/test/path',
      } as TestConfig);
    });

    it('should display validation errors and exit', async () => {
      vi.mocked(mockConnector.validateConfig).mockResolvedValue([
        'Token is required',
        'Invalid orgId',
      ]);

      await connectCommand({
        registry,
        configManager,
        configPrompts: [],
        cliOptions: { client: 'test-client' },
      });

      expect(Logger.error).toHaveBeenCalledWith('Ошибки конфигурации:');
      expect(Logger.error).toHaveBeenCalledWith('  - Token is required');
      expect(Logger.error).toHaveBeenCalledWith('  - Invalid orgId');
      expect(mockConnector.connect).not.toHaveBeenCalled();
    });
  });

  describe('connection', () => {
    beforeEach(() => {
      registry.register(mockConnector);
      mockPromptServerConfig.mockResolvedValue({
        projectPath: '/test/path',
      } as TestConfig);
      InteractivePrompter.promptConfirmation.mockResolvedValue(false);
    });

    it('should connect successfully', async () => {
      await connectCommand({
        registry,
        configManager,
        configPrompts: [],
        cliOptions: { client: 'test-client' },
      });

      expect(mockConnector.connect).toHaveBeenCalled();
      const mockSpinner = vi.mocked(Logger.spinner).mock.results[1]?.value;
      expect(mockSpinner?.succeed).toHaveBeenCalledWith(
        'MCP сервер успешно подключен к Test Client!'
      );
    });

    it('should handle connection errors', async () => {
      vi.mocked(mockConnector.connect).mockRejectedValue(new Error('Connection failed'));

      await connectCommand({
        registry,
        configManager,
        configPrompts: [],
        cliOptions: { client: 'test-client' },
      });

      const mockSpinner = vi.mocked(Logger.spinner).mock.results[1]?.value;
      expect(mockSpinner?.fail).toHaveBeenCalledWith('Ошибка подключения: Connection failed');
      expect(InteractivePrompter.promptConfirmation).not.toHaveBeenCalled();
    });

    it('should display config details after successful connection', async () => {
      await connectCommand({
        registry,
        configManager,
        configPrompts: [],
        cliOptions: { client: 'test-client' },
      });

      expect(Logger.info).toHaveBeenCalledWith('Конфигурация: /test/path/config.json');
    });
  });

  describe('configuration saving', () => {
    beforeEach(() => {
      registry.register(mockConnector);
      mockPromptServerConfig.mockResolvedValue({
        projectPath: '/test/path',
        token: 'test-token',
      } as TestConfig);
    });

    it('should save configuration when user confirms', async () => {
      InteractivePrompter.promptConfirmation.mockResolvedValue(true);
      const saveSpy = vi.spyOn(configManager, 'save').mockResolvedValue();

      await connectCommand({
        registry,
        configManager,
        configPrompts: [],
        cliOptions: { client: 'test-client' },
      });

      expect(InteractivePrompter.promptConfirmation).toHaveBeenCalledWith(
        'Сохранить конфигурацию для следующего раза?',
        true
      );
      expect(saveSpy).toHaveBeenCalled();
      expect(Logger.success).toHaveBeenCalledWith(
        'Конфигурация сохранена (секретные поля исключены)'
      );
    });

    it('should not save configuration when user declines', async () => {
      InteractivePrompter.promptConfirmation.mockResolvedValue(false);
      const saveSpy = vi.spyOn(configManager, 'save').mockResolvedValue();

      await connectCommand({
        registry,
        configManager,
        configPrompts: [],
        cliOptions: { client: 'test-client' },
      });

      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe('complete workflow', () => {
    it('should execute full workflow successfully', async () => {
      registry.register(mockConnector);

      mockPromptServerConfig.mockResolvedValue({
        projectPath: '/test/path',
        token: 'test-token',
        orgId: 'test-org',
      } as TestConfig);
      InteractivePrompter.promptConfirmation.mockResolvedValue(true);
      const saveSpy = vi.spyOn(configManager, 'save').mockResolvedValue();

      await connectCommand({
        registry,
        configManager,
        configPrompts: [
          { name: 'token', type: 'password', message: 'Token:' },
          { name: 'orgId', type: 'input', message: 'Org ID:' },
        ],
        cliOptions: { client: 'test-client' },
      });

      expect(mockConnector.validateConfig).toHaveBeenCalled();
      expect(mockConnector.connect).toHaveBeenCalled();
      expect(mockConnector.getStatus).toHaveBeenCalled();
      expect(saveSpy).toHaveBeenCalled();
      expect(Logger.success).toHaveBeenCalledWith(
        '✅ Готово! Теперь вы можете использовать MCP сервер в выбранном клиенте.'
      );
    });
  });
});
