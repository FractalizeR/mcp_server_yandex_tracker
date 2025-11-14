# Использование DI контейнера в тестах

Примеры интеграционного тестирования с InversifyJS.

---

## Пример 1: Интеграционный тест с реальными зависимостями

```typescript
import 'reflect-metadata';
import { Container } from 'inversify';
import { createContainer, TYPES } from '../src/di/index.js';
import { loadConfig } from '../src/config.js';
import { Logger } from '../src/logger.js';

describe('Integration: MCP Server', () => {
  let container: Container;

  beforeEach(() => {
    const config = loadConfig();
    const logger = new Logger('silent'); // Тихий режим для тестов
    container = createContainer(config, logger);
  });

  it('should respond to ping tool', async () => {
    const toolRegistry = container.get(TYPES.ToolRegistry);
    const result = await toolRegistry.execute('ping', {});

    expect(result.isError).toBe(false);
  });
});
```

---

## Пример 2: Интеграционный тест с моком HttpClient

```typescript
import type { HttpClient } from '../src/api/http/client/http-client.js';

describe('Integration: MCP Server with Mock', () => {
  let container: Container;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    const config = loadConfig();
    const logger = new Logger('silent');
    container = createContainer(config, logger);

    // Создаём мок HttpClient
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    // Подменяем HttpClient в контейнере
    container.rebind(TYPES.HttpClient).toConstantValue(mockHttpClient);
  });

  it('should call API when getting issues (batch)', async () => {
    // Мокируем batch-запрос
    mockHttpClient.get.mockResolvedValue({
      key: 'TEST-1',
      summary: 'Test task',
    });

    const toolRegistry = container.get(TYPES.ToolRegistry);

    await toolRegistry.execute('yandex_tracker_get_issues', {
      issueKeys: ['TEST-1', 'TEST-2']
    });

    // Проверяем, что был вызван batch-запрос для каждой задачи
    expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/issues/TEST-1');
    expect(mockHttpClient.get).toHaveBeenCalledWith('/v3/issues/TEST-2');
  });
});
```

---

## Преимущества DI для тестов

### 1. Легкая подмена зависимостей

**Без DI (ручное создание):**
```typescript
const mockHttp = createMockHttpClient();
const retry = new RetryHandler(...);
const cache = new NoOpCache();
const facade = new YandexTrackerFacade(mockHttp, retry, cache, logger);
const toolRegistry = new ToolRegistry(facade, logger);
```

**С DI (через контейнер):**
```typescript
container.rebind(TYPES.HttpClient).toConstantValue(mockHttpClient);
const toolRegistry = container.get(TYPES.ToolRegistry);
```

### 2. Изолированное тестирование компонентов

```typescript
// Тестируем только Facade, остальное — моки
container.rebind(TYPES.HttpClient).toConstantValue(mockHttp);
container.rebind(TYPES.CacheManager).toConstantValue(mockCache);

const facade = container.get(TYPES.YandexTrackerFacade);
await facade.ping(); // Использует моки
```

### 3. Разные конфигурации для разных тестов

```typescript
// Test Suite 1: с кешем
const container1 = createContainer(config, logger);
container1.rebind(TYPES.CacheManager).toConstantValue(new MemoryCache());

// Test Suite 2: без кеша
const container2 = createContainer(config, logger);
container2.rebind(TYPES.CacheManager).toConstantValue(new NoOpCache());
```

---

## Паттерны мокирования

### Мок всего слоя (например, все операции API)

```typescript
const mockFacade = {
  ping: jest.fn(),
  getIssues: jest.fn(),
  createIssues: jest.fn(),
} as unknown as jest.Mocked<YandexTrackerFacade>;

container.rebind(TYPES.YandexTrackerFacade).toConstantValue(mockFacade);
```

### Мок одной зависимости (например, cache)

```typescript
const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  prune: jest.fn(),
} as unknown as jest.Mocked<CacheManager>;

container.rebind(TYPES.CacheManager).toConstantValue(mockCache);
```
