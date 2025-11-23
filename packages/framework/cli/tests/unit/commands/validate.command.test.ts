/**
 * Unit tests for validateCommand
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateCommand } from '../../../src/commands/validate.command.js';
import { ConnectorRegistry } from '../../../src/connectors/registry.js';
import { Logger } from '../../../src/utils/logger.js';
import type {
  IConnector,
  BaseMCPServerConfig,
  ConnectionStatus,
  MCPClientInfo,
} from '../../../src/types.js';

// Mock зависимостей
vi.mock('../../../src/utils/logger.js');

interface TestConfig extends BaseMCPServerConfig {
  projectPath: string;
}

describe('validateCommand', () => {
  let registry: ConnectorRegistry<TestConfig>;
  let mockProcessExit: typeof process.exit;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock process.exit
    mockProcessExit = vi.fn() as never;
    process.exit = mockProcessExit;

    // Mock Logger methods
    vi.mocked(Logger.header).mockImplementation(() => {});
    vi.mocked(Logger.newLine).mockImplementation(() => {});
    vi.mocked(Logger.info).mockImplementation(() => {});
    vi.mocked(Logger.success).mockImplementation(() => {});
    vi.mocked(Logger.error).mockImplementation(() => {});
    vi.mocked(Logger.warn).mockImplementation(() => {});
    const mockSpinner = {
      stop: vi.fn(),
      succeed: vi.fn(),
      fail: vi.fn(),
    };
    vi.mocked(Logger.spinner).mockReturnValue(mockSpinner as never);

    // Create registry
    registry = new ConnectorRegistry<TestConfig>();
  });

  describe('with empty registry', () => {
    it('should complete without errors', async () => {
      await validateCommand({ registry });

      expect(Logger.header).toHaveBeenCalledWith('🔍 Валидация конфигураций MCP клиентов');
      expect(Logger.info).toHaveBeenCalledWith('Итого: 0 валидных конфигураций из 0 проверенных');
      expect(mockProcessExit).not.toHaveBeenCalled();
    });
  });

  describe('with non-installed clients', () => {
    it('should warn about non-installed clients', async () => {
      const mockConnector: IConnector<TestConfig> = {
        getClientInfo: vi.fn().mockReturnValue({
          name: 'test-client',
          displayName: 'Test Client',
          configPath: '/test/path',
          description: 'Test Client Description',
          platforms: ['darwin', 'linux', 'win32'],
        } as MCPClientInfo),
        isInstalled: vi.fn().mockResolvedValue(false),
        connect: vi.fn(),
        disconnect: vi.fn(),
        getStatus: vi.fn().mockResolvedValue({
          connected: false,
        } as ConnectionStatus),
        validateConfig: vi.fn(),
      };

      registry.register(mockConnector);

      await validateCommand({ registry });

      expect(Logger.warn).toHaveBeenCalledWith('Test Client: клиент не установлен');
      expect(Logger.info).toHaveBeenCalledWith('Итого: 0 валидных конфигураций из 1 проверенных');
      expect(mockProcessExit).not.toHaveBeenCalled();
    });
  });

  describe('with connected clients', () => {
    it('should display success for valid configurations', async () => {
      const mockConnector: IConnector<TestConfig> = {
        getClientInfo: vi.fn().mockReturnValue({
          name: 'test-client',
          displayName: 'Test Client',
          configPath: '/test/path',
          description: 'Test Client Description',
          platforms: ['darwin', 'linux', 'win32'],
        } as MCPClientInfo),
        isInstalled: vi.fn().mockResolvedValue(true),
        connect: vi.fn(),
        disconnect: vi.fn(),
        getStatus: vi.fn().mockResolvedValue({
          connected: true,
          details: {
            configPath: '/test/config.json',
          },
        } as ConnectionStatus),
        validateConfig: vi.fn(),
      };

      registry.register(mockConnector);

      await validateCommand({ registry });

      expect(Logger.success).toHaveBeenCalledWith('Test Client: конфигурация валидна');
      expect(Logger.info).toHaveBeenCalledWith('  Файл: /test/config.json');
      expect(Logger.info).toHaveBeenCalledWith('Итого: 1 валидных конфигураций из 1 проверенных');
      expect(mockProcessExit).not.toHaveBeenCalled();
    });

    it('should handle connected clients without config path', async () => {
      const mockConnector: IConnector<TestConfig> = {
        getClientInfo: vi.fn().mockReturnValue({
          name: 'test-client',
          displayName: 'Test Client',
          configPath: '/test/path',
          description: 'Test Client Description',
          platforms: ['darwin', 'linux', 'win32'],
        } as MCPClientInfo),
        isInstalled: vi.fn().mockResolvedValue(true),
        connect: vi.fn(),
        disconnect: vi.fn(),
        getStatus: vi.fn().mockResolvedValue({
          connected: true,
        } as ConnectionStatus),
        validateConfig: vi.fn(),
      };

      registry.register(mockConnector);

      await validateCommand({ registry });

      expect(Logger.success).toHaveBeenCalledWith('Test Client: конфигурация валидна');
      expect(Logger.info).toHaveBeenCalledWith('Итого: 1 валидных конфигураций из 1 проверенных');
    });
  });

  describe('with disconnected clients', () => {
    it('should display info for disconnected clients without errors', async () => {
      const mockConnector: IConnector<TestConfig> = {
        getClientInfo: vi.fn().mockReturnValue({
          name: 'test-client',
          displayName: 'Test Client',
          configPath: '/test/path',
          description: 'Test Client Description',
          platforms: ['darwin', 'linux', 'win32'],
        } as MCPClientInfo),
        isInstalled: vi.fn().mockResolvedValue(true),
        connect: vi.fn(),
        disconnect: vi.fn(),
        getStatus: vi.fn().mockResolvedValue({
          connected: false,
        } as ConnectionStatus),
        validateConfig: vi.fn(),
      };

      registry.register(mockConnector);

      await validateCommand({ registry });

      expect(Logger.info).toHaveBeenCalledWith('Test Client: не подключен');
      expect(Logger.info).toHaveBeenCalledWith('Итого: 0 валидных конфигураций из 1 проверенных');
      expect(mockProcessExit).not.toHaveBeenCalled();
    });
  });

  describe('with configuration errors', () => {
    it('should display errors and exit with code 1', async () => {
      const mockConnector: IConnector<TestConfig> = {
        getClientInfo: vi.fn().mockReturnValue({
          name: 'test-client',
          displayName: 'Test Client',
          configPath: '/test/path',
          description: 'Test Client Description',
          platforms: ['darwin', 'linux', 'win32'],
        } as MCPClientInfo),
        isInstalled: vi.fn().mockResolvedValue(true),
        connect: vi.fn(),
        disconnect: vi.fn(),
        getStatus: vi.fn().mockResolvedValue({
          connected: false,
          error: 'Invalid configuration format',
        } as ConnectionStatus),
        validateConfig: vi.fn(),
      };

      registry.register(mockConnector);

      await validateCommand({ registry });

      expect(Logger.error).toHaveBeenCalledWith('Test Client: ошибка в конфигурации');
      expect(Logger.error).toHaveBeenCalledWith('  Invalid configuration format');
      expect(Logger.info).toHaveBeenCalledWith('Итого: 0 валидных конфигураций из 1 проверенных');
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });
  });

  describe('with multiple clients', () => {
    it.skip('should validate all clients and summarize results', async () => {
      const connectedConnector: IConnector<TestConfig> = {
        getClientInfo: vi.fn().mockReturnValue({
          id: 'connected-client',
          displayName: 'Connected Client',
          configPath: '/connected/path',
          description: 'Test Client Description',
          platforms: ['darwin', 'linux', 'win32'],
        } as MCPClientInfo),
        isInstalled: vi.fn().mockResolvedValue(true),
        connect: vi.fn(),
        disconnect: vi.fn(),
        getStatus: vi.fn().mockResolvedValue({
          connected: true,
          details: {
            configPath: '/connected/config.json',
          },
        } as ConnectionStatus),
        validateConfig: vi.fn(),
      };

      const disconnectedConnector: IConnector<TestConfig> = {
        getClientInfo: vi.fn().mockReturnValue({
          id: 'disconnected-client',
          displayName: 'Disconnected Client',
          configPath: '/disconnected/path',
          description: 'Test Client Description',
          platforms: ['darwin', 'linux', 'win32'],
        } as MCPClientInfo),
        isInstalled: vi.fn().mockResolvedValue(true),
        connect: vi.fn(),
        disconnect: vi.fn(),
        getStatus: vi.fn().mockResolvedValue({
          connected: false,
        } as ConnectionStatus),
        validateConfig: vi.fn(),
      };

      const errorConnector: IConnector<TestConfig> = {
        getClientInfo: vi.fn().mockReturnValue({
          id: 'error-client',
          displayName: 'Error Client',
          configPath: '/error/path',
          description: 'Test Client Description',
          platforms: ['darwin', 'linux', 'win32'],
        } as MCPClientInfo),
        isInstalled: vi.fn().mockResolvedValue(true),
        connect: vi.fn(),
        disconnect: vi.fn(),
        getStatus: vi.fn().mockResolvedValue({
          connected: false,
          error: 'Configuration error',
        } as ConnectionStatus),
        validateConfig: vi.fn(),
      };

      registry.register(connectedConnector);
      registry.register(disconnectedConnector);
      registry.register(errorConnector);

      await validateCommand({ registry });

      expect(Logger.success).toHaveBeenCalledWith('Connected Client: конфигурация валидна');
      expect(Logger.info).toHaveBeenCalledWith('Disconnected Client: не подключен');
      expect(Logger.error).toHaveBeenCalledWith('Error Client: ошибка в конфигурации');
      expect(Logger.info).toHaveBeenCalledWith('Итого: 1 валидных конфигураций из 3 проверенных');
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });
  });
});
