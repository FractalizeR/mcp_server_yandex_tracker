# Обзор проекта (обновлено после миграции на monorepo)

## Структура проекта

```
packages/
├── framework/
│   ├── infrastructure/  # HTTP, cache, logging, async utilities
│   ├── core/           # BaseTool, registry, type system
│   └── search/         # Tool Search Engine
└── servers/
    └── yandex-tracker/ # Yandex Tracker MCP Server
```

## Тесты

- Unit тесты в `packages/*/tests/` (зеркалируют `packages/*/src/`)
- Integration тесты в `packages/servers/yandex-tracker/tests/integration/`
- E2E тесты в `packages/servers/yandex-tracker/tests/workflows/`

## Ключевые файлы

- CLAUDE.md - правила для ИИ агентов
- ARCHITECTURE.md - архитектура monorepo
- DOCS.md - навигация по документации
