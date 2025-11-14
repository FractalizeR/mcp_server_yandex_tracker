/**
 * Коннектор для Codex
 */

import * as os from 'os';
import * as path from 'path';
import { BaseConnector } from '../base/base-connector.js';
import type {
  MCPClientInfo,
  MCPServerConfig,
  ConnectionStatus,
} from '../base/connector.interface.js';
import { CommandExecutor } from '../../utils/command-executor.js';
import { FileManager } from '../../utils/file-manager.js';
import { MCP_SERVER_NAME } from '../../../src/constants.js';

interface CodexConfig {
  mcp_servers?: Record<
    string,
    {
      command: string;
      args: string[];
      env: Record<string, string>;
    }
  >;
}

export class CodexConnector extends BaseConnector {
  private readonly configPath: string;

  constructor() {
    super();
    this.configPath = path.join(os.homedir(), '.codex/config.toml');
  }

  getClientInfo(): MCPClientInfo {
    return {
      name: 'codex',
      displayName: 'Codex',
      description: 'CLI инструмент Codex от OpenAI',
      checkCommand: 'codex --version',
      configPath: this.configPath,
      platforms: ['darwin', 'linux', 'win32'],
    };
  }

  async isInstalled(): Promise<boolean> {
    return CommandExecutor.isCommandAvailable('codex');
  }

  async getStatus(): Promise<ConnectionStatus> {
    try {
      if (!(await FileManager.exists(this.configPath))) {
        return { connected: false };
      }

      const config = await FileManager.readTOML<CodexConfig>(this.configPath);

      if (config.mcp_servers && config.mcp_servers[MCP_SERVER_NAME]) {
        return {
          connected: true,
          details: {
            configPath: this.configPath,
            metadata: { serverConfig: config.mcp_servers[MCP_SERVER_NAME] },
          },
        };
      }

      return { connected: false };
    } catch (error) {
      return {
        connected: false,
        error: `Ошибка чтения конфига: ${(error as Error).message}`,
      };
    }
  }

  async connect(serverConfig: MCPServerConfig): Promise<void> {
    const args = [
      'mcp',
      'add',
      MCP_SERVER_NAME,
      '--env',
      `YANDEX_TRACKER_TOKEN=${serverConfig.token}`,
      '--env',
      `YANDEX_ORG_ID=${serverConfig.orgId}`,
      '--env',
      `YANDEX_TRACKER_API_BASE=${serverConfig.apiBase || 'https://api.tracker.yandex.net'}`,
      '--env',
      `LOG_LEVEL=${serverConfig.logLevel || 'info'}`,
      '--env',
      `REQUEST_TIMEOUT=${serverConfig.requestTimeout || 30000}`,
      '--',
      'node',
      path.join(serverConfig.projectPath, 'dist/index.js'),
    ];

    await CommandExecutor.execInteractive('codex', args);
  }

  async disconnect(): Promise<void> {
    // Codex может не иметь команды remove, поэтому удаляем из TOML
    if (!(await FileManager.exists(this.configPath))) {
      return;
    }

    const config = await FileManager.readTOML<CodexConfig>(this.configPath);

    if (config.mcp_servers && config.mcp_servers[MCP_SERVER_NAME]) {
      delete config.mcp_servers[MCP_SERVER_NAME];
      await FileManager.writeTOML(this.configPath, config);
    }
  }
}
