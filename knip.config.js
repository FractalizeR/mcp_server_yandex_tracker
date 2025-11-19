/**
 * Knip Configuration для Monorepo
 *
 * Knip находит unused files, dependencies, и exports.
 * Некоторые "unused" файлы на самом деле используются (скрипты, helpers),
 * поэтому мы игнорируем их здесь.
 *
 * ## Workaround for vitest.workspace.ts
 * Knip пытается загрузить vitest.workspace.ts как конфигурационный файл,
 * но не может обработать ESM import defineWorkspace.
 * Решение: npm скрипт `knip` использует scripts/run-knip.sh,
 * который временно переименовывает файл перед запуском knip.
 *
 * ## Почему игнорируем scripts/?
 * Scripts используются через npm run команды, knip не видит эти связи.
 * Например: smoke-test-server.ts используется в "test:smoke" команде.
 *
 * ## Почему игнорируем test helpers?
 * Test helpers - переиспользуемая библиотека для тестов.
 * Knip не анализирует test files по умолчанию.
 *
 * ## Почему игнорируем factories?
 * Factories - часть публичного API для consumers пакета и для тестов.
 *
 * ## Почему игнорируем schema types?
 * Schema types (*Params, *Result, *Config) экспортируются для TypeScript consumers.
 *
 * ## Known unused dependencies warnings
 * Knip показывает ~17 unused dependencies warnings.
 * Эти зависимости могут быть:
 * - Peer dependencies (должны быть в peerDependencies)
 * - Используются только через re-exports
 * - Используются только в типах TypeScript
 * Это приемлемо (<25 warnings - целевая метрика).
 */

export default {
  // Отключить плагины, которые вызывают проблемы
  vitest: false,

  // Глобальные ignore patterns
  ignore: [
    // Build artifacts
    '**/dist/**',
    '**/node_modules/**',

    // Configuration files (могут не импортироваться напрямую)
    '**/*.config.*',
    '**/vitest.workspace.ts',

    // Scripts (используются через npm run)
    '**/scripts/**',

    // Test helpers (переиспользуемые компоненты)
    '**/tests/helpers/**',
    '**/tests/**/helpers/**',
    '**/tests/test-constants.ts',

    // Generated files
    '**/generated-index.ts',

    // Agentic planning (документация)
    '.agentic-planning/**',
  ],

  // Игнорировать определенные exports в том же файле
  ignoreExportsUsedInFile: true,

  // Workspace-specific конфигурация
  workspaces: {
    // Infrastructure
    'packages/framework/infrastructure': {
      entry: ['src/index.ts'],
      ignore: [],
      ignoreDependencies: ['pino-pretty'], // Dev logging dependency
    },

    // Core
    'packages/framework/core': {
      entry: ['src/index.ts'],
      ignore: [],
      ignoreDependencies: [
        '@modelcontextprotocol/sdk', // Re-exported to consumers
        'pino', // Re-exported logger
        'zod', // Re-exported schemas
        'inversify', // DI container
      ],
    },

    // Search
    'packages/framework/search': {
      entry: ['src/index.ts'],
      ignore: [
        'scripts/generate-tool-index.ts', // Build script
      ],
      ignoreDependencies: ['@mcp-framework/infrastructure'], // Framework dependency
    },

    // Yandex Tracker
    'packages/servers/yandex-tracker': {
      entry: [
        'src/index.ts',
        'src/cli/bin/mcp-connect.ts',
      ],
      ignore: [
        // Build and utility scripts
        'scripts/**',

        // Test utilities
        'tests/helpers/**',
        'tests/integration/helpers/**',
        'tests/test-constants.ts',

        // Factories (публичный API для тестов)
        'src/tracker_api/dto/**/dto.factories.ts',
        'src/tracker_api/entities/entity.factories.ts',
      ],
      ignoreDependencies: [
        '@mcp-framework/core',
        '@mcp-framework/search',
        '@iarna/toml',
        'axios',
        'chalk',
        'inquirer',
        'inversify',
        'mime-types',
        'ora',
        'pino',
        'zod',
      ],
    },
  },

  // Игнорировать unlisted dependencies (будут исправлены или являются peer deps)
  ignoreDependencies: [
    // Core framework dependencies (используются через re-exports)
    '@modelcontextprotocol/sdk', // Used in core, re-exported to consumers
    'pino', // Logger infrastructure, used in core and yandex-tracker
    'zod', // Schema validation, used in core and yandex-tracker
    'inversify', // DI container, used in core and yandex-tracker
    'pino-pretty', // Pretty logging for development

    // Search framework dependencies
    '@mcp-framework/infrastructure', // Used in search package
    '@mcp-framework/core', // Used in yandex-tracker
    '@mcp-framework/search', // Used in yandex-tracker

    // Yandex Tracker server dependencies
    '@iarna/toml', // TOML config parsing
    'axios', // HTTP client for Yandex API
    'chalk', // CLI colors
    'inquirer', // CLI prompts
    'mime-types', // MIME type detection for file uploads
    'ora', // CLI spinners
  ],

  // Игнорировать конкретные exports
  ignoreExportsUsedInFile: {
    // Публичный API / Metadata constants
    '**/constants.ts': [
      'MCP_SERVER_DESCRIPTION',
      'PROJECT_AUTHOR',
      'PROJECT_AUTHOR_EMAIL',
      'PROJECT_HOMEPAGE',
      'PROJECT_REPOSITORY_URL',
      'DEFAULT_MAX_BATCH_SIZE',
      'DEFAULT_MAX_CONCURRENT_REQUESTS',
      'DEFAULT_LOGS_DIR',
      'DEFAULT_LOG_MAX_SIZE',
      'DEFAULT_LOG_MAX_FILES',
    ],

    // Utility classes (публичный API)
    '**/*': [
      'PaginationUtil',
    ],
  },

  // Не проверять неиспользуемые типы в entry points (они часть публичного API)
  includeEntryExports: false,

  // Игнорировать экспорты по паттернам
  ignoredExports: [
    // Schema types (публичный API для TypeScript consumers)
    '*Params',
    '*Result',
    '*Config',
    '*Options',
    '*Schema',

    // Factory functions (публичный API)
    'create*',

    // Metadata constants
    'MCP_SERVER_*',
    'PROJECT_*',
    'DEFAULT_*',
  ],
};
