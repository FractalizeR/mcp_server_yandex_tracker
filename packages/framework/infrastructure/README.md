# @mcp-framework/infrastructure

**Reusable infrastructure layer: HTTP, cache, logging, async utilities**

[![npm version](https://img.shields.io/npm/v/@mcp-framework/infrastructure.svg)](https://www.npmjs.com/package/@mcp-framework/infrastructure)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 Purpose

**Principle:** Infrastructure layer does NOT know about domain (Yandex.Tracker, MCP)

**Reusability:** All components can be used in other projects without modifications

**Architecture rule:** Infrastructure does NOT import domain-specific code

---

## 📦 Installation

```bash
npm install @mcp-framework/infrastructure
```

**Dependencies:** 0 framework dependencies (only external libs: axios, pino, rotating-file-stream)

---

## 📁 Structure

```
src/
├── http/                    # HTTP client + retry + error mapping
│   ├── client/
│   │   └── http-client.ts  # Axios wrapper
│   ├── retry/
│   │   ├── retry-handler.ts
│   │   └── exponential-backoff.strategy.ts
│   └── error/
│       └── error-mapper.ts # AxiosError → ApiError
├── cache/                   # Caching (Strategy Pattern)
│   ├── cache-manager.interface.ts
│   ├── entity-cache-key.ts # Cache key generator for entities
│   └── no-op-cache.ts      # Null Object
├── async/                   # Parallel execution
│   └── parallel-executor.ts # Throttling for batch requests
├── logging/                 # Production logging (Pino)
│   └── README.md           # Detailed docs
├── config.ts                # Configuration from env
├── constants.ts             # @deprecated (will be removed in v3.0)
├── types.ts                 # Type definitions
└── index.ts                 # Public exports
```

---

## 🔧 Components

### HTTP Layer

**AxiosHttpClient** (alias `HttpClient`) — Axios wrapper with built-in retry and error mapping

**Key features:**
- ✅ Automatic retry via `RetryHandler`
- ✅ `AxiosError` → `ApiError` mapping
- ✅ Request/response logging via interceptors
- ✅ Type-safe generic methods: `get<T>()`, `post<T>()`, `patch<T>()`, `delete<T>()`

**Implementation:** [src/http/client/axios-http-client.ts](src/http/client/axios-http-client.ts)

**Interface:**
```typescript
interface IHttpClient {
  get<T>(path: string, params?: QueryParams): Promise<T>;
  post<T>(path: string, data?: unknown): Promise<T>;
  patch<T>(path: string, data?: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
}
```

### Caching

**CacheManager** — interface (Strategy Pattern)

**Implementations:**
- `NoOpCache` — Null Object (cache disabled by default)
- `EntityCacheKey` — generates cache keys for entities (e.g., `issue:PROJ-123`)

**Details:** [src/cache/](src/cache/)

**Interface:**
```typescript
interface CacheManager {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

### Parallel Execution

**ParallelExecutor** — executes batch operations with concurrency control (using `p-limit`)

**Configuration:**
- `maxBatchSize` (business limit, default: 200)
- `maxConcurrentRequests` (technical limit, default: 5)

**Features:**
- ✅ Validates batch size before execution
- ✅ Uses `p-limit` for concurrency control
- ✅ Logs metrics (success/error counts, duration)
- ✅ Returns typed `BatchResult<TKey, TValue>`

**Implementation:** [src/async/parallel-executor.ts](src/async/parallel-executor.ts)

**Method signature:**
```typescript
async executeParallel<TKey, TValue>(
  operations: Array<{ key: TKey; fn: () => Promise<TValue> }>,
  operationName?: string
): Promise<BatchResult<TKey, TValue>>
```

### Logging

**Pino logger** — production-ready structured logging with rotation

**Key features:**
- ✅ Structured JSON logs
- ✅ Automatic rotation (daily + size-based → `.gz` archives)
- ✅ Dual output (errors → stderr + file, info/debug → file only)
- ✅ Child loggers for request tracing

**Configuration ENV vars:**
- `LOGS_DIR`, `LOG_LEVEL`, `PRETTY_LOGS`, `LOG_MAX_SIZE`, `LOG_MAX_FILES`

**Full documentation:** [src/logging/README.md](src/logging/README.md)

**Function signature:**
```typescript
function createLogger(config: LoggerConfig): Logger
```

### Configuration

**loadConfig()** — loads and validates environment variables

**Validation:**
- ✅ Required: `YANDEX_TRACKER_TOKEN`, `YANDEX_ORG_ID`
- ✅ Value ranges (timeout: 5000-120000ms, batchSize: 1-1000)
- ✅ Defaults for all optional parameters
- ✅ Returns type-safe `ServerConfig` interface

**Note:** This function contains Yandex.Tracker-specific logic and is `@deprecated` for v3.0 (will move to domain package).

**Implementation:** [src/config.ts](src/config.ts)

**Signature:**
```typescript
function loadConfig(): ServerConfig
```

---

## 🚨 Critical Rules

### 1. Infrastructure does NOT know about domain

```typescript
// ❌ FORBIDDEN (domain import)
import { Issue } from 'your-domain/entities/issue.js';

// ✅ CORRECT (generic types)
class HttpClient {
  async get<T>(url: string): Promise<T> { ... }
}
```

### 2. Use config for all parameters

```typescript
// ❌ FORBIDDEN (hardcoded values)
const timeout = 30000;

// ✅ CORRECT (from config)
const timeout = config.requestTimeout;
```

### 3. Retry is built into HttpClient

```typescript
// ✅ Retry works automatically
const client = new HttpClient(config, logger, retryHandler);
await client.get('/api/endpoint'); // Auto-retry on error
```

### 4. All errors are mapped to ApiError

```typescript
// ✅ HttpClient automatically maps AxiosError → ApiError
try {
  await client.get('/api/not-found');
} catch (error) {
  // error: ApiError (not AxiosError)
  console.error(error.statusCode, error.message);
}
```

---

## 📖 API Reference

### Exports

```typescript
// HTTP
export { HttpClient } from './http/client/http-client.js';
export { RetryHandler } from './http/retry/retry-handler.js';
export { ExponentialBackoffStrategy } from './http/retry/exponential-backoff.strategy.js';
export { ErrorMapper } from './http/error/error-mapper.js';

// Cache
export type { CacheManager } from './cache/cache-manager.interface.js';
export { NoOpCache } from './cache/no-op-cache.js';
export { EntityCacheKey, EntityType } from './cache/entity-cache-key.js';

// Async
export { ParallelExecutor } from './async/parallel-executor.js';

// Logging
export { createLogger } from './logging/logger.js';

// Config
export { loadConfig } from './config.js';
export type { ServerConfig } from './types.js';

// Types
export type { ApiError, BatchResult } from './types.js';

// Constants (deprecated, will be removed in v3.0)
export * from './constants.js';
```

---

## 🧪 Testing

**Run tests:**
```bash
cd packages/framework/infrastructure
npm run test
```

**With coverage:**
```bash
npm run test:coverage
```

**Watch mode:**
```bash
npm run test:watch
```

---

## 🤝 Contributing

See [../../.github/CONTRIBUTING.md](../../.github/CONTRIBUTING.md)

**Architecture rules:** [../../CLAUDE.md](../../CLAUDE.md)

---

## 📄 License

MIT License

---

## 🔗 Links

- **Monorepo root:** [../../README.md](../../README.md)
- **Architecture:** [../../ARCHITECTURE.md](../../ARCHITECTURE.md)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)
