/**
 * Unit tests for FileBasedConnector
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FileBasedConnector } from '../../../src/connectors/base/file-based-connector.js';
import { FileManager } from '../../../src/utils/file-manager.js';
import type { BaseMCPServerConfig, ClientInfo } from '../../../src/types.js';

// Mock FileManager
vi.mock('../../../src/utils/file-manager.js');

interface TestConfig extends BaseMCPServerConfig {
  projectPath: string;
  env?: Record<string, string>;
}

/**
 * Concrete implementation for testing
 */
class TestConnector extends FileBasedConnector<TestConfig> {
  constructor(
    private configPath: string,
    private serverName: string = 'test-server',
    private entryPoint: string = 'dist/index.js'
  ) {
    super();
  }

  getClientInfo(): ClientInfo {
    return {
      id: 'test-client',
      displayName: 'Test Client',
      configPath: this.configPath,
      requiresRestart: false,
    };
  }

  protected getConfigPath(): string {
    return this.configPath;
  }

  protected getServerName(): string {
    return this.serverName;
  }

  protected getEntryPoint(): string {
    return this.entryPoint;
  }

  async validateConfig(_config: TestConfig): Promise<string[]> {
    return [];
  }
}

describe('FileBasedConnector', () => {
  const configPath = '/test/.test-client/config.json';
  const configDir = '/test/.test-client';
  let connector: TestConnector;

  beforeEach(() => {
    vi.clearAllMocks();
    connector = new TestConnector(configPath);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isInstalled', () => {
    it('should return true when config directory exists', async () => {
      vi.mocked(FileManager.exists).mockResolvedValue(true);

      const result = await connector.isInstalled();

      expect(result).toBe(true);
      expect(FileManager.exists).toHaveBeenCalledWith(configDir);
    });

    it('should return false when config directory does not exist', async () => {
      vi.mocked(FileManager.exists).mockResolvedValue(false);

      const result = await connector.isInstalled();

      expect(result).toBe(false);
      expect(FileManager.exists).toHaveBeenCalledWith(configDir);
    });
  });

  describe('getStatus', () => {
    it('should return not connected when config file does not exist', async () => {
      vi.mocked(FileManager.exists).mockResolvedValue(false);

      const status = await connector.getStatus();

      expect(status).toEqual({
        connected: false,
        error: 'Конфигурационный файл не найден',
      });
    });

    it('should return not connected when server is not in config', async () => {
      vi.mocked(FileManager.exists).mockResolvedValue(true);
      vi.mocked(FileManager.readJSON).mockResolvedValue({
        mcpServers: {},
      });

      const status = await connector.getStatus();

      expect(status).toEqual({ connected: false });
    });

    it('should return connected when server is in config', async () => {
      vi.mocked(FileManager.exists).mockResolvedValue(true);
      vi.mocked(FileManager.readJSON).mockResolvedValue({
        mcpServers: {
          'test-server': {
            command: 'node',
            args: ['/project/dist/index.js'],
            env: { TOKEN: 'test' },
          },
        },
      });

      const status = await connector.getStatus();

      expect(status).toEqual({
        connected: true,
        details: {
          configPath,
          metadata: {
            serverConfig: {
              command: 'node',
              args: ['/project/dist/index.js'],
              env: { TOKEN: 'test' },
            },
          },
        },
      });
    });

    it('should return error when reading config fails', async () => {
      vi.mocked(FileManager.exists).mockResolvedValue(true);
      vi.mocked(FileManager.readJSON).mockRejectedValue(new Error('Failed to parse JSON'));

      const status = await connector.getStatus();

      expect(status).toEqual({
        connected: false,
        error: 'Ошибка чтения конфига: Failed to parse JSON',
      });
    });

    it('should handle non-Error exceptions', async () => {
      vi.mocked(FileManager.exists).mockResolvedValue(true);
      vi.mocked(FileManager.readJSON).mockRejectedValue('String error');

      const status = await connector.getStatus();

      expect(status).toEqual({
        connected: false,
        error: 'Ошибка чтения конфига: String error',
      });
    });
  });

  describe('connect', () => {
    const serverConfig: TestConfig = {
      projectPath: '/project',
      env: {
        TOKEN: 'test-token',
        ORG_ID: 'test-org',
      },
    };

    it('should create new config file when it does not exist', async () => {
      vi.mocked(FileManager.exists).mockResolvedValue(false);
      vi.mocked(FileManager.ensureDir).mockResolvedValue();
      vi.mocked(FileManager.writeJSON).mockResolvedValue();

      await connector.connect(serverConfig);

      expect(FileManager.ensureDir).toHaveBeenCalledWith(configDir);
      expect(FileManager.writeJSON).toHaveBeenCalledWith(configPath, {
        mcpServers: {
          'test-server': {
            command: 'node',
            args: ['/project/dist/index.js'],
            env: {
              TOKEN: 'test-token',
              ORG_ID: 'test-org',
            },
          },
        },
      });
    });

    it('should update existing config file', async () => {
      const existingConfig = {
        mcpServers: {
          'other-server': {
            command: 'node',
            args: ['/other/server.js'],
            env: {},
          },
        },
      };

      vi.mocked(FileManager.exists).mockResolvedValue(true);
      vi.mocked(FileManager.readJSON).mockResolvedValue(existingConfig);
      vi.mocked(FileManager.ensureDir).mockResolvedValue();
      vi.mocked(FileManager.writeJSON).mockResolvedValue();

      await connector.connect(serverConfig);

      expect(FileManager.writeJSON).toHaveBeenCalledWith(configPath, {
        mcpServers: {
          'other-server': {
            command: 'node',
            args: ['/other/server.js'],
            env: {},
          },
          'test-server': {
            command: 'node',
            args: ['/project/dist/index.js'],
            env: {
              TOKEN: 'test-token',
              ORG_ID: 'test-org',
            },
          },
        },
      });
    });

    it('should handle config without env', async () => {
      const configWithoutEnv: TestConfig = {
        projectPath: '/project',
      };

      vi.mocked(FileManager.exists).mockResolvedValue(false);
      vi.mocked(FileManager.ensureDir).mockResolvedValue();
      vi.mocked(FileManager.writeJSON).mockResolvedValue();

      await connector.connect(configWithoutEnv);

      expect(FileManager.writeJSON).toHaveBeenCalledWith(configPath, {
        mcpServers: {
          'test-server': {
            command: 'node',
            args: ['/project/dist/index.js'],
            env: {},
          },
        },
      });
    });

    it('should ensure directory is created', async () => {
      vi.mocked(FileManager.exists).mockResolvedValue(false);
      vi.mocked(FileManager.ensureDir).mockResolvedValue();
      vi.mocked(FileManager.writeJSON).mockResolvedValue();

      await connector.connect(serverConfig);

      expect(FileManager.ensureDir).toHaveBeenCalledWith(configDir);
    });
  });

  describe('disconnect', () => {
    it('should do nothing when config file does not exist', async () => {
      vi.mocked(FileManager.exists).mockResolvedValue(false);

      await connector.disconnect();

      expect(FileManager.readJSON).not.toHaveBeenCalled();
      expect(FileManager.writeJSON).not.toHaveBeenCalled();
    });

    it('should remove server from config when it exists', async () => {
      const existingConfig = {
        mcpServers: {
          'test-server': {
            command: 'node',
            args: ['/project/dist/index.js'],
            env: {},
          },
          'other-server': {
            command: 'node',
            args: ['/other/server.js'],
            env: {},
          },
        },
      };

      vi.mocked(FileManager.exists).mockResolvedValue(true);
      vi.mocked(FileManager.readJSON).mockResolvedValue(existingConfig);
      vi.mocked(FileManager.writeJSON).mockResolvedValue();

      await connector.disconnect();

      expect(FileManager.writeJSON).toHaveBeenCalledWith(configPath, {
        mcpServers: {
          'other-server': {
            command: 'node',
            args: ['/other/server.js'],
            env: {},
          },
        },
      });
    });

    it('should do nothing when server is not in config', async () => {
      const existingConfig = {
        mcpServers: {
          'other-server': {
            command: 'node',
            args: ['/other/server.js'],
            env: {},
          },
        },
      };

      vi.mocked(FileManager.exists).mockResolvedValue(true);
      vi.mocked(FileManager.readJSON).mockResolvedValue(existingConfig);
      vi.mocked(FileManager.writeJSON).mockResolvedValue();

      await connector.disconnect();

      expect(FileManager.writeJSON).not.toHaveBeenCalled();
    });
  });

  describe('custom configurations', () => {
    it('should support custom server key', async () => {
      class CustomKeyConnector extends TestConnector {
        protected getServerKey() {
          return 'custom_servers' as const;
        }
      }

      const customConnector = new CustomKeyConnector(configPath);
      const serverConfig: TestConfig = { projectPath: '/project', env: {} };

      vi.mocked(FileManager.exists).mockResolvedValue(false);
      vi.mocked(FileManager.ensureDir).mockResolvedValue();
      vi.mocked(FileManager.writeJSON).mockResolvedValue();

      await customConnector.connect(serverConfig);

      expect(FileManager.writeJSON).toHaveBeenCalledWith(
        configPath,
        expect.objectContaining({
          custom_servers: expect.any(Object),
        })
      );
    });

    it('should support custom command', async () => {
      class CustomCommandConnector extends TestConnector {
        protected getCommand() {
          return 'npx';
        }
      }

      const customConnector = new CustomCommandConnector(configPath);
      const serverConfig: TestConfig = { projectPath: '/project', env: {} };

      vi.mocked(FileManager.exists).mockResolvedValue(false);
      vi.mocked(FileManager.ensureDir).mockResolvedValue();
      vi.mocked(FileManager.writeJSON).mockResolvedValue();

      await customConnector.connect(serverConfig);

      expect(FileManager.writeJSON).toHaveBeenCalledWith(configPath, {
        mcpServers: {
          'test-server': {
            command: 'npx',
            args: ['/project/dist/index.js'],
            env: {},
          },
        },
      });
    });

    it('should support TOML format', async () => {
      class TOMLConnector extends TestConnector {
        protected getConfigFormat() {
          return 'toml' as const;
        }
      }

      const tomlConnector = new TOMLConnector(configPath);
      const serverConfig: TestConfig = { projectPath: '/project', env: {} };

      vi.mocked(FileManager.exists).mockResolvedValue(false);
      vi.mocked(FileManager.ensureDir).mockResolvedValue();
      vi.mocked(FileManager.writeTOML).mockResolvedValue();

      await tomlConnector.connect(serverConfig);

      expect(FileManager.writeTOML).toHaveBeenCalledWith(configPath, {
        mcpServers: {
          'test-server': {
            command: 'node',
            args: ['/project/dist/index.js'],
            env: {},
          },
        },
      });
    });

    it('should read TOML format correctly', async () => {
      class TOMLConnector extends TestConnector {
        protected getConfigFormat() {
          return 'toml' as const;
        }
      }

      const tomlConnector = new TOMLConnector(configPath);

      vi.mocked(FileManager.exists).mockResolvedValue(true);
      vi.mocked(FileManager.readTOML).mockResolvedValue({
        mcpServers: {
          'test-server': {
            command: 'node',
            args: ['/project/dist/index.js'],
            env: {},
          },
        },
      });

      const status = await tomlConnector.getStatus();

      expect(FileManager.readTOML).toHaveBeenCalledWith(configPath);
      expect(status.connected).toBe(true);
    });
  });
});
