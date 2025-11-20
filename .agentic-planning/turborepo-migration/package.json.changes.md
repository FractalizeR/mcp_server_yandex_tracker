# Изменения в корневом package.json

## Скрипты которые нужно изменить

### Build команды

```json
"build": "turbo run build",
"build:mcpb": "turbo run build:mcpb",
```

### Test команды

```json
"test": "turbo run test",
"test:coverage": "turbo run test:coverage",
"test:quiet": "turbo run test:quiet",
"test:smoke": "turbo run test:smoke",
"test:verbose": "turbo run test:verbose",
"test:watch": "turbo run test:watch",
```

### Lint команды

```json
"lint": "turbo run lint",
"lint:fix": "turbo run lint:fix",
"lint:quiet": "turbo run lint:quiet",
```

### Typecheck

```json
"typecheck": "turbo run typecheck",
```

### Code quality (monorepo-wide)

```json
"cpd": "turbo run cpd",
"cpd:quiet": "turbo run cpd:quiet",
"cpd:report": "turbo run cpd:report",
"depcruise": "turbo run depcruise",
"knip": "turbo run knip",
"validate:docs": "turbo run validate:docs",
```

### Composite commands

```json
"check": "turbo run lint typecheck && npm run format:check",
"quality": "turbo run cpd depcruise knip",
"validate": "turbo run build lint typecheck test test:smoke cpd depcruise validate:docs",
"validate:quiet": "turbo run build lint:quiet typecheck test:quiet cpd:quiet depcruise validate:docs",
"validate:security": "turbo run knip && npm run audit:socket && npm run audit:lockfile && npm run audit:secrets",
```

### Обновить существующие

```json
"clean:cache": "npm cache clean --force && rimraf node_modules/.cache .turbo",
"fix": "turbo run lint:fix && npm run format",
```

## Скрипты которые нужно ДОБАВИТЬ

Для root-level задач нужно добавить корневые скрипты, которые Turborepo будет вызывать:

```json
"cpd:root": "jscpd packages/framework/*/src packages/servers/*/src || true",
"cpd:quiet:root": "jscpd packages/framework/*/src packages/servers/*/src --silent || true",
"cpd:report:root": "jscpd packages/framework/*/src packages/servers/*/src --reporters html,console",
"depcruise:root": "depcruise packages --validate",
"knip:root": "./scripts/run-knip.sh",
"validate:docs:root": "tsx scripts/validate-docs-size.ts"
```

## Скрипты которые остаются БЕЗ ИЗМЕНЕНИЙ

Следующие скрипты не меняются (они остаются через npm):

```json
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
```

## Полный пример секции scripts

```json
{
  "scripts": {
    "audit:lockfile": "npm ci --dry-run",
    "audit:secrets": "gitleaks detect --no-git --verbose --config .gitleaks.toml",
    "audit:socket": "npx --yes @socketsecurity/cli@latest audit --severity high || echo '⚠️  Socket.dev audit skipped (not logged in). Run: socket login'",
    "build": "turbo run build",
    "build:mcpb": "turbo run build:mcpb",
    "check": "turbo run lint typecheck && npm run format:check",
    "clean": "rimraf packages/framework/*/dist packages/servers/*/dist",
    "clean:all": "npm run clean && rimraf node_modules packages/framework/*/node_modules packages/servers/*/node_modules",
    "clean:cache": "npm cache clean --force && rimraf node_modules/.cache .turbo",
    "cpd": "turbo run cpd",
    "cpd:quiet": "turbo run cpd:quiet",
    "cpd:report": "turbo run cpd:report",
    "cpd:root": "jscpd packages/framework/*/src packages/servers/*/src || true",
    "cpd:quiet:root": "jscpd packages/framework/*/src packages/servers/*/src --silent || true",
    "cpd:report:root": "jscpd packages/framework/*/src packages/servers/*/src --reporters html,console",
    "depcruise": "turbo run depcruise",
    "depcruise:graph": "depcruise packages --output-type dot | dot -T svg > dependency-graph.svg",
    "depcruise:root": "depcruise packages --validate",
    "deps:audit": "npm audit --audit-level=moderate",
    "deps:check": "npx npm-check-updates -u --deep --dep dev,prod",
    "deps:outdated": "npm outdated --workspaces",
    "deps:update": "npm update --workspaces",
    "eslint:inspect": "eslint --inspect-config",
    "fix": "turbo run lint:fix && npm run format",
    "format": "npm run format:pkg && prettier --write \"packages/**/src/**/*.ts\" \"packages/**/tests/**/*.ts\" \"scripts/**/*.ts\"",
    "format:check": "prettier --check \"packages/**/src/**/*.ts\" \"packages/**/tests/**/*.ts\" \"scripts/**/*.ts\"",
    "format:pkg": "sort-package-json package.json packages/framework/*/package.json packages/servers/*/package.json",
    "knip": "turbo run knip",
    "knip:root": "./scripts/run-knip.sh",
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint:fix",
    "lint:quiet": "turbo run lint:quiet",
    "loc": "tsx scripts/cloc-summary.ts",
    "loc:by-file": "cloc packages/framework packages/servers --exclude-dir=node_modules,dist,.git --by-file",
    "loc:full": "cloc packages/framework packages/servers --exclude-dir=node_modules,dist,.git",
    "postinstall": "./scripts/install-gitleaks.sh",
    "pre-commit": "npm run validate:quiet",
    "prepare": "husky || true",
    "quality": "turbo run cpd depcruise knip",
    "reinstall": "npm run clean:all && npm install",
    "test": "turbo run test",
    "test:coverage": "turbo run test:coverage",
    "test:quiet": "turbo run test:quiet",
    "test:smoke": "turbo run test:smoke",
    "test:verbose": "turbo run test:verbose",
    "test:watch": "turbo run test:watch",
    "typecheck": "turbo run typecheck",
    "validate": "turbo run build lint typecheck test test:smoke cpd depcruise validate:docs",
    "validate:docs": "turbo run validate:docs",
    "validate:docs:root": "tsx scripts/validate-docs-size.ts",
    "validate:quiet": "turbo run build lint:quiet typecheck test:quiet cpd:quiet depcruise validate:docs",
    "validate:security": "turbo run knip && npm run audit:socket && npm run audit:lockfile && npm run audit:secrets",
    "vitest:ui": "vitest --ui --coverage"
  }
}
```
