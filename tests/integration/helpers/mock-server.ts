/**
 * Mock сервер для имитации Яндекс.Трекер API v3
 * Использует nock для перехвата HTTP запросов
 */

import nock from 'nock';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const TRACKER_API_BASE = 'https://api.tracker.yandex.net';
export const TRACKER_API_V3 = '/v3';

/**
 * Загрузить fixture из JSON файла
 */
function loadFixture(path: string): unknown {
  const fixturePath = join(__dirname, '../fixtures', path);
  const content = readFileSync(fixturePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * MockServer для настройки HTTP моков
 */
export class MockServer {
  private scope: nock.Scope;

  constructor() {
    // Отключаем реальные HTTP запросы
    nock.disableNetConnect();

    this.scope = nock(TRACKER_API_BASE);
  }

  /**
   * Мок успешного получения задачи по ключу
   */
  mockGetIssueSuccess(issueKey: string, fixtureName = 'get-issue-QUEUE-1.json'): this {
    const response = loadFixture(`issues/${fixtureName}`);

    this.scope.get(`${TRACKER_API_V3}/issues/${issueKey}`).reply(200, response);

    return this;
  }

  /**
   * Мок успешного получения нескольких задач (batch)
   */
  mockGetIssuesBatchSuccess(issueKeys: string[], fixtureName = 'get-issue-QUEUE-1.json'): this {
    const response = loadFixture(`issues/${fixtureName}`);

    // Для batch запроса используется POST с параметром keys
    this.scope
      .post(`${TRACKER_API_V3}/issues/_search`, (body: Record<string, unknown>) => {
        const keys = body.keys as string[] | undefined;
        return keys !== undefined && issueKeys.every((key) => keys.includes(key));
      })
      .reply(
        200,
        issueKeys.map(() => response)
      );

    return this;
  }

  /**
   * Мок ошибки 404 (задача не найдена)
   */
  mockGetIssue404(issueKey: string): this {
    const response = loadFixture('issues/error-404.json');

    this.scope.get(`${TRACKER_API_V3}/issues/${issueKey}`).reply(404, response);

    return this;
  }

  /**
   * Мок ошибки 401 (не авторизован)
   */
  mockGetIssue401(issueKey: string): this {
    const response = loadFixture('issues/error-401.json');

    this.scope.get(`${TRACKER_API_V3}/issues/${issueKey}`).reply(401, response);

    return this;
  }

  /**
   * Мок ошибки 403 (доступ запрещён)
   */
  mockGetIssue403(issueKey: string): this {
    const response = loadFixture('issues/error-403.json');

    this.scope.get(`${TRACKER_API_V3}/issues/${issueKey}`).reply(403, response);

    return this;
  }

  /**
   * Мок сетевой ошибки (таймаут, connection refused)
   */
  mockNetworkError(issueKey: string, errorCode = 'ETIMEDOUT'): this {
    this.scope.get(`${TRACKER_API_V3}/issues/${issueKey}`).replyWithError({
      code: errorCode,
      message: 'Network error',
    });

    return this;
  }

  /**
   * Очистить все моки и восстановить HTTP
   */
  cleanup(): void {
    nock.cleanAll();
    nock.enableNetConnect();
  }

  /**
   * Проверить, что все замоканные запросы были выполнены
   */
  assertAllRequestsDone(): void {
    this.scope.done();
  }
}

/**
 * Хелпер для быстрого создания MockServer в тестах
 */
export function createMockServer(): MockServer {
  return new MockServer();
}
