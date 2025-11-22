#!/usr/bin/env tsx
/**
 * Валидатор размеров документации
 *
 * Проверяет соблюдение лимитов размера для документационных файлов:
 * - CLAUDE.md ≤ 400 строк
 * - ARCHITECTURE.md ≤ 700 строк
 * - Module README.md ≤ 600 строк
 * - Package README.md ≤ 600 строк
 * - tests/README.md ≤ 500 строк
 *
 * Целевые значения (SHOULD):
 * - CLAUDE.md ~350 строк
 * - ARCHITECTURE.md ~600 строк
 * - Module README.md ~500 строк
 * - Package README.md ~500 строк
 * - tests/README.md ~400 строк
 *
 * Исключения: допустимо превышение лимита на 10% при наличии
 * комментария <!-- LIMIT_EXCEPTION: причина --> в начале файла
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { globSync } from 'glob';

interface DocLimit {
  path: string;
  maxLines: number;
  targetLines: number;
  description: string;
}

const DOC_LIMITS: DocLimit[] = [
  {
    path: 'CLAUDE.md',
    maxLines: 400,
    targetLines: 350,
    description: 'Руководство для ИИ агентов',
  },
  {
    path: 'ARCHITECTURE.md',
    maxLines: 700,
    targetLines: 600,
    description: 'Архитектурная документация',
  },
];

const PACKAGE_README_LIMITS: DocLimit[] = [
  {
    path: 'packages/servers/yandex-tracker/README.md',
    maxLines: 600,
    targetLines: 500,
    description: 'Package README (User guide)',
  },
];

const TEST_README_LIMITS: DocLimit[] = [
  {
    path: 'packages/servers/yandex-tracker/tests/README.md',
    maxLines: 500,
    targetLines: 400,
    description: 'Testing documentation',
  },
];

interface ValidationResult {
  path: string;
  lines: number;
  maxLines: number;
  targetLines: number;
  status: 'ok' | 'warning' | 'error';
  message: string;
}

function countLines(filePath: string): number {
  if (!existsSync(filePath)) {
    return 0;
  }
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  // Если файл заканчивается переводом строки, split даёт пустой элемент в конце
  // Удаляем его, чтобы считать как wc -l
  if (lines[lines.length - 1] === '') {
    return lines.length - 1;
  }
  return lines.length;
}

function validateDoc(doc: DocLimit, projectRoot: string): ValidationResult {
  const fullPath = join(projectRoot, doc.path);
  const lines = countLines(fullPath);

  if (!existsSync(fullPath)) {
    return {
      path: doc.path,
      lines: 0,
      maxLines: doc.maxLines,
      targetLines: doc.targetLines,
      status: 'error',
      message: `Файл не найден: ${doc.path}`,
    };
  }

  // Критическое превышение: больше чем лимит + 20%
  const criticalThreshold = Math.floor(doc.maxLines * 1.2);
  if (lines > criticalThreshold) {
    return {
      path: doc.path,
      lines,
      maxLines: doc.maxLines,
      targetLines: doc.targetLines,
      status: 'error',
      message: `Критическое превышение: ${lines}/${doc.maxLines} строк (лимит) | ${criticalThreshold} критический порог`,
    };
  }

  // Превышение лимита: warning
  if (lines > doc.maxLines) {
    return {
      path: doc.path,
      lines,
      maxLines: doc.maxLines,
      targetLines: doc.targetLines,
      status: 'warning',
      message: `Превышен лимит: ${lines}/${doc.maxLines} строк (+${lines - doc.maxLines})`,
    };
  }

  // Превышение целевого значения: warning
  if (lines > doc.targetLines) {
    return {
      path: doc.path,
      lines,
      maxLines: doc.maxLines,
      targetLines: doc.targetLines,
      status: 'warning',
      message: `Рекомендуется сократить: ${lines}/${doc.targetLines} строк (цель) | ${lines}/${doc.maxLines} строк (лимит)`,
    };
  }

  return {
    path: doc.path,
    lines,
    maxLines: doc.maxLines,
    targetLines: doc.targetLines,
    status: 'ok',
    message: `OK: ${lines}/${doc.targetLines} строк (цель) | ${lines}/${doc.maxLines} строк (лимит)`,
  };
}

function validateModuleReadmes(projectRoot: string): ValidationResult[] {
  const readmePattern = 'src/**/README.md';
  const readmePaths = globSync(readmePattern, { cwd: projectRoot });

  return readmePaths.map((relativePath) => {
    const fullPath = join(projectRoot, relativePath);
    const lines = countLines(fullPath);
    const maxLines = 600;
    const targetLines = 500;

    // Критическое превышение: больше чем лимит + 20%
    const criticalThreshold = Math.floor(maxLines * 1.2);
    if (lines > criticalThreshold) {
      return {
        path: relativePath,
        lines,
        maxLines,
        targetLines,
        status: 'error',
        message: `Критическое превышение: ${lines}/${maxLines} строк (лимит) | ${criticalThreshold} критический порог`,
      };
    }

    // Превышение лимита: warning
    if (lines > maxLines) {
      return {
        path: relativePath,
        lines,
        maxLines,
        targetLines,
        status: 'warning',
        message: `Превышен лимит: ${lines}/${maxLines} строк (+${lines - maxLines})`,
      };
    }

    // Превышение целевого значения: warning
    if (lines > targetLines) {
      return {
        path: relativePath,
        lines,
        maxLines,
        targetLines,
        status: 'warning',
        message: `Рекомендуется сократить: ${lines}/${targetLines} строк (цель) | ${lines}/${maxLines} строк (лимит)`,
      };
    }

    return {
      path: relativePath,
      lines,
      maxLines,
      targetLines,
      status: 'ok',
      message: `OK: ${lines}/${targetLines} строк (цель) | ${lines}/${maxLines} строк (лимит)`,
    };
  });
}

function printResults(results: ValidationResult[]): void {
  const errors = results.filter((r) => r.status === 'error');
  const warnings = results.filter((r) => r.status === 'warning');
  const ok = results.filter((r) => r.status === 'ok');

  console.log('\n📋 Проверка размеров документации\n');

  if (errors.length > 0) {
    console.log('❌ Ошибки (превышен лимит):');
    errors.forEach((r) => {
      console.log(`  ${r.path}: ${r.message}`);
    });
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('⚠️  Предупреждения (превышена цель):');
    warnings.forEach((r) => {
      console.log(`  ${r.path}: ${r.message}`);
    });
    console.log('');
  }

  if (ok.length > 0) {
    console.log('✅ Соответствуют требованиям:');
    ok.forEach((r) => {
      console.log(`  ${r.path}: ${r.message}`);
    });
    console.log('');
  }

  console.log(
    `Итого: ${errors.length} ошибок, ${warnings.length} предупреждений, ${ok.length} OK\n`
  );
}

function findMonorepoRoot(startPath: string): string | null {
  let currentPath = startPath;

  // Ищем package.json с workspaces или именем mcp-framework-monorepo
  while (currentPath !== '/') {
    const packageJsonPath = join(currentPath, 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        if (packageJson.workspaces || packageJson.name === 'mcp-framework-monorepo') {
          return currentPath;
        }
      } catch {
        // Ignore JSON parse errors
      }
    }
    const parentPath = join(currentPath, '..');
    if (parentPath === currentPath) break;
    currentPath = parentPath;
  }

  return null;
}

function main(): void {
  const cwd = process.cwd();
  const monorepoRoot = findMonorepoRoot(cwd);

  // Проверяем основные документы (только из корня monorepo)
  const mainDocsResults =
    monorepoRoot && cwd === monorepoRoot
      ? DOC_LIMITS.map((doc) => validateDoc(doc, monorepoRoot))
      : [];

  // Проверяем Package READMEs (только из корня monorepo)
  const packageReadmeResults =
    monorepoRoot && cwd === monorepoRoot
      ? PACKAGE_README_LIMITS.map((doc) => validateDoc(doc, monorepoRoot))
      : [];

  // Проверяем Test READMEs (только из корня monorepo)
  const testReadmeResults =
    monorepoRoot && cwd === monorepoRoot
      ? TEST_README_LIMITS.map((doc) => validateDoc(doc, monorepoRoot))
      : [];

  // Проверяем README файлы модулей (из текущей директории)
  const moduleReadmesResults = validateModuleReadmes(cwd);

  // Объединяем результаты
  const allResults = [
    ...mainDocsResults,
    ...packageReadmeResults,
    ...testReadmeResults,
    ...moduleReadmesResults,
  ];

  // Выводим результаты только если есть что показывать
  if (allResults.length > 0) {
    printResults(allResults);
  } else {
    console.log('\n📋 Нет файлов для проверки в текущей директории\n');
  }

  // Выходим с кодом ошибки, если есть ошибки
  const hasErrors = allResults.some((r) => r.status === 'error');
  if (hasErrors) {
    process.exit(1);
  }
}

main();
