# Continuation Prompt: Улучшение покрытия тестами

## Текущая ситуация

**Дата обновления:** 2025-11-16
**Ветка:** `claude/review-continuation-prompt-stage-01Te4nRpVYo8oTKdWPGzJvij`

### Текущее покрытие (2025-11-16)

```
Lines:      60.86% (было 46.01%, +14.85%)
Functions:  69.92% (было 53.82%, +16.10%)
Statements: 60.83% (было 46.18%, +14.65%)
Branches:   56.26% (было 43.11%, +13.15%)
```

### Цели финального этапа

**Минимальные цели (MUST):**
- Lines: 70%+ (нужно +9.14%)
- Functions: 75%+ (нужно +5.08%)
- Statements: 70%+ (нужно +9.17%)
- Branches: 65%+ (нужно +8.74%)

**Идеальные цели (SHOULD):**
- Lines: 80%+
- Functions: 85%+
- Statements: 80%+
- Branches: 75%+

---

## Выполненные задачи ✅

### Stage 1: Быстрые победы (ЗАВЕРШЁН)

✅ **API Operations tests** - 6 operations покрыты на 90-100%
- changelog.operation.test.ts (100%)
- create.operation.test.ts (100%)
- find.operation.test.ts (90.62%)
- update.operation.test.ts (100%)
- get-transitions.operation.test.ts (100%)
- execute-transition.operation.test.ts (100%)

✅ **YandexTrackerFacade tests** - 100% покрытие (18 тестов)

✅ **HTTP Client tests** - 16 тестов, все основные сценарии

### Stage 2: MCP Tools (ЧАСТИЧНО ВЫПОЛНЕН)

✅ **MCP Tools tests** - 7 из 8 tools покрыты:
- GetIssuesTool (9 тестов) ✅
- FindIssuesTool (24 теста) ✅
- CreateIssueTool (16 тестов) ✅
- UpdateIssueTool (12 тестов) ✅
- GetIssueChangelogTool (10 тестов) ✅
- GetIssueTransitionsTool (10 тестов) ✅
- TransitionIssueTool (13 тестов) ✅

✅ **Composition Root tests** - Container tests (100% покрытие)

### Stage 3: Search Strategies (ЧАСТИЧНО ВЫПОЛНЕН)

✅ **Search Strategy tests** - 4 из 5 strategies покрыты:
- CategorySearchStrategy (19 тестов) ✅
- FuzzySearchStrategy (тесты есть) ✅
- NameSearchStrategy (тесты есть) ✅
- DescriptionSearchStrategy (17 тестов) ✅

---

## Оставшиеся задачи

### Приоритет 1: КРИТИЧНО для достижения минимальных целей (+9% покрытия)

#### 1.1. SearchToolsTool tests (+3% покрытия)

**Проблема:** SearchToolsTool покрыт только на 19.04%, но это критичный helper tool

**Файл:** `tests/unit/mcp/tools/helpers/search/search-tools.tool.test.ts`
**Тестируемый:** `src/mcp/tools/helpers/search/search-tools.tool.ts`

**ВАЖНО:** Уже есть integration тесты (25 tests), нужны unit тесты для покрытия.

**Тесты:**
1. ✅ **Validation**
   - should validate query parameter (required, non-empty string)
   - should validate limit parameter (positive integer, max 50)
   - should use default limit if not provided

2. ✅ **Search functionality**
   - should use SearchEngine to find tools
   - should return ranked results sorted by score
   - should limit results based on limit parameter
   - should include tool metadata in results (name, category, description)
   - should handle empty query gracefully
   - should handle no results found

3. ✅ **Caching**
   - should use LRU cache for repeated queries
   - should return cached results for same query
   - should handle cache misses correctly

4. ✅ **Error handling**
   - should handle SearchEngine errors
   - should log search operations

**Шаблон:**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SearchToolsTool } from './search-tools.tool.js';
import type { SearchEngine } from '@mcp/search/engine/search-engine.js';
import type { Logger } from '@infrastructure/logging/logger.js';

describe('SearchToolsTool', () => {
  let tool: SearchToolsTool;
  let mockSearchEngine: SearchEngine;
  let mockLogger: Logger;

  beforeEach(() => {
    mockSearchEngine = {
      search: vi.fn(),
    } as unknown as SearchEngine;

    mockLogger = {
      info: vi.fn(),
      debug: vi.fn(),
      error: vi.fn(),
    } as unknown as Logger;

    tool = new SearchToolsTool(mockSearchEngine, mockLogger);
  });

  describe('Validation', () => {
    it('should require query parameter', async () => {
      const result = await tool.execute({});
      expect(result.isError).toBe(true);
    });

    it('should validate limit parameter', async () => {
      const result = await tool.execute({ query: 'test', limit: -1 });
      expect(result.isError).toBe(true);
    });
  });

  describe('Search functionality', () => {
    it('should call SearchEngine.search with query', async () => {
      const mockResults = [
        { toolName: 'get_issues', score: 0.9, strategyType: 'exact' as const, matchReason: 'exact match' }
      ];
      vi.mocked(mockSearchEngine.search).mockReturnValue(mockResults);

      await tool.execute({ query: 'get issues' });

      expect(mockSearchEngine.search).toHaveBeenCalledWith('get issues');
    });

    it('should limit results based on limit parameter', async () => {
      const mockResults = Array(10).fill(null).map((_, i) => ({
        toolName: `tool_${i}`,
        score: 0.9 - i * 0.1,
        strategyType: 'exact' as const,
        matchReason: 'match'
      }));
      vi.mocked(mockSearchEngine.search).mockReturnValue(mockResults);

      const result = await tool.execute({ query: 'test', limit: 5 });

      const parsed = JSON.parse(result.content[0]?.text || '{}');
      expect(parsed.data.results).toHaveLength(5);
    });
  });
});
```

**Ожидаемое улучшение:** +3% Lines, +2% Functions

---

#### 1.2. Докрыть GetIssuesOperation строки 76-81 (+0.5% покрытия)

**Проблема:** GetIssuesOperation покрыт на 75%, строки 76-81 не покрыты

**Файл:** Расширить `tests/unit/tracker_api/api_operations/issue/get/get-issues.operation.test.ts`

**Что добавить:**
```typescript
describe('GetIssuesOperation - edge cases', () => {
  it('should handle empty issueKeys array', async () => {
    await expect(operation.execute([])).rejects.toThrow();
  });

  it('should handle single issue key', async () => {
    // Test line 76-81: single key path
    const mockResponse = { data: { id: '1', key: 'TEST-1' } };
    vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

    const result = await operation.execute(['TEST-1']);

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('fulfilled');
  });

  it('should handle batch with all successful requests', async () => {
    // Test batch path lines 76-81
    const keys = ['TEST-1', 'TEST-2', 'TEST-3'];
    // ... test batch logic
  });
});
```

**Ожидаемое улучшение:** +0.5% Lines

---

#### 1.3. Докрыть FindIssuesOperation строки 83, 102-103 (+0.3% покрытия)

**Проблема:** FindIssuesOperation покрыт на 90.62%, строки 83, 102-103 не покрыты

**Файл:** Расширить `tests/unit/tracker_api/api_operations/issue/find/find-issues.operation.test.ts`

**Что добавить:**
```typescript
describe('FindIssuesOperation - edge cases', () => {
  it('should handle empty search params', async () => {
    // Test line 83: validation
    await expect(operation.execute({})).rejects.toThrow();
  });

  it('should handle pagination edge cases', async () => {
    // Test lines 102-103: pagination logic
    const params = {
      query: 'status: open',
      page: 999, // Large page number
      perPage: 1
    };
    // ...
  });
});
```

**Ожидаемое улучшение:** +0.3% Lines

---

#### 1.4. Докрыть ResponseFieldFilter строки 58, 84, 92 (+0.5% покрытия)

**Проблема:** ResponseFieldFilter покрыт на 94.11%, строки 58, 84, 92 не покрыты

**Файл:** Расширить `tests/unit/mcp/utils/response-field-filter.test.ts`

**Что добавить:**
```typescript
describe('ResponseFieldFilter - edge cases', () => {
  it('should handle deeply nested fields', () => {
    // Test line 58: deep nesting
    const data = { a: { b: { c: { d: 'value' } } } };
    const result = ResponseFieldFilter.filter(data, ['a.b.c.d']);
    expect(result.a.b.c.d).toBe('value');
  });

  it('should handle array fields', () => {
    // Test line 84: array handling
    const data = { items: [{ id: 1 }, { id: 2 }] };
    const result = ResponseFieldFilter.filter(data, ['items.id']);
    // ...
  });

  it('should handle non-existent fields', () => {
    // Test line 92: non-existent field path
    const data = { a: 'value' };
    const result = ResponseFieldFilter.filter(data, ['b.c.d']);
    expect(result).not.toHaveProperty('a');
  });
});
```

**Ожидаемое улучшение:** +0.5% Lines

---

#### 1.5. Докрыть BaseDefinition строки с requiresExplicitUserConsent (+1% покрытия)

**Проблема:** BaseDefinition покрыт на 36.36%, много строк с обработкой `requiresExplicitUserConsent` флага

**Файл:** Расширить `tests/unit/mcp/tools/base/base-definition.test.ts`

**Что добавить:**
```typescript
describe('BaseDefinition - safety warnings', () => {
  it('should wrap description with safety warning when requiresExplicitUserConsent is true', () => {
    const metadata = {
      ...baseMetadata,
      requiresExplicitUserConsent: true
    };

    const definition = new MockDefinition(metadata, mockLogger).getDefinition();

    expect(definition.description).toContain('⚠️');
    expect(definition.description).toContain('WARNING');
    expect(definition.description).toContain('MODIFIES DATA');
  });

  it('should not wrap description when requiresExplicitUserConsent is false', () => {
    const metadata = {
      ...baseMetadata,
      requiresExplicitUserConsent: false
    };

    const definition = new MockDefinition(metadata, mockLogger).getDefinition();

    expect(definition.description).not.toContain('⚠️');
    expect(definition.description).not.toContain('WARNING');
  });

  it('should add safety examples when requiresExplicitUserConsent is true', () => {
    // Test safety examples logic
  });
});
```

**Ожидаемое улучшение:** +1% Lines, +1.5% Functions

---

### Приоритет 2: Дополнительное покрытие для идеальных целей (+5% покрытия)

#### 2.1. ExactMatchStrategy tests

**Файл:** `tests/unit/mcp/search/strategies/exact-match.strategy.test.ts` (создать новый)
**Тестируемый:** `src/mcp/search/strategies/exact-match.strategy.ts`

**Тесты:**
- should return high score (1.0) for exact name match
- should be case insensitive
- should return 0 for non-exact match
- should handle partial matches (score lower than exact)
- should ignore whitespace differences

**Ожидаемое улучшение:** +0.5%

---

#### 2.2. DTO и Entities tests

**Проблема:** DTOs и Entities покрыты на 0% (но это типы/интерфейсы, низкий приоритет)

**Опционально:** Создать тесты для валидации структуры, но это не даст большого прироста покрытия.

**Ожидаемое улучшение:** +0.5%

---

#### 2.3. Integration тесты - исправить провалы

**Проблема:** 17 integration тестов падают с timeout (5000ms)

**Файлы:**
- `tests/integration/mcp/tools/api/issues/get/get-issues.tool.integration.test.ts` - 8 failed
- `tests/integration/mcp/tools/api/issues/find/find-issues.tool.integration.test.ts` - 9 failed

**Решение:** Skip тесты если нет API токена

```typescript
const hasApiAccess = !!(
  process.env.TRACKER_API_TOKEN &&
  process.env.TRACKER_API_BASE_URL &&
  process.env.TRACKER_API_ORG_ID
);

const describeOrSkip = hasApiAccess ? describe : describe.skip;

describeOrSkip('integration tests', () => {
  // Existing tests
});
```

**Ожидаемое улучшение:** Стабильность CI/CD, 0% coverage (integration не учитываются)

---

## План выполнения

### Быстрый путь к минимальным целям (70% coverage)

**Шаг 1:** SearchToolsTool tests (1-2 часа) → +3% покрытия
**Шаг 2:** GetIssuesOperation edge cases (30 мин) → +0.5%
**Шаг 3:** FindIssuesOperation edge cases (30 мин) → +0.3%
**Шаг 4:** ResponseFieldFilter edge cases (30 мин) → +0.5%
**Шаг 5:** BaseDefinition safety tests (1 час) → +1%
**Шаг 6:** ExactMatchStrategy tests (1 час) → +0.5%

**Итого:** ~5-6 часов работы → 65.86% coverage (близко к минимальным целям)

### Путь к идеальным целям (80% coverage)

**Шаг 7:** Докрыть оставшиеся стратегии поиска → +1%
**Шаг 8:** Исправить integration тесты (skip если нет токена) → стабильность
**Шаг 9:** DTO validation tests (опционально) → +0.5%

**Итого:** ~8-10 часов → 70-75% coverage (превышение минимальных целей)

---

## Полезные команды

```bash
# Запустить unit тесты с coverage
npm run test:unit -- --coverage

# Запустить конкретный тест
npx vitest run tests/unit/path/to/test.test.ts

# Запустить тесты в watch mode
npx vitest tests/unit/path/to/test.test.ts

# Проверить coverage для конкретной директории
npx vitest run tests/unit/mcp/tools/ --coverage

# Полная валидация проекта
npm run validate
```

---

## Критерии успеха

**Минимальные (MUST):**
- ✅ Lines ≥ 70%
- ✅ Functions ≥ 75%
- ✅ Statements ≥ 70%
- ✅ Branches ≥ 65%
- ✅ Все unit тесты проходят
- ✅ Integration тесты не падают (skip если нет API)

**Идеальные (SHOULD):**
- ✅ Lines ≥ 80%
- ✅ Functions ≥ 85%
- ✅ Statements ≥ 80%
- ✅ Branches ≥ 75%

---

## Референсы

**Существующие тесты для reference:**
- `tests/unit/mcp/tools/api/issues/get/get-issues.tool.test.ts` - шаблон для tool tests
- `tests/unit/tracker_api/api_operations/issue/get/get-issues.operation.test.ts` - шаблон для operations
- `tests/unit/mcp/search/strategies/description-search.strategy.test.ts` - шаблон для search strategies

**Документация:**
- `tests/README.md` - руководство по тестированию
- `CLAUDE.md` - правила проекта
- `ARCHITECTURE.md` - архитектура проекта

---

**Последнее обновление:** 2025-11-16
**Автор:** Claude Code
**Статус:** В процессе выполнения
