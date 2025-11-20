# 🎯 ДЕТАЛЬНЫЙ ПЛАН МИГРАЦИИ НА TURBOREPO

**Версия:** 2.0 (финальная)
**Дата:** 2025-11-20
**Автор:** Claude Code
**Время выполнения:** ~1-1.5 часа

---

## 🚀 ЭТАП 1: Установка и базовая конфигурация (10 мин)

### 1.1. Установка Turborepo

```bash
npm install -D turbo
```

**Ожидаемый вывод:**
```
added 1 package, and audited XXX packages in Xs
```

**Проверка:**
```bash
npx turbo --version
# Должен вывести версию, например: 2.x.x
```

---

### 1.2. Обновление .gitignore

```bash
echo "" >> .gitignore
echo "# Turborepo" >> .gitignore
echo ".turbo/" >> .gitignore
```

**Проверка:**
```bash
tail -3 .gitignore
# Должно показать:
# # Turborepo
# .turbo/
```

---

### 1.3. Создание turbo.json

**Скопировать готовую конфигурацию:**

```bash
cp .agentic-planning/turborepo-migration/turbo.json ./turbo.json
```

**Или создать вручную:**

Создать файл `/home/user/mcp_server_yandex_tracker/turbo.json` с содержимым из файла `turbo.json` в этой директории.

**Проверка:**
```bash
cat turbo.json | grep -c "pipeline"
# Должен вывести: 1
```

---

## 🔧 ЭТАП 2: Обновление package.json скриптов (15 мин)

### 2.1. Корневой package.json

**Открыть файл:**
```bash
nano package.json
# или использовать любой редактор
```

**Изменить секцию "scripts":**

См. файл `package.json.changes.md` в этой директории для списка всех изменений.

**Основные изменения:**

```json
{
  "scripts": {
    // === Build ===
    "build": "turbo run build",                                    // было: npm run build --workspaces --if-present
    "build:mcpb": "turbo run build:mcpb",                         // было: npm run build:mcpb --workspaces --if-present

    // === Test ===
    "test": "turbo run test",                                      // было: npm run test --workspaces --if-present
    "test:coverage": "turbo run test:coverage",                   // было: vitest run --coverage
    "test:quiet": "turbo run test:quiet",                         // было: npm run test:quiet --workspaces --if-present
    "test:smoke": "turbo run test:smoke",                         // было: npm run test:smoke --workspaces --if-present
    "test:verbose": "turbo run test:verbose",                     // было: vitest run --reporter=verbose
    "test:watch": "turbo run test:watch",                         // было: vitest watch

    // === Lint ===
    "lint": "turbo run lint",                                      // было: npm run lint --workspaces --if-present
    "lint:fix": "turbo run lint:fix",                             // было: npm run lint:fix --workspaces --if-present
    "lint:quiet": "turbo run lint:quiet",                         // было: npm run lint:quiet --workspaces --if-present

    // === Type checking ===
    "typecheck": "turbo run typecheck",                           // было: npm run typecheck --workspaces --if-present

    // === Code quality (monorepo-wide) ===
    "cpd": "turbo run cpd",                                       // было: jscpd ... (но оставляем скрипт для turbo)
    "cpd:quiet": "turbo run cpd:quiet",                           // было: jscpd ... --silent
    "cpd:report": "turbo run cpd:report",                         // было: jscpd ... --reporters
    "depcruise": "turbo run depcruise",                           // было: depcruise packages --validate (оставляем для turbo)
    "knip": "turbo run knip",                                     // было: ./scripts/run-knip.sh (оставляем для turbo)
    "validate:docs": "turbo run validate:docs",                   // было: tsx scripts/... (оставляем для turbo)

    // === Composite commands ===
    "check": "turbo run lint typecheck && npm run format:check",
    "quality": "turbo run cpd depcruise knip",
    "validate": "turbo run build lint typecheck test test:smoke cpd depcruise validate:docs",
    "validate:quiet": "turbo run build lint:quiet typecheck test:quiet cpd:quiet depcruise validate:docs",
    "validate:security": "turbo run knip && npm run audit:socket && npm run audit:lockfile && npm run audit:secrets",

    // === Добавить корневые скрипты (для turbo) ===
    "cpd:root": "jscpd packages/framework/*/src packages/servers/*/src || true",
    "cpd:quiet:root": "jscpd packages/framework/*/src packages/servers/*/src --silent || true",
    "cpd:report:root": "jscpd packages/framework/*/src packages/servers/*/src --reporters html,console",
    "depcruise:root": "depcruise packages --validate",
    "knip:root": "./scripts/run-knip.sh",
    "validate:docs:root": "tsx scripts/validate-docs-size.ts",

    // === Обновить clean:cache ===
    "clean:cache": "npm cache clean --force && rimraf node_modules/.cache .turbo",

    // === Обновить fix ===
    "fix": "turbo run lint:fix && npm run format",

    // === Остальные остаются без изменений ===
    "audit:lockfile": "npm ci --dry-run",
    "audit:secrets": "gitleaks detect --no-git --verbose --config .gitleaks.toml",
    "audit:socket": "npx --yes @socketsecurity/cli@latest audit --severity high || echo '⚠️  Socket.dev audit skipped (not logged in). Run: socket login'",
    "clean": "rimraf packages/framework/*/dist packages/servers/*/dist",
    "clean:all": "npm run clean && rimraf node_modules packages/framework/*/node_modules packages/servers/*/node_modules",
    "deps:audit": "npm audit --audit-level=moderate",
    "deps:check": "npx npm-check-updates -u --deep --dep dev,prod",
    "deps:outdated": "npm outdated --workspaces",
    "deps:update": "npm update --workspaces",
    "depcruise:graph": "depcruise packages --output-type dot | dot -T svg > dependency-graph.svg",
    "eslint:inspect": "eslint --inspect-config",
    "format": "npm run format:pkg && prettier --write \"packages/**/src/**/*.ts\" \"packages/**/tests/**/*.ts\" \"scripts/**/*.ts\"",
    "format:check": "prettier --check \"packages/**/src/**/*.ts\" \"packages/**/tests/**/*.ts\" \"scripts/**/*.ts\"",
    "format:pkg": "sort-package-json package.json packages/framework/*/package.json packages/servers/*/package.json",
    "postinstall": "./scripts/install-gitleaks.sh",
    "loc": "tsx scripts/cloc-summary.ts",
    "loc:by-file": "cloc packages/framework packages/servers --exclude-dir=node_modules,dist,.git --by-file",
    "loc:full": "cloc packages/framework packages/servers --exclude-dir=node_modules,dist,.git",
    "pre-commit": "npm run validate:quiet",
    "prepare": "husky || true",
    "reinstall": "npm run clean:all && npm install",
    "vitest:ui": "vitest --ui --coverage"
  }
}
```

**ВАЖНО:** Нужно добавить корневые скрипты (с суффиксом `:root`), потому что Turborepo вызывает скрипты из package.json, а не команды напрямую.

**Проверка:**
```bash
# Проверить что скрипты обновлены
cat package.json | grep '"build":'
# Должно показать: "build": "turbo run build",
```

---

### 2.2. Package.json в пакетах

**НЕ ТРЕБУЕТ ИЗМЕНЕНИЙ!**

Turborepo вызывает скрипты в пакетах напрямую через их package.json.

---

## 🔄 ЭТАП 3: Обновление CI/CD (10 мин)

### 3.1. .github/workflows/ci.yml

**Открыть файл:**
```bash
nano .github/workflows/ci.yml
```

**Изменить:**

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  test:
    name: Build & Test All Packages
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v5

      - name: 🔧 Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: '22'
          cache: 'npm'

      - name: 📦 Install dependencies
        run: npm ci

      # ===== ДОБАВИТЬ НОВЫЙ ШАГ =====
      - name: 💾 Cache Turborepo
        uses: actions/cache@v4
        with:
          path: .turbo
          key: ${{ runner.os }}-turbo-${{ github.sha }}
          restore-keys: |
            ${{ runner.os }}-turbo-

      # ===== ИЗМЕНИТЬ КОМАНДЫ =====
      - name: 🔨 Build all packages
        run: turbo run build                    # было: npm run build

      - name: 🧪 Run all tests
        run: turbo run test                     # было: npm run test

      - name: 🚀 Run smoke tests
        run: turbo run test:smoke               # было: npm run test:smoke

      - name: 🔍 Lint check
        run: turbo run lint                     # было: npm run lint
        continue-on-error: true

      # ===== ДОБАВИТЬ НОВЫЙ ШАГ =====
      - name: 📝 Type check
        run: turbo run typecheck

      - name: 🏗️ Validate architecture
        run: turbo run depcruise                # было: npm run depcruise

      - name: 📊 Code quality checks
        run: turbo run cpd knip                 # было: npm run quality
        continue-on-error: true
```

**Проверка:**
```bash
cat .github/workflows/ci.yml | grep "turbo run"
# Должно показать несколько строк с turbo run
```

---

### 3.2. .github/workflows/publish.yml

**Открыть файл:**
```bash
nano .github/workflows/publish.yml
```

**Изменить:**

```yaml
name: Publish Packages

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v6
        with:
          node-version: '22'
          registry-url: 'https://registry.npmjs.org'

      - name: 📦 Install dependencies
        run: npm ci

      # ===== ДОБАВИТЬ =====
      - name: 💾 Cache Turborepo
        uses: actions/cache@v4
        with:
          path: .turbo
          key: ${{ runner.os }}-turbo-${{ github.sha }}
          restore-keys: |
            ${{ runner.os }}-turbo-

      # ===== ИЗМЕНИТЬ КОМАНДЫ =====
      - name: 🔨 Build
        run: turbo run build                    # было: npm run build

      - name: 🧪 Test
        run: turbo run test                     # было: npm run test

      - name: 🚀 Smoke tests
        run: turbo run test:smoke               # было: npm run test:smoke

      # ===== БЕЗ ИЗМЕНЕНИЙ =====
      - name: 📤 Publish
        run: npm publish --workspaces
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Проверка:**
```bash
cat .github/workflows/publish.yml | grep "turbo run"
# Должно показать 3 строки с turbo run
```

---

### 3.3. .github/workflows/release.yml (если существует)

Обновить аналогично, заменив `npm run build/test` на `turbo run build/test`.

---

## 🧪 ЭТАП 4: Тестирование (20 мин)

### 4.1. Очистка и первая сборка

```bash
# Очистить всё
npm run clean
rm -rf .turbo

# Первая сборка (холодный кэш)
time turbo run build
```

**Ожидаемый результат:**
- Время: ~30-60 сек
- Порядок: infrastructure → core → search → yandex-tracker
- Все пакеты собрались без ошибок

**Проверить что всё собралось:**
```bash
ls -la packages/framework/infrastructure/dist
ls -la packages/framework/core/dist
ls -la packages/framework/search/dist
ls -la packages/servers/yandex-tracker/dist
```

Все директории должны содержать скомпилированные файлы.

---

### 4.2. Тестирование кэша

```bash
# Вторая сборка (должна быть из кэша)
time turbo run build
```

**Ожидаемый результат:**
- Время: ~1-2 сек
- Вывод содержит: `>>> FULL TURBO` или `cache hit, replaying logs`
- Все задачи помечены как `cached`

**Пример вывода:**
```
Tasks:    4 successful, 4 total
Cached:   4 cached, 4 total
Time:     1.2s >>> SAVED 38.5s
```

---

### 4.3. Тестирование задач

```bash
# Тесты (должны зависеть от build)
turbo run test

# Линтинг (кэшируется)
turbo run lint

# Type checking
turbo run typecheck

# Monorepo-wide задачи
turbo run cpd
turbo run depcruise
turbo run validate:docs
turbo run knip
```

**Ожидаемый результат:**
- Все задачи выполняются успешно
- При повторном запуске берутся из кэша

---

### 4.4. Тестирование фильтров

```bash
# Собрать только yandex-tracker и зависимости
turbo run build --filter=@mcp-server/yandex-tracker
```

**Ожидаемый результат:**
- Собирается: infrastructure, core, search, yandex-tracker
- Остальные пакеты (если есть) пропускаются

```bash
# Изменить файл в infrastructure
echo "// test change" >> packages/framework/infrastructure/src/index.ts

# Собрать только затронутые пакеты
turbo run build --filter=[HEAD]

# Откатить изменение
git checkout packages/framework/infrastructure/src/index.ts
```

---

### 4.5. Тестирование quiet режима

```bash
npm run validate:quiet
```

**Ожидаемый результат:**
- Минимальный вывод (только ошибки)
- Все задачи выполняются успешно

---

### 4.6. Тестирование композитных команд

```bash
# Проверить check
npm run check

# Проверить quality
npm run quality

# Проверить validate
npm run validate
```

**Ожидаемый результат:**
- Все команды выполняются успешно
- Видны логи от Turborepo

---

### 4.7. Проверка публикации (dry-run)

```bash
cd packages/servers/yandex-tracker
npm pack --dry-run

# Проверить что в пакете НЕТ turbo файлов
npm pack --dry-run 2>&1 | grep -E "(turbo|\.turbo)"
# Не должно быть вывода

cd ../../..
```

---

### 4.8. Тестирование pre-commit hook

```bash
# Создать тестовый файл
echo "// test" >> packages/framework/core/src/test-file.ts
git add .

# Попробовать закоммитить (должен запуститься hook)
git commit -m "test: turborepo migration test"

# Если всё прошло успешно, откатить
git reset --soft HEAD~1
git restore --staged .
git restore .
rm packages/framework/core/src/test-file.ts
```

**Ожидаемый результат:**
- Запустился gitleaks
- Запустился lint-staged
- Коммит прошёл (или показал ошибки форматирования)

---

## 📝 ЭТАП 5: Обновление документации (15 мин)

### 5.1. Обновить CLAUDE.md

См. файл `documentation-updates.md` в этой директории для полного текста изменений.

**Краткий список изменений:**

1. Добавить секцию "🚀 Turborepo" после секции "Команды (Workspace)"
2. Обновить секцию "Команды (Workspace)" - заменить примеры на turbo
3. Обновить лимиты размера (проверить что CLAUDE.md остался ≤400 строк)

**Проверка:**
```bash
npm run validate:docs
```

Должно пройти без ошибок.

---

### 5.2. Обновить README.md (опционально)

Добавить упоминание Turborepo в секцию Development:

```markdown
## Development

This project uses Turborepo for monorepo orchestration, providing:
- Automatic build ordering
- Task caching
- Parallel execution

See [CLAUDE.md](./CLAUDE.md) for detailed development instructions.
```

---

## ✅ ЭТАП 6: Финальная проверка и коммит (10 мин)

### 6.1. Финальный чек-лист

Выполнить все команды и убедиться что они работают:

```bash
# 1. Очистить и пересобрать
npm run clean
turbo run build

# 2. Тесты
turbo run test

# 3. Smoke tests
turbo run test:smoke

# 4. Линтинг
turbo run lint

# 5. Type checking
turbo run typecheck

# 6. Monorepo-wide задачи
turbo run cpd depcruise validate:docs knip

# 7. Полная валидация
npm run validate

# 8. Quiet режим
npm run validate:quiet

# 9. Проверка кэша (должно быть instant)
turbo run build
```

**Все задачи должны выполняться успешно!**

---

### 6.2. Проверка git status

```bash
git status
```

**Ожидаемые изменения:**
```
modified:   .gitignore
modified:   package.json
modified:   package-lock.json (если turbo добавил зависимости)
new file:   turbo.json
modified:   .github/workflows/ci.yml
modified:   .github/workflows/publish.yml
modified:   CLAUDE.md
modified:   README.md (если изменяли)
```

---

### 6.3. Коммит

```bash
git add .

git commit -m "chore: мигрировать на Turborepo для управления monorepo

Детали:
- Установлен turbo@latest
- Создан turbo.json с pipeline для всех задач
- Обновлены npm скрипты в корневом package.json
- Обновлены CI/CD workflows (кэширование .turbo/)
- Package-level tasks: build, test, lint, typecheck
- Root-level tasks: cpd, depcruise, validate:docs, knip
- Добавлена документация по Turborepo в CLAUDE.md

Преимущества:
- ✅ Автоматический topological order при сборке
- ✅ Кэширование результатов (build/test/lint)
- ✅ Параллелизация независимых задач
- ✅ Ускорение CI/CD за счёт кэша

Breaking changes: нет
Публикация в npm: без изменений

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### 6.4. Пуш

```bash
git push -u origin claude/analyze-package-dependencies-01SgFyupiqFK9vkkdbLks81L
```

Или в вашу рабочую ветку.

---

## 🎉 ЗАВЕРШЕНИЕ

### Проверка результата

После миграции проверить:

1. **Локально:**
   - ✅ `turbo run build` работает и кэшируется
   - ✅ `npm run validate` проходит
   - ✅ Повторные запуски ~1-2 сек

2. **В CI/CD (после пуша):**
   - ✅ Workflow запустился
   - ✅ Turborepo кэш используется
   - ✅ Время CI сократилось

3. **Публикация (будущее):**
   - ✅ `npm publish` работает как раньше
   - ✅ Пакет не содержит `.turbo/` или `turbo.json`

---

## 📊 Ожидаемые результаты

**Производительность:**
- ⚡ **Первая сборка:** ~30-60 сек (как сейчас)
- ⚡ **Повторная сборка (без изменений):** ~1-2 сек (было: 30-60 сек)
- ⚡ **Сборка после изменения 1 файла:** ~10-20 сек (пересборка только затронутых)

**CI/CD:**
- 🚀 **Full CI:** ~2-3 минуты (было: 4-5 минут)
- 🚀 **PR с изменением 1 пакета:** ~1-2 минуты

**Developer Experience:**
- ✅ Гарантированный порядок сборки
- ✅ Быстрая итерация (локальный кэш)
- ✅ Уверенность что тесты запускаются на актуальном коде
- ✅ Единообразный интерфейс (`turbo run`)

---

## 🆘 Troubleshooting

### Проблема: "Cannot find turbo"

```bash
Error: Cannot find module 'turbo'
```

**Решение:**
```bash
npm install -D turbo
```

---

### Проблема: "Task not found"

```bash
Error: Could not find the following tasks in project: cpd
```

**Решение:**
Убедиться что в корневом `package.json` есть скрипт:
```json
"cpd:root": "jscpd packages/framework/*/src packages/servers/*/src || true"
```

И в `turbo.json` задача настроена как root-level (без package scope).

---

### Проблема: Кэш не работает

```bash
# При повторном запуске всё пересобирается
```

**Решение:**
1. Проверить `inputs` в turbo.json для задачи
2. Проверить что `outputs` указывает на правильные директории
3. Очистить кэш: `rm -rf .turbo` и попробовать снова

---

### Проблема: CI медленный

```bash
# CI всё равно долго работает
```

**Решение:**
1. Проверить что в workflow добавлен шаг с actions/cache
2. Проверить что path указывает на `.turbo`
3. Рассмотреть Vercel Remote Cache для переиспользования между runs

---

### Откат изменений

Если что-то пошло не так:

```bash
git reset --hard HEAD
git clean -fd
npm install
npm run build
```

---

## ✅ План выполнен успешно!

Если вы дошли до этого момента - поздравляю! 🎉

Миграция на Turborepo завершена. Теперь у вас:
- ⚡ Быстрая сборка с кэшированием
- ✅ Гарантированный порядок задач
- 🚀 Ускоренный CI/CD
- 💎 Улучшенный Developer Experience

---

**Следующие шаги:**
1. Отметить этот план как выполненный
2. Продолжить разработку, используя `turbo run`
3. Наблюдать за ускорением CI/CD
4. Рассмотреть Vercel Remote Cache (опционально)

**Удачи!** 🚀
