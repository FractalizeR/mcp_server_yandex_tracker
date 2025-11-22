# Migration Guide — MCP Framework & Yandex Tracker

**Руководство по миграции между версиями**

---

## v1.x → v2.0.0: Infrastructure cleanup (Breaking Changes)

### BREAKING: Удалён config из `@mcp-framework/infrastructure`

**Причина:** Infrastructure слой должен быть domain-agnostic. Конфигурация Yandex Tracker переехала в соответствующий пакет.

#### ServerConfig, loadConfig, константы

**ДО (v1.x):**
```typescript
import { ServerConfig, loadConfig } from '@mcp-framework/infrastructure';
import { DEFAULT_API_BASE, ENV_VAR_NAMES } from '@mcp-framework/infrastructure';
```

**ПОСЛЕ (v2.0.0):**
```typescript
// Из yandex-tracker пакета:
import { ServerConfig, loadConfig } from '@mcp-server/yandex-tracker/config';
// или с использованием alias (внутри yandex-tracker):
import { ServerConfig, loadConfig } from '#config';
```

#### ParsedCategoryFilter

**ДО (v1.x):**
```typescript
import { ParsedCategoryFilter } from '@mcp-framework/infrastructure';
```

**ПОСЛЕ (v2.0.0):**
```typescript
// Переехал в @mcp-framework/core (универсальный тип для tool filtering):
import { ParsedCategoryFilter } from '@mcp-framework/core';
```

#### LogLevel (НЕ изменился)

```typescript
// LogLevel остался в infrastructure (универсальный тип для logging):
import { LogLevel } from '@mcp-framework/infrastructure';
```

### Затронутые файлы

- `packages/framework/infrastructure/src/config.ts` — удалён
- `packages/framework/infrastructure/src/constants.ts` — удалён
- `packages/framework/infrastructure/src/types.ts` — удалены ServerConfig, ParsedCategoryFilter
- `packages/framework/core/src/tool-registry/types.ts` — добавлен ParsedCategoryFilter

### Миграция для разработчиков framework

Если вы разрабатываете собственный MCP server на базе framework:

1. Замените импорты config/constants на свои локальные
2. ParsedCategoryFilter теперь в `@mcp-framework/core`
3. LogLevel остался в `@mcp-framework/infrastructure`

---

## v2.x → v2.y: Обязательный параметр `fields`

### Breaking Change

Все MCP tools теперь требуют обязательный параметр `fields: string[]`.

**ДО:**
```typescript
await client.callTool('get_projects', { perPage: 10 });
```

**ПОСЛЕ:**
```typescript
await client.callTool('get_projects', {
  perPage: 10,
  fields: ['id', 'name', 'description']  // ← обязательно
});
```

### Затронутые tools (26)

- **Checklists:** `add_checklist_item`, `get_checklist`, `update_checklist_item`
- **Comments:** `add_comment`, `edit_comment`, `get_comments`
- **Components:** `create_component`, `get_components`, `update_component`
- **Attachments:** `get_attachments`, `upload_attachment`
- **Links:** `create_link`, `get_issue_links`
- **Projects:** `create_project`, `get_project`, `get_projects`, `update_project`
- **Queues:** `create_queue`, `get_queue`, `get_queues`, `get_queue_fields`, `manage_queue_access`, `update_queue`
- **Worklogs:** `add_worklog`, `get_worklogs`, `update_worklog`

### Миграция

1. Добавьте параметр `fields` во все вызовы перечисленных tools
2. Укажите минимальный набор нужных полей для экономии контекста
3. Используйте вложенные поля: `['assignee.login', 'status.key']`

### Преимущества

- Экономия контекста Claude на 80-90%
- Быстрее обработка ответов
- Явное управление возвращаемыми данными

---

## См. также

- **Корневой CLAUDE.md:** [CLAUDE.md](./CLAUDE.md)
- **Yandex Tracker README:** [packages/servers/yandex-tracker/README.md](packages/servers/yandex-tracker/README.md)
- **Архитектура:** [ARCHITECTURE.md](./ARCHITECTURE.md)
