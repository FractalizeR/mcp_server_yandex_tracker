/**
 * Unit tests for ClaudeCodeConnector
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClaudeCodeConnector } from '../../../src/connectors/claude-code/claude-code.connector.js';
import { CommandExecutor } from '../../../src/utils/command-executor.js';
import type { BaseMCPServerConfig } from '../../../src/types.js';

// Mock CommandExecutor
vi.mock('../../../src/utils/command-executor.js');

interface TestConfig extends BaseMCPServerConfig {
  projectPath: string;
  env?: Record<string, string>;
}

describe('ClaudeCodeConnector', () => {
  let connector: ClaudeCodeConnector<TestConfig>;

  beforeEach(() => {
    vi.clearAllMocks();
    connector = new ClaudeCodeConnector('test-server', 'dist/index.js');
  });

  describe('getClientInfo', () => {
    it('should return client information', () => {
      const info = connector.getClientInfo();

      expect(info).toEqual({
        name: 'claude-code',
        displayName: 'Claude Code',
        description: 'CLI инструмент Claude Code для разработки',
        checkCommand: 'claude --version',
        configPath: 'managed-by-cli',
        platforms: ['darwin', 'linux', 'win32'],
      });
    });
  });

  describe('isInstalled', () => {
    it('should return true when claude command is available', async () => {
      vi.mocked(CommandExecutor.isCommandAvailable).mockReturnValue(true);

      const result = await connector.isInstalled();

      expect(result).toBe(true);
      expect(CommandExecutor.isCommandAvailable).toHaveBeenCalledWith('claude');
    });

    it('should return false when claude command is not available', async () => {
      vi.mocked(CommandExecutor.isCommandAvailable).mockReturnValue(false);

      const result = await connector.isInstalled();

      expect(result).toBe(false);
    });
  });

  describe('getStatus', () => {
    it('should return connected when server is in list', async () => {
      vi.mocked(CommandExecutor.exec).mockReturnValue('test-server\nother-server\n');

      const status = await connector.getStatus();

      expect(status).toEqual({
        connected: true,
        details: {
          configPath: 'managed by claude mcp',
        },
      });
      expect(CommandExecutor.exec).toHaveBeenCalledWith('claude mcp list');
    });

    it('should return not connected when server is not in list', async () => {
      vi.mocked(CommandExecutor.exec).mockReturnValue('other-server\n');

      const status = await connector.getStatus();

      expect(status).toEqual({ connected: false });
    });

    it('should return error when command fails', async () => {
      vi.mocked(CommandExecutor.exec).mockImplementation(() => {
        throw new Error('Command failed');
      });

      const status = await connector.getStatus();

      expect(status).toEqual({
        connected: false,
        error: 'Ошибка проверки статуса: Command failed',
      });
    });

    it('should handle non-Error exceptions', async () => {
      vi.mocked(CommandExecutor.exec).mockImplementation(() => {
        throw 'String error';
      });

      const status = await connector.getStatus();

      expect(status).toEqual({
        connected: false,
        error: 'Ошибка проверки статуса: String error',
      });
    });
  });

  describe('connect', () => {
    it('should execute connect command without env variables', async () => {
      vi.mocked(CommandExecutor.execInteractive).mockResolvedValue();

      const config: TestConfig = {
        projectPath: '/project',
      };

      await connector.connect(config);

      expect(CommandExecutor.execInteractive).toHaveBeenCalledWith('claude', [
        'mcp',
        'add',
        '--transport',
        'stdio',
        'test-server',
        '--',
        'node',
        '/project/dist/index.js',
      ]);
    });

    it('should execute connect command with env variables', async () => {
      vi.mocked(CommandExecutor.execInteractive).mockResolvedValue();

      const config: TestConfig = {
        projectPath: '/project',
        env: {
          TOKEN: 'test-token',
          ORG_ID: 'test-org',
        },
      };

      await connector.connect(config);

      expect(CommandExecutor.execInteractive).toHaveBeenCalledWith('claude', [
        'mcp',
        'add',
        '--transport',
        'stdio',
        'test-server',
        '--env',
        'TOKEN=test-token',
        '--env',
        'ORG_ID=test-org',
        '--',
        'node',
        '/project/dist/index.js',
      ]);
    });
  });

  describe('disconnect', () => {
    it('should execute disconnect command', async () => {
      vi.mocked(CommandExecutor.execInteractive).mockResolvedValue();

      await connector.disconnect();

      expect(CommandExecutor.execInteractive).toHaveBeenCalledWith('claude', [
        'mcp',
        'remove',
        'test-server',
      ]);
    });
  });

  describe('validateConfig', () => {
    it('should validate config successfully', async () => {
      const config: TestConfig = {
        projectPath: '/project',
      };

      const errors = await connector.validateConfig(config);

      expect(errors).toEqual([]);
    });
  });
});
