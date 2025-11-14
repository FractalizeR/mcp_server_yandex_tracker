# Яндекс.Трекер MCP Bundle

Полнофункциональный MCP (Model Context Protocol) Bundle для интеграции с API Яндекс.Трекера. Позволяет LLM-моделям (например, Claude) взаимодействовать с задачами, проектами и другими сущностями Яндекс.Трекера.

## Описание

MCP Bundle — это стандартизированный формат упаковки локальных MCP-серверов в виде `.mcpb` архивов для упрощения установки и распространения. Этот бандл реализует полноценный MCP-сервер для работы с Яндекс.Трекером, написанный на TypeScript с строгой типизацией.

### Основные возможности

- ✅ **Строгая типизация**: полная реализация на TypeScript
- ✅ **Безопасность**: защищённая передача токенов через переменные окружения
- ✅ **Логирование**: настраиваемые уровни логирования (debug, info, warn, error)
- ✅ **Обработка ошибок**: продуманная обработка ошибок API с информативными сообщениями
- ✅ **Таймауты**: настраиваемые таймауты для запросов к API
- ✅ **Batch-операции**: параллельное выполнение множественных запросов с контролем лимитов
- ✅ **Расширяемость**: простая архитектура для добавления новых инструментов

### Текущие инструменты

- `yandex_tracker_ping` — проверка доступности API и валидности токена

## Требования

- **Node.js**: версия 16.0.0 или выше
- **npm**: для установки зависимостей
- **OAuth токен Яндекс**: для доступа к API Трекера
- **ID организации**: для работы с конкретной организацией в Трекере

## Установка

### 1. Клонирование репозитория

```bash
git clone https://github.com/fractalizer/yandex-tracker-mcp.git
cd yandex-tracker-mcp
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Сборка проекта

```bash
npm run build
```

Эта команда скомпилирует TypeScript код в JavaScript в директорию `server/`.

## Получение OAuth токена

### Шаги для получения токена:

1. Перейдите на страницу OAuth приложений Яндекса: https://oauth.yandex.ru/
2. Создайте новое приложение или используйте существующее
3. Выберите права доступа (scope): `tracker:read`, `tracker:write`
4. Получите OAuth токен

**Важно**: Храните токен в безопасности и никогда не коммитьте его в репозиторий!

### Получение ID организации

ID организации можно найти в настройках Яндекс.Трекера:
1. Откройте Яндекс.Трекер
2. Перейдите в "Настройки" → "Организация"
3. Скопируйте ID организации

## Конфигурация

Бандл настраивается через переменные окружения, которые передаются из `manifest.json`:

| Переменная | Тип | Обязательная | Описание | По умолчанию |
|-----------|-----|--------------|----------|--------------|
| `YANDEX_TRACKER_TOKEN` | string | ✅ Да | OAuth токен для API | - |
| `YANDEX_ORG_ID` | string | ⚠️ Один из двух* | ID организации (Яндекс 360 для бизнеса) | - |
| `YANDEX_CLOUD_ORG_ID` | string | ⚠️ Один из двух* | ID организации (Yandex Cloud Organization) | - |
| `LOG_LEVEL` | string | Нет | Уровень логирования: debug, info, warn, error | `info` |
| `REQUEST_TIMEOUT` | number | Нет | Таймаут запросов (мс), диапазон: 5000-120000 | `30000` |
| `MAX_BATCH_SIZE` | number | Нет | Максимальное количество элементов в batch-запросе, диапазон: 1-1000 | `200` |
| `MAX_CONCURRENT_REQUESTS` | number | Нет | Максимальное количество одновременных HTTP-запросов, диапазон: 1-20 | `5` |

**\* Важно:** Необходимо указать **только один** из параметров `YANDEX_ORG_ID` или `YANDEX_CLOUD_ORG_ID`:
- Используйте `YANDEX_ORG_ID`, если к Трекеру привязана **Яндекс 360 для бизнеса**
- Используйте `YANDEX_CLOUD_ORG_ID`, если к Трекеру привязана **Yandex Cloud Organization**

## Использование

### Локальный запуск для тестирования

```bash
# Установите переменные окружения
export YANDEX_TRACKER_TOKEN="your-oauth-token"

# Для Яндекс 360 для бизнеса:
export YANDEX_ORG_ID="your-org-id"

# ИЛИ для Yandex Cloud Organization:
# export YANDEX_CLOUD_ORG_ID="bpf3crucp1v2********"

export LOG_LEVEL="debug"

# Запустите сервер
npm run dev
```

### Использование в Claude Desktop

1. **Упакуйте бандл** (если установлен MCPB CLI):
   ```bash
   npx @anthropic-ai/mcpb pack
   ```

2. **Установите в Claude Desktop**:
   - Откройте настройки Claude Desktop
   - Перейдите в раздел MCP Bundles
   - Добавьте созданный файл `yandex-tracker-mcp.mcpb`
   - Введите OAuth токен и ID организации в параметрах конфигурации

3. **Используйте инструменты**:
   Теперь Claude может использовать инструменты Яндекс.Трекера в диалоге:
   ```
   User: Проверь доступность API Яндекс.Трекера
   Claude: [использует yandex_tracker_ping]
   ```

## Разработка

### Структура проекта

```
yandex-tracker-mcp/
├── manifest.json          # Манифест MCPB бандла
├── package.json           # Зависимости Node.js
├── tsconfig.json          # Конфигурация TypeScript
├── .eslintrc.json         # Правила линтинга
├── src/                   # Исходный код TypeScript
│   ├── index.ts          # Главный файл MCP-сервера
│   ├── types.ts          # Определения типов
│   ├── config.ts         # Загрузка конфигурации
│   ├── logger.ts         # Система логирования
│   ├── api-client.ts     # Клиент API Яндекс.Трекера
│   └── tools.ts          # Определения инструментов
├── server/                # Скомпилированный JavaScript (создаётся при сборке)
└── README.md             # Эта документация
```

### Добавление новых инструментов

1. **Добавьте определение инструмента** в `src/tools.ts`:
   ```typescript
   export const TOOL_DEFINITIONS = [
     // ... существующие инструменты
     {
       name: 'yandex_tracker_create_issue',
       description: 'Создание новой задачи в Яндекс.Трекере',
       inputSchema: {
         type: 'object',
         properties: {
           queue: { type: 'string', description: 'Ключ очереди' },
           summary: { type: 'string', description: 'Название задачи' },
         },
         required: ['queue', 'summary'],
       },
     },
   ];
   ```

2. **Реализуйте обработчик** в классе `ToolHandler`:
   ```typescript
   private async handleCreateIssue(params: ToolCallParams): Promise<ToolResult> {
     // Реализация создания задачи
   }
   ```

3. **Добавьте маршрутизацию** в метод `handleToolCall`:
   ```typescript
   case 'yandex_tracker_create_issue':
     return this.handleCreateIssue(params);
   ```

4. **Пересоберите проект**:
   ```bash
   npm run build
   ```

### Скрипты разработки

```bash
# Сборка проекта
npm run build

# Сборка в режиме watch (пересборка при изменениях)
npm run watch

# Запуск с отладкой
npm run dev

# Проверка типов без сборки
npm run typecheck          # Только src/
npm run typecheck:tests    # Только tests/
npm run typecheck:all      # src/ + tests/

# Линтинг кода
npm run lint

# Очистка собранных файлов
npm run clean
```

## Тестирование

### Ручное тестирование через stdio

Вы можете тестировать MCP-сервер напрямую, отправляя JSON-RPC сообщения через stdin:

```bash
npm run build
node server/index.js
```

Затем отправьте JSON-RPC запрос:
```json
{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}
```

### Тестирование ping инструмента

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "yandex_tracker_ping",
    "arguments": {}
  }
}
```

## Безопасность

### Защита токенов

- **Никогда не коммитьте токены** в систему контроля версий
- Используйте `.env` файлы для локальной разработки (они в `.gitignore`)
- В продакшене передавайте токены через переменные окружения
- Ограничивайте права доступа OAuth токена минимально необходимыми

### Обработка ошибок

Все ошибки API логируются без раскрытия чувствительных данных. Токены и другие конфиденциальные параметры не включаются в логи.

## Совместимость

- **Платформы**: macOS, Linux, Windows
- **MCP клиенты**: Claude Desktop ≥ 0.10.0
- **Node.js**: ≥ 16.0.0

## Лицензия

MIT License. См. файл `LICENSE` для подробностей.

## Автор

Fractalizer (fractalizer@example.com)

## Полезные ссылки

- [Спецификация MCP Bundle](https://github.com/anthropics/mcpb)
- [Model Context Protocol SDK](https://github.com/anthropics/mcp)
- [API Яндекс.Трекера](https://cloud.yandex.ru/docs/tracker/about-api)
- [OAuth Яндекс](https://yandex.ru/dev/oauth/)

## Поддержка

При возникновении проблем:
1. Проверьте корректность OAuth токена и ID организации
2. Убедитесь, что установлены все зависимости (`npm install`)
3. Проверьте логи с уровнем `debug`: `export LOG_LEVEL=debug`
4. Создайте issue в репозитории GitHub