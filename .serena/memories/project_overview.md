# Обзор проекта yandex-tracker-mcp

## Назначение проекта
MCP сервер для интеграции с API Яндекс.Трекера v3. Позволяет LLM-агентам (Claude, GPT) работать с задачами в Яндекс.Трекере через Model Context Protocol.

## Технологический стек

### Основные технологии
- **TypeScript** — strict mode, NO `any`/`unknown`/`null`/`undefined`
- **InversifyJS v7** — Dependency Injection (Symbol-based tokens, `defaultScope: 'Singleton'`)
- **Zod** — валидация параметров, type inference
- **Axios** — HTTP client
- **Pino** + **rotating-file-stream** — production logging с автоматической ротацией
- **MCP SDK** — Model Context Protocol
- **Node.js** ≥22.0.0

### Инфраструктура
- **Vitest** — тестирование (покрытие ≥80%)
- **dependency-cruiser** — валидация архитектурных правил
- **ESLint** + **Prettier** — линтинг и форматирование
- **Husky** + **lint-staged** — pre-commit hooks
- **Knip** — поиск мёртвого кода
- **Socket.dev** — анализ безопасности зависимостей
- **Gitleaks** — поиск секретов в коде
- **Renovate** — автообновление зависимостей

### API
- Яндекс.Трекер v3 (ТОЛЬКО `/v3/*` endpoints)
- Batch-операции для работы с коллекциями

## Структура кодовой базы

```
src/
├── composition-root/      # DI контейнер (InversifyJS)
│   ├── container.ts       # Конфигурация контейнера
│   ├── types.ts           # Symbol-based токены
│   └── definitions/       # Определения tools и operations
├── infrastructure/        # Инфраструктурный слой
│   ├── http/              # HTTP client, retry, error mapping
│   ├── cache/             # Кеширование (Strategy Pattern)
│   ├── async/             # Параллелизация (ParallelExecutor)
│   └── logging/           # Pino logging с ротацией
├── tracker_api/           # Доменная логика
│   ├── api_operations/    # API операции (Feature-by-Folder)
│   ├── entities/          # Доменные типы (Issue, User, etc.)
│   ├── dto/               # Data Transfer Objects
│   └── facade/            # YandexTrackerFacade
├── mcp/                   # Application layer
│   ├── tools/             # MCP Tools
│   │   ├── api/           # API tools (работа с Трекером)
│   │   ├── helpers/       # Helper tools (утилиты)
│   │   ├── base/          # Базовые классы
│   │   └── common/        # Переиспользуемые утилиты
│   ├── search/            # Tool Search System
│   └── utils/             # MCP утилиты
└── cli/                   # CLI для подключения к MCP клиентам

tests/unit/                # Unit тесты (зеркалируют src/)
```

## Ключевые особенности

### Архитектурные паттерны
- **Layered Architecture** — четкое разделение слоев
- **Feature-by-Folder** — группировка по функциональности
- **Strict SRP** — один класс = одна ответственность
- **Dependency Injection** — InversifyJS с Symbol-based tokens
- **Strategy Pattern** — кеш, retry, поиск
- **Facade Pattern** — YandexTrackerFacade
- **Template Method** — BaseOperation, BaseTool

### Batch-операции
Все операции с коллекциями используют batch-подход:
- `getIssues([keys])` вместо `getIssue(key)`
- Параллельное выполнение с throttling (ParallelExecutor)
- Типобезопасная обработка результатов (`BatchResult<T>`)

### Forward Compatibility
Разделение Entity (с unknown полями) и DTO (строгие типы):
- `IssueWithUnknownFields` — для чтения из API
- `CreateIssueDto`, `UpdateIssueDto` — для записи в API

### Tool Search System
- Compile-time индексирование (`npm run generate:index`)
- 5 стратегий поиска (Name, Description, Category, Fuzzy, Weighted)
- LRU кеш для оптимизации

### Безопасность
- Флаг `requiresExplicitUserConsent` для опасных операций
- Автоматические проверки (`npm run validate:tools`)
- Gitleaks pre-commit hook
- Socket.dev анализ зависимостей
