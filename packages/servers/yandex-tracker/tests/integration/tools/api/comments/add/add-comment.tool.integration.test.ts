/**
 * Integration тесты для AddCommentTool
 *
 * Проверяет интеграцию:
 * - MCP Tool → Operation → HTTP Client → Mock Yandex Tracker API
 *
 * Используются реальные компоненты:
 * - AddCommentTool (MCP tool)
 * - AddCommentOperation (API operation)
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
import { createCommentFixture } from '../../../../../helpers/comment.fixture.js';

describe('add-comment integration tests', () => {
  let client: TestMCPClient;
  let mockServer: MockServer;

  beforeEach(async () => {
    client = await createTestClient({ logLevel: 'silent' });
    mockServer = createMockServer(client.getAxiosInstance());
  });

  afterEach(() => {
    mockServer.cleanup();
  });

  it('должен добавить комментарий с минимальными полями', async () => {
    // Arrange
    const issueKey = 'TEST-123';
    const commentText = 'Integration test comment';
    const commentFixture = createCommentFixture({
      text: commentText,
    });

    mockServer.mockAddCommentSuccess(issueKey, commentFixture);

    // Act
    const result = await client.callTool('fr_yandex_tracker_add_comment', {
      issueId: issueKey,
      text: commentText,
    });

    // Assert
    expect(result.isError).toBeUndefined();
    const response = JSON.parse(result.content[0]!.text);
    expect(response.success).toBe(true);
    expect(response.data.comment).toHaveProperty('id');
    expect(response.data.comment.text).toBe(commentText);
    mockServer.assertAllRequestsDone();
  });

  it('должен добавить комментарий с attachmentIds', async () => {
    // Arrange
    const issueKey = 'TEST-456';
    const commentText = 'Comment with attachments';
    const attachmentIds = ['att1', 'att2'];
    const commentFixture = createCommentFixture({
      text: commentText,
      attachments: [
        { id: 'att1', name: 'file1.pdf', size: 1024 },
        { id: 'att2', name: 'file2.png', size: 2048 },
      ],
    });

    mockServer.mockAddCommentSuccess(issueKey, commentFixture);

    // Act
    const result = await client.callTool('fr_yandex_tracker_add_comment', {
      issueId: issueKey,
      text: commentText,
      attachmentIds,
    });

    // Assert
    expect(result.isError).toBeUndefined();
    const response = JSON.parse(result.content[0]!.text);
    expect(response.success).toBe(true);
    expect(response.data.comment.attachments).toHaveLength(2);
    mockServer.assertAllRequestsDone();
  });

  it('должен обработать ошибку 403 (доступ запрещён)', async () => {
    // Arrange
    const issueKey = 'TEST-789';
    mockServer.mockAddComment403(issueKey);

    // Act
    const result = await client.callTool('fr_yandex_tracker_add_comment', {
      issueId: issueKey,
      text: 'Test comment',
    });

    // Assert
    expect(result.isError).toBe(true);
    mockServer.assertAllRequestsDone();
  });

  it('должен работать с ID задачи вместо ключа', async () => {
    // Arrange
    const issueId = '507f1f77bcf86cd799439011'; // MongoDB-style ID
    const commentText = 'Comment by issue ID';
    const commentFixture = createCommentFixture({
      text: commentText,
    });

    mockServer.mockAddCommentSuccess(issueId, commentFixture);

    // Act
    const result = await client.callTool('fr_yandex_tracker_add_comment', {
      issueId,
      text: commentText,
    });

    // Assert
    expect(result.isError).toBeUndefined();
    const response = JSON.parse(result.content[0]!.text);
    expect(response.success).toBe(true);
    mockServer.assertAllRequestsDone();
  });

  it('должен вернуть корректную структуру данных', async () => {
    // Arrange
    const issueKey = 'TEST-111';
    const commentText = 'Test structure';
    const commentFixture = createCommentFixture({
      id: '12345',
      text: commentText,
      version: 1,
      transport: 'internal',
    });

    mockServer.mockAddCommentSuccess(issueKey, commentFixture);

    // Act
    const result = await client.callTool('fr_yandex_tracker_add_comment', {
      issueId: issueKey,
      text: commentText,
    });

    // Assert
    expect(result.isError).toBeUndefined();
    const response = JSON.parse(result.content[0]!.text);
    expect(response.success).toBe(true);
    expect(response.data.comment).toHaveProperty('id', '12345');
    expect(response.data.comment).toHaveProperty('text', commentText);
    expect(response.data.comment).toHaveProperty('createdBy');
    expect(response.data.comment).toHaveProperty('createdAt');
    expect(response.data.comment).toHaveProperty('version', 1);
    expect(response.data.comment).toHaveProperty('transport', 'internal');
    mockServer.assertAllRequestsDone();
  });
});
