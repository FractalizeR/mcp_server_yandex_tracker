# Dependency Injection — Примеры использования

Проект использует **InversifyJS v7** с Symbol-based токенами и `defaultScope: 'Singleton'`.

---

## Базовый пример: Извлечение зависимости

```typescript
import { loadConfig } from '@infrastructure/config.js';
import { createContainer, TYPES } from '@composition-root/index.js';
import type { Logger } from '@infrastructure/logging/index.js';
import type { ToolRegistry } from '@mcp/tool-registry.js';

// 1. Загружаем конфигурацию
const config = loadConfig();

// 2. Создаём контейнер (ASYNC!)
const container = await createContainer(config);

// 3. Извлекаем зависимости
const logger = container.get<Logger>(TYPES.Logger);
const toolRegistry = container.get<ToolRegistry>(TYPES.ToolRegistry);

logger.info('Приложение запущено');
```

**Важные детали:**
- `createContainer()` — **async функция**, всегда используй `await`
- Принимает **только config** (Logger создаётся внутри контейнера)
- Все зависимости извлекаются через `container.get<Type>(TYPES.Symbol)`

---

## Unit тесты: Мокирование зависимостей

### Вариант 1: Mock Container с Operations (из yandex-tracker.facade.test.ts)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Container } from 'inversify';
import { YandexTrackerFacade } from '@tracker_api/facade/yandex-tracker.facade.js';
import type { PingOperation } from '@tracker_api/api_operations/user/ping.operation.js';
import type { GetIssuesOperation } from '@tracker_api/api_operations/issue/get-issues.operation.js';

describe('YandexTrackerFacade', () => {
  let facade: YandexTrackerFacade;
  let mockContainer: Container;
  let mockPingOperation: PingOperation;
  let mockGetIssuesOperation: GetIssuesOperation;

  beforeEach(() => {
    // Создаём моки Operations
    mockPingOperation = {
      execute: vi.fn(),
    } as unknown as PingOperation;

    mockGetIssuesOperation = {
      execute: vi.fn(),
    } as unknown as GetIssuesOperation;

    // Создаём мок Container
    mockContainer = {
      get: vi.fn((symbol: symbol) => {
        if (symbol === Symbol.for('PingOperation')) {
          return mockPingOperation;
        }
        if (symbol === Symbol.for('GetIssuesOperation')) {
          return mockGetIssuesOperation;
        }
        throw new Error(`Unknown symbol: ${symbol.toString()}`);
      }),
    } as unknown as Container;

    // Facade принимает контейнер в конструкторе
    facade = new YandexTrackerFacade(mockContainer);
  });

  it('должна успешно вызвать операцию ping', async () => {
    // Arrange
    const pingResult = {
      success: true,
      message: 'Успешно подключено',
    };
    vi.mocked(mockPingOperation.execute).mockResolvedValue(pingResult);

    // Act
    const result = await facade.ping();

    // Assert
    expect(result.success).toBe(true);
    expect(mockPingOperation.execute).toHaveBeenCalledOnce();
    expect(mockContainer.get).toHaveBeenCalledWith(Symbol.for('PingOperation'));
  });
});
```

### Вариант 2: Mock Facade (из tool-registry.test.ts)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Container } from 'inversify';
import { ToolRegistry } from '@mcp/tool-registry.js';
import type { YandexTrackerFacade } from '@tracker_api/facade/yandex-tracker.facade.js';
import type { Logger } from '@infrastructure/logging/index.js';
import { PingTool } from '@mcp/tools/ping.tool.js';

describe('ToolRegistry', () => {
  let registry: ToolRegistry;
  let mockContainer: Container;
  let mockFacade: YandexTrackerFacade;
  let mockLogger: Logger;

  beforeEach(() => {
    // Mock Facade
    mockFacade = {
      ping: vi.fn(),
      getIssues: vi.fn(),
      findIssues: vi.fn(),
    } as unknown as YandexTrackerFacade;

    // Mock Logger
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      child: vi.fn(() => mockLogger),
    } as unknown as Logger;

    // Mock Container (возвращает реальные instances Tools)
    mockContainer = {
      get: vi.fn((symbol: symbol) => {
        const symbolStr = symbol.toString();
        if (symbolStr.includes('PingTool')) {
          return new PingTool(mockFacade, mockLogger);
        }
        // ... другие tools
        throw new Error(`Unknown symbol: ${symbolStr}`);
      }),
    } as unknown as Container;

    registry = new ToolRegistry(mockContainer, mockLogger);
  });

  it('должна успешно выполнить ping инструмент', async () => {
    // Arrange
    const mockPingResult = {
      success: true,
      message: 'Подключение успешно',
    };
    vi.mocked(mockFacade.ping).mockResolvedValue(mockPingResult);

    // Act
    const result = await registry.execute('yandex_tracker_ping', {});

    // Assert
    expect(result.isError).toBeUndefined();
    expect(mockLogger.info).toHaveBeenCalledWith('Вызов инструмента: yandex_tracker_ping');
  });
});
```

---

## Интеграционные тесты: Реальный контейнер

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import type { Container } from 'inversify';
import { loadConfig } from '@infrastructure/config.js';
import { createContainer, TYPES } from '@composition-root/index.js';
import type { ToolRegistry } from '@mcp/tool-registry.js';
import type { ServerConfig } from '@types';

describe('Integration: Full DI', () => {
  let container: Container;

  beforeEach(async () => {
    // Создаём конфигурацию для тестов
    const config: ServerConfig = {
      apiBase: 'https://api.tracker.yandex.net',
      orgId: 'test-org-id',
      token: 'test-oauth-token',
      requestTimeout: 10000,
      logLevel: 'silent', // Отключаем логи в тестах
      logsDir: '', // Отключаем файловое логирование
      prettyLogs: false,
      logMaxSize: 1048576,
      logMaxFiles: 20,
    };

    // Создаём реальный контейнер (ASYNC!)
    container = await createContainer(config);
  });

  it('should resolve ToolRegistry', () => {
    const registry = container.get<ToolRegistry>(TYPES.ToolRegistry);
    expect(registry).toBeDefined();
    expect(registry.getDefinitions().length).toBeGreaterThan(0);
  });
});
```

---

## Автоматическая регистрация через definitions

**Для Tool:**
```typescript
// src/composition-root/definitions/tool-definitions.ts
export const TOOL_CLASSES = [
  PingTool,
  GetIssuesTool,
  NewTool,  // ← ДОБАВИЛ ОДНУ СТРОКУ
] as const;

// ВСЁ! Автоматически:
// - TYPES.NewTool = Symbol.for('NewTool')
// - container.bind(TYPES.NewTool).toDynamicValue(...)
// - ToolRegistry.tools включает NewTool
```

**Для Operation:**
```typescript
// src/composition-root/definitions/operation-definitions.ts
export const OPERATION_CLASSES = [
  PingOperation,
  GetIssuesOperation,
  NewOperation,  // ← ДОБАВИЛ ОДНУ СТРОКУ
] as const;

// ВСЁ! Автоматически:
// - Symbol.for('NewOperation') зарегистрирован
// - Доступен через container.get() и Facade
```

**Как это работает:**
1. Добавляешь класс в `TOOL_CLASSES` или `OPERATION_CLASSES`
2. При создании контейнера (`createContainer()`) происходит автоматическая регистрация:
   - Создаётся Symbol из имени класса: `Symbol.for(ClassName)`
   - Выполняется `container.bind(symbol).toDynamicValue(...)`
   - Для Tools: автоматически добавляется в ToolRegistry
3. Валидация через `npm run validate:tools` проверяет, что все файлы зарегистрированы

---

## Типичные ошибки

### ❌ Забыть await

```typescript
const container = createContainer(config); // ❌ Забыли await
const logger = container.get(TYPES.Logger); // TypeError: container is Promise
```

✅ **Правильно:**
```typescript
const container = await createContainer(config); // ✅
const logger = container.get(TYPES.Logger); // ✅
```

### ❌ Создавать Logger вручную

```typescript
const logger = new Logger({ level: 'info' }); // ❌
```

✅ **Правильно:**
```typescript
const logger = container.get<Logger>(TYPES.Logger); // ✅
```

### ❌ Использовать container.rebind() в unit тестах

```typescript
const container = new Container();
container.rebind(TYPES.HttpClient).toConstantValue(mockHttp); // ❌ Ошибка: не зарегистрирован
```

✅ **Правильно:**
```typescript
const container = new Container();
container.bind(TYPES.HttpClient).toConstantValue(mockHttp); // ✅ Используй bind()
```

### ❌ Передавать Logger в createContainer()

```typescript
const logger = new Logger({ level: 'info' });
const container = await createContainer(config, logger); // ❌ Неверная сигнатура
```

✅ **Правильно:**
```typescript
const container = await createContainer(config); // ✅ Logger создаётся внутри
const logger = container.get<Logger>(TYPES.Logger); // ✅ Извлекаем из контейнера
```

---

## См. также

- **Реальные unit тесты:**
  - `/Users/fractalizer/PhpstormProjects/yandex-tracker-mcp/tests/unit/tracker_api/facade/yandex-tracker.facade.test.ts`
  - `/Users/fractalizer/PhpstormProjects/yandex-tracker-mcp/tests/unit/mcp/tool-registry.test.ts`
- **Реальные integration тесты:**
  - `/Users/fractalizer/PhpstormProjects/yandex-tracker-mcp/tests/integration/helpers/mcp-client.ts`
- **Конфигурация контейнера:**
  - `/Users/fractalizer/PhpstormProjects/yandex-tracker-mcp/src/composition-root/container.ts`
- **DI конвенции:**
  - `/Users/fractalizer/PhpstormProjects/yandex-tracker-mcp/src/composition-root/CONVENTIONS.md`
