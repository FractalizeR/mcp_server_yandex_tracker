/**
 * Integration тесты для DeleteCommentTool
 *
 * Проверяет интеграцию:
 * - MCP Tool → Operation → HTTP Client → Mock Yandex Tracker API
 *
 * Используются реальные компоненты:
 * - DeleteCommentTool (MCP tool)
 * - DeleteCommentOperation (API operation)
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

describe('delete-comment integration tests', () => {
  let client: TestMCPClient;
  let mockServer: MockServer;

  beforeEach(async () => {
    client = await createTestClient({ logLevel: 'silent' });
    mockServer = createMockServer(client.getAxiosInstance());
  });

  afterEach(() => {
    mockServer.cleanup();
  });

  it('должен удалить комментарий', async () => {
    // Arrange
    const issueKey = 'TEST-123';
    const commentId = '12345';

    mockServer.mockDeleteCommentSuccess(issueKey, commentId);

    // Act
    const result = await client.callTool('fr_yandex_tracker_delete_comment', {
      issueId: issueKey,
      commentId,
    });

    // Assert
    expect(result.isError).toBeUndefined();
    const response = JSON.parse(result.content[0]!.text);
    expect(response.success).toBe(true);
    expect(response.data.success).toBe(true);
    expect(response.data.message).toBeDefined();
    expect(response.data.commentId).toBe(commentId);
    expect(response.data.issueId).toBe(issueKey);
    mockServer.assertAllRequestsDone();
  });

  it('должен обработать ошибку 404 (комментарий не найден)', async () => {
    // Arrange
    const issueKey = 'TEST-456';
    const commentId = 'nonexistent';

    mockServer.mockDeleteComment404(issueKey, commentId);

    // Act
    const result = await client.callTool('fr_yandex_tracker_delete_comment', {
      issueId: issueKey,
      commentId,
    });

    // Assert
    expect(result.isError).toBe(true);
    mockServer.assertAllRequestsDone();
  });

  it('должен работать с ID задачи вместо ключа', async () => {
    // Arrange
    const issueId = '507f1f77bcf86cd799439011';
    const commentId = '67890';

    mockServer.mockDeleteCommentSuccess(issueId, commentId);

    // Act
    const result = await client.callTool('fr_yandex_tracker_delete_comment', {
      issueId,
      commentId,
    });

    // Assert
    expect(result.isError).toBeUndefined();
    const response = JSON.parse(result.content[0]!.text);
    expect(response.success).toBe(true);
    expect(response.data.commentId).toBe(commentId);
    mockServer.assertAllRequestsDone();
  });

  it('должен вернуть корректное сообщение об успехе', async () => {
    // Arrange
    const issueKey = 'TEST-789';
    const commentId = '99999';

    mockServer.mockDeleteCommentSuccess(issueKey, commentId);

    // Act
    const result = await client.callTool('fr_yandex_tracker_delete_comment', {
      issueId: issueKey,
      commentId,
    });

    // Assert
    expect(result.isError).toBeUndefined();
    const response = JSON.parse(result.content[0]!.text);
    expect(response.success).toBe(true);
    expect(response.data).toHaveProperty('message');
    expect(typeof response.data.message).toBe('string');
    expect(response.data.message.length).toBeGreaterThan(0);
    mockServer.assertAllRequestsDone();
  });

  it('должен удалить комментарий из разных задач', async () => {
    // Arrange
    const issueKey1 = 'PROJ-1';
    const issueKey2 = 'PROJ-2';
    const commentId1 = '11111';
    const commentId2 = '22222';

    mockServer.mockDeleteCommentSuccess(issueKey1, commentId1);
    mockServer.mockDeleteCommentSuccess(issueKey2, commentId2);

    // Act
    const result1 = await client.callTool('fr_yandex_tracker_delete_comment', {
      issueId: issueKey1,
      commentId: commentId1,
    });

    const result2 = await client.callTool('fr_yandex_tracker_delete_comment', {
      issueId: issueKey2,
      commentId: commentId2,
    });

    // Assert
    expect(result1.isError).toBeUndefined();
    expect(result2.isError).toBeUndefined();

    const response1 = JSON.parse(result1.content[0]!.text);
    const response2 = JSON.parse(result2.content[0]!.text);

    expect(response1.success).toBe(true);
    expect(response2.success).toBe(true);

    expect(response1.data.issueId).toBe(issueKey1);
    expect(response2.data.issueId).toBe(issueKey2);

    mockServer.assertAllRequestsDone();
  });
});
