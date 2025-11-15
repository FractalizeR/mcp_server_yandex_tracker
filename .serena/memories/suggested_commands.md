# Рекомендуемые команды для разработки

## Основные команды

### Разработка
```bash
npm run dev              # Сборка и запуск сервера
npm run dev:debug        # Запуск с debugger
npm run watch            # Сборка в watch режиме
```

### Сборка
```bash
npm run build            # TypeScript компиляция + tsc-alias
npm run build:bundle     # esbuild бандл для production
npm run clean            # Очистка dist/
```

### Тестирование
```bash
npm run test             # Запуск всех тестов
npm run test:watch       # Тесты в watch режиме
npm run test:coverage    # Тесты с coverage
npm run test:unit        # Только unit тесты
npm run test:integration # Только integration тесты
npm run test:ui          # Vitest UI
npm run test:changed     # Тесты только измененных файлов
npm run test:smoke       # Smoke test сервера
```

### Линтинг и форматирование
```bash
npm run lint             # ESLint проверка
npm run lint:fix         # ESLint с автофиксом
npm run format           # Prettier форматирование
npm run format:check     # Prettier проверка
```

### Проверка типов
```bash
npm run typecheck        # TypeScript проверка src/
npm run typecheck:tests  # TypeScript проверка tests/
```

### Архитектурные правила
```bash
npm run depcruise        # Проверка зависимостей
npm run depcruise:graph  # Генерация SVG графа зависимостей
```

### Валидация
```bash
npm run validate         # ПОЛНАЯ валидация (рекомендуется перед коммитом)
npm run validate:code    # Линтинг + типы + форматирование
npm run validate:tests   # Запуск тестов
npm run validate:architecture # Архитектурные правила
npm run validate:security     # Безопасность
npm run validate:build   # Проверка сборки
npm run validate:docs    # Проверка лимитов документации
npm run validate:tools   # Проверка регистрации tools/operations
```

### Безопасность
```bash
npm run knip             # Поиск мёртвого кода
npm run audit:socket     # Socket.dev анализ зависимостей
npm run audit:lockfile   # Проверка актуальности package-lock.json
npm run audit:secrets    # Gitleaks сканирование секретов
```

### Генерация индексов
```bash
npm run generate:index   # Генерация tool search индекса
```

### MCP CLI
```bash
npm run mcp:connect      # Подключить к MCP клиенту (Claude Desktop/Code/Codex)
npm run mcp:disconnect   # Отключить от MCP клиента
npm run mcp:status       # Статус подключения
npm run mcp:list         # Список доступных MCP клиентов
npm run mcp:validate     # Проверка конфигурации
```

## Рабочий процесс

### Перед началом работы
```bash
npm install              # Установка зависимостей
npm run build            # Первичная сборка
```

### Во время разработки
```bash
npm run dev              # Запуск сервера для тестирования
npm run test:watch       # Автоматический запуск тестов
npm run lint:fix         # Исправление линтинг ошибок
```

### Перед коммитом
```bash
npm run validate         # Полная проверка (если не только документация)
```

**ВАЖНО:** Pre-commit hook автоматически:
- Форматирует код через Prettier
- Запускает Gitleaks проверку секретов
- Проверяет линтинг staged файлов

### При добавлении нового Tool
```bash
# 1. Создать файлы tool
# 2. Добавить в src/composition-root/definitions/tool-definitions.ts
npm run build            # Автоматически запустит generate:index
npm run validate:tools   # Проверит регистрацию
npm run test             # Запустить тесты
```

### При добавлении новой Operation
```bash
# 1. Создать файлы operation
# 2. Добавить в src/composition-root/definitions/operation-definitions.ts
npm run validate:tools   # Проверит регистрацию
npm run test             # Запустить тесты
```

## Утилиты системы (macOS)

### Поиск файлов/кода
```bash
find src/ -name "*.ts"                    # Поиск файлов
grep -r "pattern" src/                    # Поиск в содержимом
rg "pattern" src/                         # ripgrep (быстрее grep)
```

### Git
```bash
git status                                # Статус репозитория
git diff                                  # Изменения
git log --oneline                         # История коммитов
git add .                                 # Добавить все файлы
git commit -m "message"                   # Коммит
```

### Навигация
```bash
ls -la                                    # Список файлов (с hidden)
cd <path>                                 # Смена директории
pwd                                       # Текущая директория
```

### Просмотр файлов
```bash
cat <file>                                # Вывод файла
head -n 20 <file>                         # Первые 20 строк
tail -n 20 <file>                         # Последние 20 строк
less <file>                               # Постраничный просмотр
```

## Дополнительно

### Публикация
```bash
npm run prepublishOnly   # Автоматически: clean + build:bundle
```

### Хуки
```bash
npm run prepare          # Установка Husky hooks
```
