/**
 * Unit tests for CodexConnector
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as os from 'node:os';
import * as path from 'node:path';
import { CodexConnector } from '../../../src/connectors/codex/codex.connector.js';
import type { BaseMCPServerConfig } from '../../../src/types.js';

interface TestConfig extends BaseMCPServerConfig {
  projectPath: string;
}

describe('CodexConnector', () => {
  let connector: CodexConnector<TestConfig>;

  beforeEach(() => {
    connector = new CodexConnector('test-server', 'dist/index.js');
  });

  describe('getClientInfo', () => {
    it('should return client information', () => {
      const info = connector.getClientInfo();
      const expectedConfigPath = path.join(os.homedir(), '.codex/config.toml');

      expect(info).toEqual({
        name: 'codex',
        displayName: 'Codex',
        description: 'CLI инструмент Codex от OpenAI',
        checkCommand: 'codex --version',
        configPath: expectedConfigPath,
        platforms: ['darwin', 'linux', 'win32'],
      });
    });
  });

  describe('getConfigPath', () => {
    it('should return correct config path', () => {
      const expectedPath = path.join(os.homedir(), '.codex/config.toml');

      // Access protected method through type assertion
      const configPath = (connector as any).getConfigPath();

      expect(configPath).toBe(expectedPath);
    });
  });

  describe('getServerName', () => {
    it('should return server name', () => {
      const serverName = (connector as any).getServerName();

      expect(serverName).toBe('test-server');
    });
  });

  describe('getEntryPoint', () => {
    it('should return entry point', () => {
      const entryPoint = (connector as any).getEntryPoint();

      expect(entryPoint).toBe('dist/index.js');
    });
  });

  describe('getServerKey', () => {
    it('should return mcp_servers key', () => {
      const serverKey = (connector as any).getServerKey();

      expect(serverKey).toBe('mcp_servers');
    });
  });

  describe('getConfigFormat', () => {
    it('should return toml format', () => {
      const format = (connector as any).getConfigFormat();

      expect(format).toBe('toml');
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
