/**
 * Коннектор для Claude Code
 */

import * as path from 'path';
import { BaseConnector } from '../base/base-connector.js';
import type {
  MCPClientInfo,
  MCPServerConfig,
  ConnectionStatus,
} from '../base/connector.interface.js';
import { CommandExecutor } from '../../utils/command-executor.js';
import { MCP_SERVER_NAME } from '../../../src/constants.js';

export class ClaudeCodeConnector extends BaseConnector {
  getClientInfo(): MCPClientInfo {
    return {
      name: 'claude-code',
      displayName: 'Claude Code',
      description: 'CLI инструмент Claude Code для разработки',
      checkCommand: 'claude --version',
      configPath: 'managed-by-cli',
      platforms: ['darwin', 'linux', 'win32'],
    };
  }

  async isInstalled(): Promise<boolean> {
    return CommandExecutor.isCommandAvailable('claude');
  }

  async getStatus(): Promise<ConnectionStatus> {
    try {
      const output = CommandExecutor.exec('claude mcp list');
      const connected = output.includes(MCP_SERVER_NAME);

      return {
        connected,
        details: connected
          ? {
              configPath: 'managed by claude mcp',
            }
          : undefined,
      };
    } catch (error) {
      return {
        connected: false,
        error: `Ошибка проверки статуса: ${(error as Error).message}`,
      };
    }
  }

  async connect(serverConfig: MCPServerConfig): Promise<void> {
    const args = [
      'mcp',
      'add',
      '--transport',
      'stdio',
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

    await CommandExecutor.execInteractive('claude', args);
  }

  async disconnect(): Promise<void> {
    await CommandExecutor.execInteractive('claude', ['mcp', 'remove', MCP_SERVER_NAME]);
  }
}
