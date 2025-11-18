/**
 * Integration тесты для GetCommentsTool
 *
 * Проверяет интеграцию:
 * - MCP Tool → Operation → HTTP Client → Mock Yandex Tracker API
 *
 * Используются реальные компоненты:
 * - GetCommentsTool (MCP tool)
 * - GetCommentsOperation (API operation)
 * - HttpClient (с mock adapter)
 * - Container (DI)
 *
 * Mock'и:
 * - HTTP запросы через axios-mock-adapter
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestClient } from '@integration/helpers/mcp-client.js';
import { createMockServer } from '@integration/helpers/mock-server.js';
import type { TestMCPClient } from '@integration/helpers/mcp-client.js';
import type { MockServer } from '@integration/helpers/mock-server.js';
import { createCommentListFixture } from '../../../../../helpers/comment.fixture.js';

describe('get-comments integration tests', () => {
  let client: TestMCPClient;
  let mockServer: MockServer;

  beforeEach(async () => {
    client = await createTestClient({ logLevel: 'silent' });
    mockServer = createMockServer(client.getAxiosInstance());
  });

  afterEach(() => {
    mockServer.cleanup();
  });

  it('должен получить список комментариев задачи', async () => {
    // Arrange
    const issueKey = 'TEST-123';
    const commentsFixture = createCommentListFixture(3);

    mockServer.mockGetCommentsSuccess(issueKey, commentsFixture);

    // Act
    const result = await client.callTool('fr_yandex_tracker_get_comments', {
      issueId: issueKey,
    });

    // Assert
    expect(result.isError).toBeUndefined();
    const response = JSON.parse(result.content[0]!.text);
    expect(response.success).toBe(true);
    expect(response.data.comments).toHaveLength(3);
    expect(response.data.count).toBe(3);
    mockServer.assertAllRequestsDone();
  });

  it('должен вернуть пустой массив для задачи без комментариев', async () => {
    // Arrange
    const issueKey = 'TEST-456';
    mockServer.mockGetCommentsSuccess(issueKey, []);

    // Act
    const result = await client.callTool('fr_yandex_tracker_get_comments', {
      issueId: issueKey,
    });

    // Assert
    expect(result.isError).toBeUndefined();
    const response = JSON.parse(result.content[0]!.text);
    expect(response.success).toBe(true);
    expect(response.data.comments).toHaveLength(0);
    expect(response.data.count).toBe(0);
    mockServer.assertAllRequestsDone();
  });

  it('должен поддерживать пагинацию (perPage и page)', async () => {
    // Arrange
    const issueKey = 'TEST-789';
    const commentsFixture = createCommentListFixture(5);

    mockServer.mockGetCommentsSuccess(issueKey, commentsFixture);

    // Act
    const result = await client.callTool('fr_yandex_tracker_get_comments', {
      issueId: issueKey,
      perPage: 5,
      page: 1,
    });

    // Assert
    expect(result.isError).toBeUndefined();
    const response = JSON.parse(result.content[0]!.text);
    expect(response.success).toBe(true);
    expect(response.data.comments).toHaveLength(5);
    mockServer.assertAllRequestsDone();
  });

  it('должен поддерживать expand параметр', async () => {
    // Arrange
    const issueKey = 'TEST-111';
    const commentsFixture = createCommentListFixture(2, {
      attachments: [{ id: 'att1', name: 'file.pdf', size: 1024 }],
    });

    mockServer.mockGetCommentsSuccess(issueKey, commentsFixture);

    // Act
    const result = await client.callTool('fr_yandex_tracker_get_comments', {
      issueId: issueKey,
      expand: 'attachments',
    });

    // Assert
    expect(result.isError).toBeUndefined();
    const response = JSON.parse(result.content[0]!.text);
    expect(response.success).toBe(true);
    expect(response.data.comments).toHaveLength(2);
    expect(response.data.comments[0]).toHaveProperty('attachments');
    mockServer.assertAllRequestsDone();
  });

  it('должен обработать ошибку 404 (задача не найдена)', async () => {
    // Arrange
    const issueKey = 'NONEXISTENT-999';
    mockServer.mockGetComments404(issueKey);

    // Act
    const result = await client.callTool('fr_yandex_tracker_get_comments', {
      issueId: issueKey,
    });

    // Assert
    expect(result.isError).toBe(true);
    mockServer.assertAllRequestsDone();
  });

  it('должен работать с ID задачи вместо ключа', async () => {
    // Arrange
    const issueId = '507f1f77bcf86cd799439011';
    const commentsFixture = createCommentListFixture(2);

    mockServer.mockGetCommentsSuccess(issueId, commentsFixture);

    // Act
    const result = await client.callTool('fr_yandex_tracker_get_comments', {
      issueId,
    });

    // Assert
    expect(result.isError).toBeUndefined();
    const response = JSON.parse(result.content[0]!.text);
    expect(response.success).toBe(true);
    expect(response.data.comments).toHaveLength(2);
    mockServer.assertAllRequestsDone();
  });

  it('должен вернуть корректную структуру данных', async () => {
    // Arrange
    const issueKey = 'TEST-222';
    const commentsFixture = createCommentListFixture(1);

    mockServer.mockGetCommentsSuccess(issueKey, commentsFixture);

    // Act
    const result = await client.callTool('fr_yandex_tracker_get_comments', {
      issueId: issueKey,
    });

    // Assert
    expect(result.isError).toBeUndefined();
    const response = JSON.parse(result.content[0]!.text);
    expect(response.success).toBe(true);
    expect(response.data).toHaveProperty('comments');
    expect(response.data).toHaveProperty('count', 1);
    expect(response.data.comments[0]).toHaveProperty('id');
    expect(response.data.comments[0]).toHaveProperty('text');
    expect(response.data.comments[0]).toHaveProperty('createdBy');
    expect(response.data.comments[0]).toHaveProperty('createdAt');
    mockServer.assertAllRequestsDone();
  });
});
