/**
 * Unit tests for QwenConnector
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as os from 'node:os';
import * as path from 'node:path';
import { QwenConnector } from '../../../src/connectors/qwen/qwen.connector.js';
import type { BaseMCPServerConfig } from '../../../src/types.js';

interface TestConfig extends BaseMCPServerConfig {
  projectPath: string;
}

describe('QwenConnector', () => {
  let connector: QwenConnector<TestConfig>;

  beforeEach(() => {
    connector = new QwenConnector('test-server', 'dist/index.js');
  });

  describe('getClientInfo', () => {
    it('should return client information', () => {
      const info = connector.getClientInfo();
      const expectedConfigPath = path.join(os.homedir(), '.qwen/settings.json');

      expect(info).toEqual({
        name: 'qwen',
        displayName: 'Qwen Code',
        description: 'Qwen Code для разработки с MCP серверами',
        configPath: expectedConfigPath,
        platforms: ['darwin', 'linux', 'win32'],
      });
    });
  });

  describe('getConfigPath', () => {
    it('should return correct config path', () => {
      const expectedPath = path.join(os.homedir(), '.qwen/settings.json');

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
    it('should return mcpServers key (default)', () => {
      const serverKey = (connector as any).getServerKey();

      expect(serverKey).toBe('mcpServers');
    });
  });

  describe('getConfigFormat', () => {
    it('should return json format (default)', () => {
      const format = (connector as any).getConfigFormat();

      expect(format).toBe('json');
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
