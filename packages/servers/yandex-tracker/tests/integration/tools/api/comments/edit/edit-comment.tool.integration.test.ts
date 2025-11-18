/**
 * Integration тесты для EditCommentTool
 *
 * Проверяет интеграцию:
 * - MCP Tool → Operation → HTTP Client → Mock Yandex Tracker API
 *
 * Используются реальные компоненты:
 * - EditCommentTool (MCP tool)
 * - EditCommentOperation (API operation)
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
import { createEditedCommentFixture } from '../../../../../helpers/comment.fixture.js';

describe('edit-comment integration tests', () => {
  let client: TestMCPClient;
  let mockServer: MockServer;

  beforeEach(async () => {
    client = await createTestClient({ logLevel: 'silent' });
    mockServer = createMockServer(client.getAxiosInstance());
  });

  afterEach(() => {
    mockServer.cleanup();
  });

  it('должен отредактировать комментарий', async () => {
    // Arrange
    const issueKey = 'TEST-123';
    const commentId = '12345';
    const newText = 'Updated comment text';
    const commentFixture = createEditedCommentFixture({
      id: commentId,
      text: newText,
    });

    mockServer.mockEditCommentSuccess(issueKey, commentId, commentFixture);

    // Act
    const result = await client.callTool('fr_yandex_tracker_edit_comment', {
      issueId: issueKey,
      commentId,
      text: newText,
    });

    // Assert
    expect(result.isError).toBeUndefined();
    const response = JSON.parse(result.content[0]!.text);
    expect(response.success).toBe(true);
    expect(response.data.comment).toHaveProperty('id', commentId);
    expect(response.data.comment.text).toBe(newText);
    expect(response.data.comment).toHaveProperty('updatedBy');
    expect(response.data.comment).toHaveProperty('updatedAt');
    mockServer.assertAllRequestsDone();
  });

  it('должен обновить версию комментария', async () => {
    // Arrange
    const issueKey = 'TEST-456';
    const commentId = '67890';
    const newText = 'Version 2';
    const commentFixture = createEditedCommentFixture({
      id: commentId,
      text: newText,
      version: 2,
    });

    mockServer.mockEditCommentSuccess(issueKey, commentId, commentFixture);

    // Act
    const result = await client.callTool('fr_yandex_tracker_edit_comment', {
      issueId: issueKey,
      commentId,
      text: newText,
    });

    // Assert
    expect(result.isError).toBeUndefined();
    const response = JSON.parse(result.content[0]!.text);
    expect(response.success).toBe(true);
    expect(response.data.comment).toHaveProperty('version', 2);
    mockServer.assertAllRequestsDone();
  });

  it('должен обработать ошибку 404 (комментарий не найден)', async () => {
    // Arrange
    const issueKey = 'TEST-789';
    const commentId = 'nonexistent';
    mockServer.mockEditComment404(issueKey, commentId);

    // Act
    const result = await client.callTool('fr_yandex_tracker_edit_comment', {
      issueId: issueKey,
      commentId,
      text: 'New text',
    });

    // Assert
    expect(result.isError).toBe(true);
    mockServer.assertAllRequestsDone();
  });

  it('должен работать с ID задачи вместо ключа', async () => {
    // Arrange
    const issueId = '507f1f77bcf86cd799439011';
    const commentId = '12345';
    const newText = 'Updated by issue ID';
    const commentFixture = createEditedCommentFixture({
      id: commentId,
      text: newText,
    });

    mockServer.mockEditCommentSuccess(issueId, commentId, commentFixture);

    // Act
    const result = await client.callTool('fr_yandex_tracker_edit_comment', {
      issueId,
      commentId,
      text: newText,
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
    const commentId = '11111';
    const newText = 'Test structure';
    const commentFixture = createEditedCommentFixture({
      id: commentId,
      text: newText,
      version: 3,
    });

    mockServer.mockEditCommentSuccess(issueKey, commentId, commentFixture);

    // Act
    const result = await client.callTool('fr_yandex_tracker_edit_comment', {
      issueId: issueKey,
      commentId,
      text: newText,
    });

    // Assert
    expect(result.isError).toBeUndefined();
    const response = JSON.parse(result.content[0]!.text);
    expect(response.success).toBe(true);
    expect(response.data.comment).toHaveProperty('id', commentId);
    expect(response.data.comment).toHaveProperty('text', newText);
    expect(response.data.comment).toHaveProperty('createdBy');
    expect(response.data.comment).toHaveProperty('createdAt');
    expect(response.data.comment).toHaveProperty('updatedBy');
    expect(response.data.comment).toHaveProperty('updatedAt');
    expect(response.data.comment).toHaveProperty('version', 3);
    mockServer.assertAllRequestsDone();
  });
});
