import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Container } from 'inversify';
import { YandexTrackerFacade } from '#tracker_api/facade/yandex-tracker.facade.js';
import type { PingResult } from '#tracker_api/api_operations/user/ping.operation.js';
import type { BatchIssueResult } from '#tracker_api/api_operations/issue/get-issues.operation.js';
import type { FindIssuesResult } from '#tracker_api/api_operations/issue/find/index.js';
import type { User } from '#tracker_api/entities/user.entity.js';
import type { Issue, IssueWithUnknownFields } from '#tracker_api/entities/issue.entity.js';
import type { Queue } from '#tracker_api/entities/queue.entity.js';
import type { Status } from '#tracker_api/entities/status.entity.js';
import type {
  FindIssuesInputDto,
  CreateIssueDto,
  UpdateIssueDto,
  ExecuteTransitionDto,
  AddWorklogInput,
  UpdateWorklogInput,
  CreateFieldDto,
  UpdateFieldDto,
  FieldOutput,
  FieldsListOutput,
  GetBoardsDto,
  GetBoardDto,
  CreateBoardDto,
  UpdateBoardDto,
  BoardOutput,
  BoardsListOutput,
  GetSprintsDto,
  GetSprintDto,
  CreateSprintDto,
  UpdateSprintDto,
  SprintOutput,
  SprintsListOutput,
} from '#tracker_api/dto/index.js';
import type {
  ChangelogEntryWithUnknownFields,
  TransitionWithUnknownFields,
  WorklogWithUnknownFields,
} from '#tracker_api/entities/index.js';

describe('YandexTrackerFacade', () => {
  let facade: YandexTrackerFacade;
  let mockContainer: Container;
  let mockPingOperation: { execute: () => Promise<PingResult> };
  let mockGetIssuesOperation: { execute: (keys: string[]) => Promise<BatchIssueResult[]> };
  let mockFindIssuesOperation: {
    execute: (params: FindIssuesInputDto) => Promise<FindIssuesResult>;
  };
  let mockCreateIssueOperation: {
    execute: (data: CreateIssueDto) => Promise<IssueWithUnknownFields>;
  };
  let mockUpdateIssueOperation: {
    execute: (key: string, data: UpdateIssueDto) => Promise<IssueWithUnknownFields>;
  };
  let mockGetIssueChangelogOperation: {
    execute: (key: string) => Promise<ChangelogEntryWithUnknownFields[]>;
  };
  let mockGetIssueTransitionsOperation: {
    execute: (key: string) => Promise<TransitionWithUnknownFields[]>;
  };
  let mockTransitionIssueOperation: {
    execute: (
      key: string,
      id: string,
      data?: ExecuteTransitionDto
    ) => Promise<IssueWithUnknownFields>;
  };
  let mockGetWorklogsOperation: {
    execute: (id: string) => Promise<WorklogWithUnknownFields[]>;
  };
  let mockAddWorklogOperation: {
    execute: (id: string, data: AddWorklogInput) => Promise<WorklogWithUnknownFields>;
  };
  let mockUpdateWorklogOperation: {
    execute: (
      id: string,
      wId: string,
      data: UpdateWorklogInput
    ) => Promise<WorklogWithUnknownFields>;
  };
  let mockDeleteWorklogOperation: {
    execute: (id: string, wId: string) => Promise<void>;
  };
  let mockGetFieldsOperation: {
    execute: () => Promise<FieldsListOutput>;
  };
  let mockGetFieldOperation: {
    execute: (id: string) => Promise<FieldOutput>;
  };
  let mockCreateFieldOperation: {
    execute: (input: CreateFieldDto) => Promise<FieldOutput>;
  };
  let mockUpdateFieldOperation: {
    execute: (id: string, input: UpdateFieldDto) => Promise<FieldOutput>;
  };
  let mockDeleteFieldOperation: {
    execute: (id: string) => Promise<void>;
  };
  let mockGetBoardsOperation: {
    execute: (params?: GetBoardsDto) => Promise<BoardsListOutput>;
  };
  let mockGetBoardOperation: {
    execute: (params: GetBoardDto) => Promise<BoardOutput>;
  };
  let mockCreateBoardOperation: {
    execute: (input: CreateBoardDto) => Promise<BoardOutput>;
  };
  let mockUpdateBoardOperation: {
    execute: (input: UpdateBoardDto) => Promise<BoardOutput>;
  };
  let mockDeleteBoardOperation: {
    execute: (params: { boardId: string }) => Promise<void>;
  };
  let mockGetSprintsOperation: {
    execute: (params: GetSprintsDto) => Promise<SprintsListOutput>;
  };
  let mockGetSprintOperation: {
    execute: (params: GetSprintDto) => Promise<SprintOutput>;
  };
  let mockCreateSprintOperation: {
    execute: (input: CreateSprintDto) => Promise<SprintOutput>;
  };
  let mockUpdateSprintOperation: {
    execute: (input: UpdateSprintDto) => Promise<SprintOutput>;
  };

  beforeEach(() => {
    // Mock PingOperation
    mockPingOperation = {
      execute: vi.fn(),
    };

    // Mock GetIssuesOperation
    mockGetIssuesOperation = {
      execute: vi.fn(),
    };

    // Mock FindIssuesOperation
    mockFindIssuesOperation = {
      execute: vi.fn(),
    };

    // Mock CreateIssueOperation
    mockCreateIssueOperation = {
      execute: vi.fn(),
    };

    // Mock UpdateIssueOperation
    mockUpdateIssueOperation = {
      execute: vi.fn(),
    };

    // Mock GetIssueChangelogOperation
    mockGetIssueChangelogOperation = {
      execute: vi.fn(),
    };

    // Mock GetIssueTransitionsOperation
    mockGetIssueTransitionsOperation = {
      execute: vi.fn(),
    };

    // Mock TransitionIssueOperation
    mockTransitionIssueOperation = {
      execute: vi.fn(),
    };

    // Mock Worklog Operations
    mockGetWorklogsOperation = {
      execute: vi.fn(),
    };
    mockAddWorklogOperation = {
      execute: vi.fn(),
    };
    mockUpdateWorklogOperation = {
      execute: vi.fn(),
    };
    mockDeleteWorklogOperation = {
      execute: vi.fn(),
    };

    // Mock Field Operations
    mockGetFieldsOperation = {
      execute: vi.fn(),
    };
    mockGetFieldOperation = {
      execute: vi.fn(),
    };
    mockCreateFieldOperation = {
      execute: vi.fn(),
    };
    mockUpdateFieldOperation = {
      execute: vi.fn(),
    };
    mockDeleteFieldOperation = {
      execute: vi.fn(),
    };

    // Mock Board Operations
    mockGetBoardsOperation = {
      execute: vi.fn(),
    };
    mockGetBoardOperation = {
      execute: vi.fn(),
    };
    mockCreateBoardOperation = {
      execute: vi.fn(),
    };
    mockUpdateBoardOperation = {
      execute: vi.fn(),
    };
    mockDeleteBoardOperation = {
      execute: vi.fn(),
    };

    // Mock Sprint Operations
    mockGetSprintsOperation = {
      execute: vi.fn(),
    };
    mockGetSprintOperation = {
      execute: vi.fn(),
    };
    mockCreateSprintOperation = {
      execute: vi.fn(),
    };
    mockUpdateSprintOperation = {
      execute: vi.fn(),
    };

    // Mock InversifyJS Container
    mockContainer = {
      get: vi.fn((symbol: symbol) => {
        if (symbol === Symbol.for('PingOperation')) {
          return mockPingOperation;
        }
        if (symbol === Symbol.for('GetIssuesOperation')) {
          return mockGetIssuesOperation;
        }
        if (symbol === Symbol.for('FindIssuesOperation')) {
          return mockFindIssuesOperation;
        }
        if (symbol === Symbol.for('CreateIssueOperation')) {
          return mockCreateIssueOperation;
        }
        if (symbol === Symbol.for('UpdateIssueOperation')) {
          return mockUpdateIssueOperation;
        }
        if (symbol === Symbol.for('GetIssueChangelogOperation')) {
          return mockGetIssueChangelogOperation;
        }
        if (symbol === Symbol.for('GetIssueTransitionsOperation')) {
          return mockGetIssueTransitionsOperation;
        }
        if (symbol === Symbol.for('TransitionIssueOperation')) {
          return mockTransitionIssueOperation;
        }
        // Worklog Operations
        if (symbol === Symbol.for('GetWorklogsOperation')) {
          return mockGetWorklogsOperation;
        }
        if (symbol === Symbol.for('AddWorklogOperation')) {
          return mockAddWorklogOperation;
        }
        if (symbol === Symbol.for('UpdateWorklogOperation')) {
          return mockUpdateWorklogOperation;
        }
        if (symbol === Symbol.for('DeleteWorklogOperation')) {
          return mockDeleteWorklogOperation;
        }
        // Field Operations
        if (symbol === Symbol.for('GetFieldsOperation')) {
          return mockGetFieldsOperation;
        }
        if (symbol === Symbol.for('GetFieldOperation')) {
          return mockGetFieldOperation;
        }
        if (symbol === Symbol.for('CreateFieldOperation')) {
          return mockCreateFieldOperation;
        }
        if (symbol === Symbol.for('UpdateFieldOperation')) {
          return mockUpdateFieldOperation;
        }
        if (symbol === Symbol.for('DeleteFieldOperation')) {
          return mockDeleteFieldOperation;
        }
        // Board Operations
        if (symbol === Symbol.for('GetBoardsOperation')) {
          return mockGetBoardsOperation;
        }
        if (symbol === Symbol.for('GetBoardOperation')) {
          return mockGetBoardOperation;
        }
        if (symbol === Symbol.for('CreateBoardOperation')) {
          return mockCreateBoardOperation;
        }
        if (symbol === Symbol.for('UpdateBoardOperation')) {
          return mockUpdateBoardOperation;
        }
        if (symbol === Symbol.for('DeleteBoardOperation')) {
          return mockDeleteBoardOperation;
        }
        // Sprint Operations
        if (symbol === Symbol.for('GetSprintsOperation')) {
          return mockGetSprintsOperation;
        }
        if (symbol === Symbol.for('GetSprintOperation')) {
          return mockGetSprintOperation;
        }
        if (symbol === Symbol.for('CreateSprintOperation')) {
          return mockCreateSprintOperation;
        }
        if (symbol === Symbol.for('UpdateSprintOperation')) {
          return mockUpdateSprintOperation;
        }
        throw new Error(`Unknown symbol: ${symbol.toString()}`);
      }),
    } as unknown as Container;

    facade = new YandexTrackerFacade(mockContainer);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('ping', () => {
    it('должна успешно вызвать операцию ping', async () => {
      // Arrange
      const pingResult: PingResult = {
        success: true,
        message: `Успешно подключено к API Яндекс.Трекера. Текущий пользователь: Test User (testuser)`,
      };

      vi.mocked(mockPingOperation.execute).mockResolvedValue(pingResult);

      // Act
      const result: PingResult = await facade.ping();

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('Test User');
      expect(mockPingOperation.execute).toHaveBeenCalledOnce();
      expect(mockContainer.get).toHaveBeenCalledWith(Symbol.for('PingOperation'));
    });

    it('должна делегировать обработку ошибок операции ping', async () => {
      // Arrange
      const pingResult: PingResult = {
        success: false,
        message: 'Ошибка подключения к API Яндекс.Трекера',
      };

      vi.mocked(mockPingOperation.execute).mockResolvedValue(pingResult);

      // Act
      const result: PingResult = await facade.ping();

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Ошибка подключения');
      expect(mockPingOperation.execute).toHaveBeenCalledOnce();
    });
  });

  describe('getIssues', () => {
    it('должна успешно получить несколько задач', async () => {
      // Arrange
      const issueKeys = ['TEST-1', 'TEST-2'];

      const mockQueue: Queue = {
        id: '1',
        key: 'TEST',
        name: 'Test Queue',
      };

      const mockStatus: Status = {
        id: '1',
        key: 'open',
        display: 'Open',
      };

      const mockUser: User = {
        uid: '123',
        display: 'Test User',
        login: 'testuser',
        isActive: true,
      };

      const mockIssue1: Issue = {
        id: '1',
        key: 'TEST-1',
        summary: 'Test Issue 1',
        queue: mockQueue,
        status: mockStatus,
        createdBy: mockUser,
        createdAt: '2023-01-01T00:00:00.000+0000',
        updatedAt: '2023-01-01T00:00:00.000+0000',
      };

      const mockIssue2: Issue = {
        id: '2',
        key: 'TEST-2',
        summary: 'Test Issue 2',
        queue: mockQueue,
        status: mockStatus,
        createdBy: mockUser,
        createdAt: '2023-01-02T00:00:00.000+0000',
        updatedAt: '2023-01-02T00:00:00.000+0000',
      };

      const batchResults: BatchIssueResult[] = [
        {
          status: 'fulfilled',
          value: mockIssue1 as IssueWithUnknownFields,
          key: 'ISSUE-1',
          index: 0,
        },
        {
          status: 'fulfilled',
          value: mockIssue2 as IssueWithUnknownFields,
          key: 'ISSUE-2',
          index: 1,
        },
      ];

      vi.mocked(mockGetIssuesOperation.execute).mockResolvedValue(batchResults);

      // Act
      const results: BatchIssueResult[] = await facade.getIssues(issueKeys);

      // Assert
      expect(results).toHaveLength(2);
      expect(results[0]!.status).toBe('fulfilled');
      expect(results[1]!.status).toBe('fulfilled');

      if (results[0]!.status === 'fulfilled') {
        expect(results[0]!.value.key).toBe('TEST-1');
      }
      if (results[1]!.status === 'fulfilled') {
        expect(results[1]!.value.key).toBe('TEST-2');
      }

      expect(mockGetIssuesOperation.execute).toHaveBeenCalledWith(issueKeys);
      expect(mockContainer.get).toHaveBeenCalledWith(Symbol.for('GetIssuesOperation'));
    });

    it('должна обработать частичные ошибки при получении задач', async () => {
      // Arrange
      const issueKeys = ['TEST-1', 'INVALID'];

      const mockQueue: Queue = {
        id: '1',
        key: 'TEST',
        name: 'Test Queue',
      };

      const mockStatus: Status = {
        id: '1',
        key: 'open',
        display: 'Open',
      };

      const mockUser: User = {
        uid: '123',
        display: 'Test User',
        login: 'testuser',
        isActive: true,
      };

      const mockIssue: Issue = {
        id: '1',
        key: 'TEST-1',
        summary: 'Test Issue',
        queue: mockQueue,
        status: mockStatus,
        createdBy: mockUser,
        createdAt: '2023-01-01T00:00:00.000+0000',
        updatedAt: '2023-01-01T00:00:00.000+0000',
      };

      const apiError = new Error('Not Found');

      const batchResults: BatchIssueResult[] = [
        {
          status: 'fulfilled',
          value: mockIssue as IssueWithUnknownFields,
          key: 'ISSUE-1',
          index: 0,
        },
        { status: 'rejected', reason: apiError, key: 'ISSUE-2', index: 1 },
      ];

      vi.mocked(mockGetIssuesOperation.execute).mockResolvedValue(batchResults);

      // Act
      const results: BatchIssueResult[] = await facade.getIssues(issueKeys);

      // Assert
      expect(results).toHaveLength(2);
      expect(results[0]!.status).toBe('fulfilled');
      expect(results[1]!.status).toBe('rejected');

      if (results[0]!.status === 'fulfilled') {
        expect(results[0]!.value.key).toBe('TEST-1');
      }
      if (results[1]!.status === 'rejected') {
        expect(results[1]!.reason).toBeInstanceOf(Error);
        expect(results[1]!.reason.message).toBe('Not Found');
      }
    });

    it('должна вернуть пустой массив для пустого списка ключей', async () => {
      // Arrange
      const issueKeys: string[] = [];
      const batchResults: BatchIssueResult[] = [];

      vi.mocked(mockGetIssuesOperation.execute).mockResolvedValue(batchResults);

      // Act
      const results: BatchIssueResult[] = await facade.getIssues(issueKeys);

      // Assert
      expect(results).toHaveLength(0);
      expect(mockGetIssuesOperation.execute).toHaveBeenCalledWith(issueKeys);
    });
  });

  describe('findIssues', () => {
    it('должна вызвать FindIssuesOperation.execute с правильными params', async () => {
      const params: FindIssuesInputDto = { query: 'status: open', perPage: 50 };
      const mockResult: FindIssuesResult = [
        {
          id: '1',
          key: 'TEST-1',
          summary: 'Test',
          queue: { id: '1', key: 'TEST', name: 'Test' },
          status: { id: '1', key: 'open', display: 'Open' },
          createdBy: { uid: '1', display: 'User', login: 'user', isActive: true },
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      vi.mocked(mockFindIssuesOperation.execute).mockResolvedValue(mockResult);

      const result = await facade.findIssues(params);

      expect(mockFindIssuesOperation.execute).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });

    it('должна обрабатывать ошибки от FindIssuesOperation', async () => {
      const params: FindIssuesInputDto = { query: 'invalid' };
      const error = new Error('Find failed');
      vi.mocked(mockFindIssuesOperation.execute).mockRejectedValue(error);

      await expect(facade.findIssues(params)).rejects.toThrow('Find failed');
    });
  });

  describe('createIssue', () => {
    it('должна вызвать CreateIssueOperation.execute с правильными данными', async () => {
      const issueData: CreateIssueDto = { queue: 'TEST', summary: 'New Issue' };
      const mockResult: IssueWithUnknownFields = {
        id: '1',
        key: 'TEST-1',
        summary: 'New Issue',
        queue: { id: '1', key: 'TEST', name: 'Test' },
        status: { id: '1', key: 'open', display: 'Open' },
        createdBy: { uid: '1', display: 'User', login: 'user', isActive: true },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      vi.mocked(mockCreateIssueOperation.execute).mockResolvedValue(mockResult);

      const result = await facade.createIssue(issueData);

      expect(mockCreateIssueOperation.execute).toHaveBeenCalledWith(issueData);
      expect(result).toEqual(mockResult);
    });

    it('должна обрабатывать ошибки от CreateIssueOperation', async () => {
      const issueData: CreateIssueDto = { queue: 'TEST', summary: '' };
      const error = new Error('Create failed');
      vi.mocked(mockCreateIssueOperation.execute).mockRejectedValue(error);

      await expect(facade.createIssue(issueData)).rejects.toThrow('Create failed');
    });
  });

  describe('updateIssue', () => {
    it('должна вызвать UpdateIssueOperation.execute с правильными параметрами', async () => {
      const issueKey = 'TEST-123';
      const updateData: UpdateIssueDto = { summary: 'Updated' };
      const mockResult: IssueWithUnknownFields = {
        id: '1',
        key: 'TEST-123',
        summary: 'Updated',
        queue: { id: '1', key: 'TEST', name: 'Test' },
        status: { id: '1', key: 'open', display: 'Open' },
        createdBy: { uid: '1', display: 'User', login: 'user', isActive: true },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      };

      vi.mocked(mockUpdateIssueOperation.execute).mockResolvedValue(mockResult);

      const result = await facade.updateIssue(issueKey, updateData);

      expect(mockUpdateIssueOperation.execute).toHaveBeenCalledWith(issueKey, updateData);
      expect(result).toEqual(mockResult);
    });

    it('должна обрабатывать ошибки от UpdateIssueOperation', async () => {
      const issueKey = 'TEST-123';
      const updateData: UpdateIssueDto = { summary: '' };
      const error = new Error('Update failed');
      vi.mocked(mockUpdateIssueOperation.execute).mockRejectedValue(error);

      await expect(facade.updateIssue(issueKey, updateData)).rejects.toThrow('Update failed');
    });
  });

  describe('getIssueChangelog', () => {
    it('должна вызвать GetIssueChangelogOperation.execute с правильным ключом', async () => {
      const issueKey = 'TEST-123';
      const mockResult: ChangelogEntryWithUnknownFields[] = [
        {
          id: '1',
          self: 'https://api.tracker.yandex.net/v3/issues/TEST-123/changelog/1',
          issue: { id: '123', key: 'TEST-123', display: 'Test Issue' },
          updatedAt: '2024-01-01',
          updatedBy: { uid: '1', display: 'User', login: 'user', isActive: true },
          type: 'IssueUpdated',
          fields: [],
        },
      ];

      vi.mocked(mockGetIssueChangelogOperation.execute).mockResolvedValue(mockResult);

      const result = await facade.getIssueChangelog(issueKey);

      expect(mockGetIssueChangelogOperation.execute).toHaveBeenCalledWith(issueKey);
      expect(result).toEqual(mockResult);
    });

    it('должна обрабатывать ошибки от GetIssueChangelogOperation', async () => {
      const issueKey = 'TEST-123';
      const error = new Error('Changelog failed');
      vi.mocked(mockGetIssueChangelogOperation.execute).mockRejectedValue(error);

      await expect(facade.getIssueChangelog(issueKey)).rejects.toThrow('Changelog failed');
    });
  });

  describe('getIssueTransitions', () => {
    it('должна вызвать GetIssueTransitionsOperation.execute с правильным ключом', async () => {
      const issueKey = 'TEST-123';
      const mockResult: TransitionWithUnknownFields[] = [
        {
          id: 'trans1',
          self: 'https://api.tracker.yandex.net/v3/issues/TEST-123/transitions/trans1',
          to: { id: '2', key: 'inProgress', display: 'In Progress' },
        },
      ];

      vi.mocked(mockGetIssueTransitionsOperation.execute).mockResolvedValue(mockResult);

      const result = await facade.getIssueTransitions(issueKey);

      expect(mockGetIssueTransitionsOperation.execute).toHaveBeenCalledWith(issueKey);
      expect(result).toEqual(mockResult);
    });

    it('должна обрабатывать ошибки от GetIssueTransitionsOperation', async () => {
      const issueKey = 'TEST-123';
      const error = new Error('Transitions failed');
      vi.mocked(mockGetIssueTransitionsOperation.execute).mockRejectedValue(error);

      await expect(facade.getIssueTransitions(issueKey)).rejects.toThrow('Transitions failed');
    });
  });

  describe('transitionIssue', () => {
    it('должна вызвать TransitionIssueOperation.execute с правильными параметрами', async () => {
      const issueKey = 'TEST-123';
      const transitionId = 'trans1';
      const transitionData: ExecuteTransitionDto = { comment: 'Moving' };
      const mockResult: IssueWithUnknownFields = {
        id: '1',
        key: 'TEST-123',
        summary: 'Test',
        queue: { id: '1', key: 'TEST', name: 'Test' },
        status: { id: '2', key: 'inProgress', display: 'In Progress' },
        createdBy: { uid: '1', display: 'User', login: 'user', isActive: true },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      };

      vi.mocked(mockTransitionIssueOperation.execute).mockResolvedValue(mockResult);

      const result = await facade.transitionIssue(issueKey, transitionId, transitionData);

      expect(mockTransitionIssueOperation.execute).toHaveBeenCalledWith(
        issueKey,
        transitionId,
        transitionData
      );
      expect(result).toEqual(mockResult);
    });

    it('должна обрабатывать ошибки от TransitionIssueOperation', async () => {
      const issueKey = 'TEST-123';
      const transitionId = 'trans1';
      const error = new Error('Transition failed');
      vi.mocked(mockTransitionIssueOperation.execute).mockRejectedValue(error);

      await expect(facade.transitionIssue(issueKey, transitionId)).rejects.toThrow(
        'Transition failed'
      );
    });
  });

  describe('constructor', () => {
    it('должна правильно инициализировать фасад с контейнером', () => {
      // Act - создание нового экземпляра
      const newFacade = new YandexTrackerFacade(mockContainer);

      // Assert - проверяем, что можем вызвать методы
      expect(newFacade.ping).toBeDefined();
      expect(newFacade.getIssues).toBeDefined();
      expect(typeof newFacade.ping).toBe('function');
      expect(typeof newFacade.getIssues).toBe('function');
    });
  });

  describe('Worklog methods', () => {
    describe('getWorklogs', () => {
      it('должна вызвать GetWorklogsOperation.execute с правильным issueId', async () => {
        const issueId = 'TEST-1';
        const mockResult: WorklogWithUnknownFields[] = [
          {
            id: '1',
            self: 'https://api.tracker.yandex.net/v3/issues/TEST-1/worklog/1',
            issue: { id: '1', key: 'TEST-1', display: 'Test Issue' },
            createdBy: { uid: '1', display: 'User', login: 'user', isActive: true },
            createdAt: '2024-01-01',
            duration: 'PT1H',
          },
        ];

        vi.mocked(mockGetWorklogsOperation.execute).mockResolvedValue(mockResult);

        const result = await facade.getWorklogs(issueId);

        expect(mockGetWorklogsOperation.execute).toHaveBeenCalledWith(issueId);
        expect(result).toEqual(mockResult);
      });
    });

    describe('addWorklog', () => {
      it('должна вызвать AddWorklogOperation.execute с правильными параметрами', async () => {
        const issueId = 'TEST-1';
        const input: AddWorklogInput = { duration: 'PT1H', comment: 'Work done' };
        const mockResult: WorklogWithUnknownFields = {
          id: '1',
          self: 'https://api.tracker.yandex.net/v3/issues/TEST-1/worklog/1',
          issue: { id: '1', key: 'TEST-1', display: 'Test Issue' },
          createdBy: { uid: '1', display: 'User', login: 'user', isActive: true },
          createdAt: '2024-01-01',
          duration: 'PT1H',
        };

        vi.mocked(mockAddWorklogOperation.execute).mockResolvedValue(mockResult);

        const result = await facade.addWorklog(issueId, input);

        expect(mockAddWorklogOperation.execute).toHaveBeenCalledWith(issueId, input);
        expect(result).toEqual(mockResult);
      });
    });

    describe('updateWorklog', () => {
      it('должна вызвать UpdateWorklogOperation.execute с правильными параметрами', async () => {
        const issueId = 'TEST-1';
        const worklogId = '123';
        const input: UpdateWorklogInput = { duration: 'PT2H' };
        const mockResult: WorklogWithUnknownFields = {
          id: '123',
          self: 'https://api.tracker.yandex.net/v3/issues/TEST-1/worklog/123',
          issue: { id: '1', key: 'TEST-1', display: 'Test Issue' },
          createdBy: { uid: '1', display: 'User', login: 'user', isActive: true },
          createdAt: '2024-01-01',
          duration: 'PT2H',
        };

        vi.mocked(mockUpdateWorklogOperation.execute).mockResolvedValue(mockResult);

        const result = await facade.updateWorklog(issueId, worklogId, input);

        expect(mockUpdateWorklogOperation.execute).toHaveBeenCalledWith(issueId, worklogId, input);
        expect(result).toEqual(mockResult);
      });
    });

    describe('deleteWorklog', () => {
      it('должна вызвать DeleteWorklogOperation.execute с правильными параметрами', async () => {
        const issueId = 'TEST-1';
        const worklogId = '123';

        vi.mocked(mockDeleteWorklogOperation.execute).mockResolvedValue(undefined);

        await facade.deleteWorklog(issueId, worklogId);

        expect(mockDeleteWorklogOperation.execute).toHaveBeenCalledWith(issueId, worklogId);
      });
    });
  });

  describe('Field methods', () => {
    describe('getFields', () => {
      it('должна вызвать GetFieldsOperation.execute', async () => {
        const mockResult: FieldsListOutput = [
          {
            id: 'field1',
            self: 'https://api.tracker.yandex.net/v3/fields/field1',
            key: 'field1',
            name: 'Field 1',
          },
        ];

        vi.mocked(mockGetFieldsOperation.execute).mockResolvedValue(mockResult);

        const result = await facade.getFields();

        expect(mockGetFieldsOperation.execute).toHaveBeenCalled();
        expect(result).toEqual(mockResult);
      });
    });

    describe('getField', () => {
      it('должна вызвать GetFieldOperation.execute с правильным fieldId', async () => {
        const fieldId = 'customField123';
        const mockResult: FieldOutput = {
          id: 'customField123',
          self: 'https://api.tracker.yandex.net/v3/fields/customField123',
          key: 'customField123',
          name: 'Custom Field',
        };

        vi.mocked(mockGetFieldOperation.execute).mockResolvedValue(mockResult);

        const result = await facade.getField(fieldId);

        expect(mockGetFieldOperation.execute).toHaveBeenCalledWith(fieldId);
        expect(result).toEqual(mockResult);
      });
    });

    describe('createField', () => {
      it('должна вызвать CreateFieldOperation.execute с правильными данными', async () => {
        const input: CreateFieldDto = { name: 'Custom Field', type: 'string' };
        const mockResult: FieldOutput = {
          id: 'newField',
          self: 'https://api.tracker.yandex.net/v3/fields/newField',
          key: 'newField',
          name: 'Custom Field',
        };

        vi.mocked(mockCreateFieldOperation.execute).mockResolvedValue(mockResult);

        const result = await facade.createField(input);

        expect(mockCreateFieldOperation.execute).toHaveBeenCalledWith(input);
        expect(result).toEqual(mockResult);
      });
    });

    describe('updateField', () => {
      it('должна вызвать UpdateFieldOperation.execute с правильными параметрами', async () => {
        const fieldId = 'customField123';
        const input: UpdateFieldDto = { name: 'Updated Field' };
        const mockResult: FieldOutput = {
          id: 'customField123',
          self: 'https://api.tracker.yandex.net/v3/fields/customField123',
          key: 'customField123',
          name: 'Updated Field',
        };

        vi.mocked(mockUpdateFieldOperation.execute).mockResolvedValue(mockResult);

        const result = await facade.updateField(fieldId, input);

        expect(mockUpdateFieldOperation.execute).toHaveBeenCalledWith(fieldId, input);
        expect(result).toEqual(mockResult);
      });
    });

    describe('deleteField', () => {
      it('должна вызвать DeleteFieldOperation.execute с правильным fieldId', async () => {
        const fieldId = 'customField123';

        vi.mocked(mockDeleteFieldOperation.execute).mockResolvedValue(undefined);

        await facade.deleteField(fieldId);

        expect(mockDeleteFieldOperation.execute).toHaveBeenCalledWith(fieldId);
      });
    });
  });

  describe('Board methods', () => {
    describe('getBoards', () => {
      it('должна вызвать GetBoardsOperation.execute без параметров', async () => {
        const mockResult: BoardsListOutput = [
          {
            id: '1',
            self: 'https://api.tracker.yandex.net/v3/boards/1',
            name: 'Board 1',
          },
        ];

        vi.mocked(mockGetBoardsOperation.execute).mockResolvedValue(mockResult);

        const result = await facade.getBoards();

        expect(mockGetBoardsOperation.execute).toHaveBeenCalledWith(undefined);
        expect(result).toEqual(mockResult);
      });

      it('должна вызвать GetBoardsOperation.execute с параметрами', async () => {
        const params: GetBoardsDto = { filter: 'active' };
        const mockResult: BoardsListOutput = [
          {
            id: '1',
            self: 'https://api.tracker.yandex.net/v3/boards/1',
            name: 'Active Board',
          },
        ];

        vi.mocked(mockGetBoardsOperation.execute).mockResolvedValue(mockResult);

        const result = await facade.getBoards(params);

        expect(mockGetBoardsOperation.execute).toHaveBeenCalledWith(params);
        expect(result).toEqual(mockResult);
      });
    });

    describe('getBoard', () => {
      it('должна вызвать GetBoardOperation.execute с boardId', async () => {
        const boardId = '1';
        const mockResult: BoardOutput = {
          id: '1',
          self: 'https://api.tracker.yandex.net/v3/boards/1',
          name: 'Sprint Board',
        };

        vi.mocked(mockGetBoardOperation.execute).mockResolvedValue(mockResult);

        const result = await facade.getBoard(boardId);

        expect(mockGetBoardOperation.execute).toHaveBeenCalledWith({ boardId });
        expect(result).toEqual(mockResult);
      });

      it('должна вызвать GetBoardOperation.execute с boardId и params', async () => {
        const boardId = '1';
        const params = { localized: true };
        const mockResult: BoardOutput = {
          id: '1',
          self: 'https://api.tracker.yandex.net/v3/boards/1',
          name: 'Sprint Board',
        };

        vi.mocked(mockGetBoardOperation.execute).mockResolvedValue(mockResult);

        const result = await facade.getBoard(boardId, params);

        expect(mockGetBoardOperation.execute).toHaveBeenCalledWith({ boardId, ...params });
        expect(result).toEqual(mockResult);
      });
    });

    describe('createBoard', () => {
      it('должна вызвать CreateBoardOperation.execute с правильными данными', async () => {
        const input: CreateBoardDto = { name: 'Sprint Board', filter: { query: 'status: open' } };
        const mockResult: BoardOutput = {
          id: '1',
          self: 'https://api.tracker.yandex.net/v3/boards/1',
          name: 'Sprint Board',
        };

        vi.mocked(mockCreateBoardOperation.execute).mockResolvedValue(mockResult);

        const result = await facade.createBoard(input);

        expect(mockCreateBoardOperation.execute).toHaveBeenCalledWith(input);
        expect(result).toEqual(mockResult);
      });
    });

    describe('updateBoard', () => {
      it('должна вызвать UpdateBoardOperation.execute с правильными параметрами', async () => {
        const boardId = '1';
        const input = { name: 'Updated Board' };
        const mockResult: BoardOutput = {
          id: '1',
          self: 'https://api.tracker.yandex.net/v3/boards/1',
          name: 'Updated Board',
        };

        vi.mocked(mockUpdateBoardOperation.execute).mockResolvedValue(mockResult);

        const result = await facade.updateBoard(boardId, input);

        expect(mockUpdateBoardOperation.execute).toHaveBeenCalledWith({ boardId, ...input });
        expect(result).toEqual(mockResult);
      });
    });

    describe('deleteBoard', () => {
      it('должна вызвать DeleteBoardOperation.execute с правильным boardId', async () => {
        const boardId = '1';

        vi.mocked(mockDeleteBoardOperation.execute).mockResolvedValue(undefined);

        await facade.deleteBoard(boardId);

        expect(mockDeleteBoardOperation.execute).toHaveBeenCalledWith({ boardId });
      });
    });
  });

  describe('Sprint methods', () => {
    describe('getSprints', () => {
      it('должна вызвать GetSprintsOperation.execute с boardId', async () => {
        const boardId = '1';
        const mockResult: SprintsListOutput = [
          {
            id: '10',
            self: 'https://api.tracker.yandex.net/v3/sprints/10',
            name: 'Sprint 1',
          },
        ];

        vi.mocked(mockGetSprintsOperation.execute).mockResolvedValue(mockResult);

        const result = await facade.getSprints(boardId);

        expect(mockGetSprintsOperation.execute).toHaveBeenCalledWith({ boardId });
        expect(result).toEqual(mockResult);
      });
    });

    describe('getSprint', () => {
      it('должна вызвать GetSprintOperation.execute с sprintId', async () => {
        const sprintId = '10';
        const mockResult: SprintOutput = {
          id: '10',
          self: 'https://api.tracker.yandex.net/v3/sprints/10',
          name: 'Sprint 1',
        };

        vi.mocked(mockGetSprintOperation.execute).mockResolvedValue(mockResult);

        const result = await facade.getSprint(sprintId);

        expect(mockGetSprintOperation.execute).toHaveBeenCalledWith({ sprintId });
        expect(result).toEqual(mockResult);
      });
    });

    describe('createSprint', () => {
      it('должна вызвать CreateSprintOperation.execute с правильными данными', async () => {
        const input: CreateSprintDto = {
          name: 'Sprint 1',
          boardId: '1',
          startDate: '2024-01-01',
          endDate: '2024-01-14',
        };
        const mockResult: SprintOutput = {
          id: '10',
          self: 'https://api.tracker.yandex.net/v3/sprints/10',
          name: 'Sprint 1',
        };

        vi.mocked(mockCreateSprintOperation.execute).mockResolvedValue(mockResult);

        const result = await facade.createSprint(input);

        expect(mockCreateSprintOperation.execute).toHaveBeenCalledWith(input);
        expect(result).toEqual(mockResult);
      });
    });

    describe('updateSprint', () => {
      it('должна вызвать UpdateSprintOperation.execute с правильными параметрами', async () => {
        const sprintId = '10';
        const input = { name: 'Sprint 1 Updated' };
        const mockResult: SprintOutput = {
          id: '10',
          self: 'https://api.tracker.yandex.net/v3/sprints/10',
          name: 'Sprint 1 Updated',
        };

        vi.mocked(mockUpdateSprintOperation.execute).mockResolvedValue(mockResult);

        const result = await facade.updateSprint(sprintId, input);

        expect(mockUpdateSprintOperation.execute).toHaveBeenCalledWith({ sprintId, ...input });
        expect(result).toEqual(mockResult);
      });
    });
  });
});
