import { describe, it, expect } from 'vitest';
import { BatchResultProcessor } from '@mcp/utils/batch-result-processor.js';
import type { BatchResult } from '@types';

describe('BatchResultProcessor', () => {
  describe('process', () => {
    it('должен обработать пустой массив результатов', () => {
      const results: BatchResult<{ key: string }> = [];

      const processed = BatchResultProcessor.process(results);

      expect(processed.successful).toEqual([]);
      expect(processed.failed).toEqual([]);
    });

    it('должен обработать только успешные результаты', () => {
      const results: BatchResult<{ key: string; summary: string }> = [
        {
          status: 'fulfilled',
          issueKey: 'PROJ-1',
          value: { key: 'PROJ-1', summary: 'Task 1' },
        },
        {
          status: 'fulfilled',
          issueKey: 'PROJ-2',
          value: { key: 'PROJ-2', summary: 'Task 2' },
        },
      ];

      const processed = BatchResultProcessor.process(results);

      expect(processed.successful).toEqual([
        { issueKey: 'PROJ-1', data: { key: 'PROJ-1', summary: 'Task 1' } },
        { issueKey: 'PROJ-2', data: { key: 'PROJ-2', summary: 'Task 2' } },
      ]);
      expect(processed.failed).toEqual([]);
    });

    it('должен обработать только неудачные результаты', () => {
      const results: BatchResult<{ key: string }> = [
        {
          status: 'rejected',
          issueKey: 'PROJ-1',
          reason: new Error('Not found'),
        },
        {
          status: 'rejected',
          issueKey: 'PROJ-2',
          reason: new Error('Access denied'),
        },
      ];

      const processed = BatchResultProcessor.process(results);

      expect(processed.successful).toEqual([]);
      expect(processed.failed).toEqual([
        { issueKey: 'PROJ-1', error: 'Not found' },
        { issueKey: 'PROJ-2', error: 'Access denied' },
      ]);
    });

    it('должен обработать смешанные результаты', () => {
      const results: BatchResult<{ key: string }> = [
        {
          status: 'fulfilled',
          issueKey: 'PROJ-1',
          value: { key: 'PROJ-1' },
        },
        {
          status: 'rejected',
          issueKey: 'PROJ-2',
          reason: new Error('Not found'),
        },
        {
          status: 'fulfilled',
          issueKey: 'PROJ-3',
          value: { key: 'PROJ-3' },
        },
      ];

      const processed = BatchResultProcessor.process(results);

      expect(processed.successful).toHaveLength(2);
      expect(processed.failed).toHaveLength(1);
      expect(processed.failed[0]).toEqual({ issueKey: 'PROJ-2', error: 'Not found' });
    });

    it('должен применить функцию фильтрации к успешным результатам', () => {
      const results: BatchResult<{ key: string; summary: string; status: string }> = [
        {
          status: 'fulfilled',
          issueKey: 'PROJ-1',
          value: { key: 'PROJ-1', summary: 'Task 1', status: 'open' },
        },
        {
          status: 'fulfilled',
          issueKey: 'PROJ-2',
          value: { key: 'PROJ-2', summary: 'Task 2', status: 'closed' },
        },
      ];

      const filterFn = (item: { key: string; summary: string; status: string }) => ({
        key: item.key,
        summary: item.summary,
      });

      const processed = BatchResultProcessor.process(results, filterFn);

      expect(processed.successful).toEqual([
        { issueKey: 'PROJ-1', data: { key: 'PROJ-1', summary: 'Task 1' } },
        { issueKey: 'PROJ-2', data: { key: 'PROJ-2', summary: 'Task 2' } },
      ]);
    });

    it('должен обработать пустой value как ошибку', () => {
      const results: BatchResult<{ key: string } | undefined> = [
        {
          status: 'fulfilled',
          issueKey: 'PROJ-1',
          value: undefined,
        },
      ];

      const processed = BatchResultProcessor.process(results);

      expect(processed.successful).toEqual([]);
      expect(processed.failed).toEqual([
        { issueKey: 'PROJ-1', error: 'Задача не найдена (пустой результат)' },
      ]);
    });

    it('должен обработать null value как ошибку', () => {
      const results: BatchResult<{ key: string } | null> = [
        {
          status: 'fulfilled',
          issueKey: 'PROJ-1',
          value: null,
        },
      ];

      const processed = BatchResultProcessor.process(results);

      expect(processed.successful).toEqual([]);
      expect(processed.failed).toEqual([
        { issueKey: 'PROJ-1', error: 'Задача не найдена (пустой результат)' },
      ]);
    });

    it('должен преобразовать не-Error reason в строку', () => {
      const results: BatchResult<{ key: string }> = [
        {
          status: 'rejected',
          issueKey: 'PROJ-1',
          reason: 'String error' as unknown as Error,
        },
      ];

      const processed = BatchResultProcessor.process(results);

      expect(processed.failed).toEqual([{ issueKey: 'PROJ-1', error: 'String error' }]);
    });

    it('должен обрабатывать большой объём данных', () => {
      const results: BatchResult<{ key: string }> = Array.from({ length: 100 }, (_, i) => ({
        status: 'fulfilled' as const,
        issueKey: `PROJ-${i + 1}`,
        value: { key: `PROJ-${i + 1}` },
      }));

      const processed = BatchResultProcessor.process(results);

      expect(processed.successful).toHaveLength(100);
      expect(processed.failed).toHaveLength(0);
    });
  });
});
