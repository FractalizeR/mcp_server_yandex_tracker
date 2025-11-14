#!/usr/bin/env tsx

/**
 * Скрипт для автоматического добавления static METADATA в tools
 *
 * Для каждого tool:
 * - Читает definition
 * - Определяет категорию и теги
 * - Добавляет static METADATA в класс
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Конфигурация метаданных для каждого tool
 */
const TOOL_METADATA_CONFIG: Record<
  string,
  {
    category: string;
    tags: string[];
    isHelper: boolean;
  }
> = {
  // API tools
  ping: {
    category: 'users',
    tags: ['ping', 'health', 'check', 'connection'],
    isHelper: false,
  },
  get_issues: {
    category: 'issues',
    tags: ['issue', 'get', 'batch', 'read'],
    isHelper: false,
  },
  find_issues: {
    category: 'issues',
    tags: ['issue', 'find', 'search', 'jql', 'query'],
    isHelper: false,
  },

  // Helper tools
  get_issue_url: {
    category: 'url-generation',
    tags: ['url', 'link', 'helper', 'issue'],
    isHelper: true,
  },
  demo: {
    category: 'demo',
    tags: ['demo', 'example', 'test'],
    isHelper: true,
  },
};

/**
 * Извлечь имя tool из содержимого файла
 */
function extractToolName(content: string): string | null {
  // Ищем строку вида: name: 'tool_name'
  const nameMatch = content.match(/name:\s*['"]([^'"]+)['"]/);
  return nameMatch ? nameMatch[1] : null;
}

/**
 * Извлечь описание tool из содержимого файла
 */
function extractToolDescription(content: string): string | null {
  // Ищем строку вида: description: 'Tool description'
  const descMatch = content.match(/description:\s*['"]([^'"]+)['"]/);
  return descMatch ? descMatch[1] : null;
}

/**
 * Проверить, есть ли уже static METADATA
 */
function hasStaticMetadata(content: string): boolean {
  return content.includes('static readonly METADATA');
}

/**
 * Добавить static METADATA в класс
 */
function addStaticMetadata(
  content: string,
  toolName: string,
  description: string,
  config: { category: string; tags: string[]; isHelper: boolean }
): string {
  // Ищем строку с определением класса
  const classMatch = content.match(/(export class \w+Tool extends BaseTool \{)/);

  if (!classMatch) {
    throw new Error('Cannot find class definition');
  }

  const tagsString = config.tags.map((t) => `'${t}'`).join(', ');

  const metadata = `
  /**
   * Статические метаданные для compile-time индексации
   */
  static readonly METADATA = {
    name: '${toolName}',
    description: '${description}',
    category: ToolCategory.${config.category.toUpperCase().replace(/-/g, '_')},
    tags: [${tagsString}],
    isHelper: ${config.isHelper},
  } as const;
`;

  // Вставляем METADATA после определения класса
  return content.replace(classMatch[1], classMatch[1] + metadata);
}

/**
 * Добавить импорт ToolCategory если его нет
 */
function ensureToolCategoryImport(content: string): string {
  // Проверяем, есть ли уже импорт ToolCategory
  if (content.includes('ToolCategory')) {
    return content;
  }

  // Ищем импорт из @mcp/tools/base
  const baseImportMatch = content.match(
    /(import\s+(?:type\s+)?{[^}]+}\s+from\s+['"]@mcp\/tools\/base[^'"]*['"];?)/
  );

  if (baseImportMatch) {
    // Добавляем ToolCategory к существующему импорту
    const oldImport = baseImportMatch[1];
    const newImport = oldImport.replace(
      /{\s*([^}]+)\s*}/,
      (match, imports) => `{ ${imports.trim()}, ToolCategory }`
    );
    return content.replace(oldImport, newImport);
  }

  // Если нет импорта из base, добавляем новый
  const firstImport = content.match(/^import\s+/m);
  if (firstImport) {
    const insertPos = firstImport.index || 0;
    const importStatement = `import { ToolCategory } from '@mcp/tools/base/index.js';\n`;
    return content.slice(0, insertPos) + importStatement + content.slice(insertPos);
  }

  return content;
}

/**
 * Обработать один tool файл
 */
async function processToolFile(filePath: string): Promise<void> {
  console.log(`\n📝 Обрабатываю: ${path.relative(process.cwd(), filePath)}`);

  // Читаем содержимое файла
  let content = fs.readFileSync(filePath, 'utf-8');

  // Проверяем, есть ли уже METADATA
  if (hasStaticMetadata(content)) {
    console.log('   ⏭️  Уже содержит static METADATA, пропускаю');
    return;
  }

  // Извлекаем имя и описание
  const toolName = extractToolName(content);
  const description = extractToolDescription(content);

  if (!toolName) {
    console.log('   ❌ Не удалось извлечь имя tool');
    return;
  }

  if (!description) {
    console.log('   ❌ Не удалось извлечь описание tool');
    return;
  }

  // Получаем конфигурацию метаданных
  const config = TOOL_METADATA_CONFIG[toolName];

  if (!config) {
    console.log(`   ❌ Нет конфигурации для tool: ${toolName}`);
    return;
  }

  console.log(`   ✅ Tool: ${toolName}`);
  console.log(`   📂 Category: ${config.category}`);
  console.log(`   🏷️  Tags: ${config.tags.join(', ')}`);

  // Добавляем импорт ToolCategory
  content = ensureToolCategoryImport(content);

  // Добавляем static METADATA
  content = addStaticMetadata(content, toolName, description, config);

  // Записываем обратно в файл
  fs.writeFileSync(filePath, content, 'utf-8');

  console.log('   💾 Сохранено');
}

/**
 * Главная функция
 */
async function main(): Promise<void> {
  console.log('🚀 Добавление static METADATA во все tools...\n');

  const toolFiles = [
    'src/mcp/tools/ping.tool.ts',
    'src/mcp/tools/helpers/demo/demo.tool.ts',
    'src/mcp/tools/api/issues/get/get-issues.tool.ts',
    'src/mcp/tools/helpers/issue-url/issue-url.tool.ts',
    'src/mcp/tools/api/issues/find/find-issues.tool.ts',
  ];

  const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const relativePath of toolFiles) {
    const fullPath = path.join(projectRoot, relativePath);

    try {
      await processToolFile(fullPath);
      processed++;
    } catch (error) {
      console.log(`   ❌ Ошибка:`, error);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Статистика:');
  console.log(`   Обработано: ${processed}`);
  console.log(`   Пропущено: ${skipped}`);
  console.log(`   Ошибок: ${errors}`);
  console.log('='.repeat(60));

  if (errors > 0) {
    console.log('\n⚠️  Обработка завершена с ошибками');
    process.exit(1);
  }

  console.log('\n✨ Готово!');
}

// Запуск
main().catch((error) => {
  console.error('❌ Необработанная ошибка:', error);
  process.exit(1);
});
