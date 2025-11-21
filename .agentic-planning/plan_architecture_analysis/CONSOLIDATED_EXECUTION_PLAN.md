# Consolidated Execution Plan - Architecture Analysis

**Дата создания:** 2025-11-21
**Статус:** ✅ УТВЕРЖДЕНО - Сценарий 3 (Full Refactoring)
**Последнее обновление:** 2025-11-21

---

## 📊 Executive Summary

**Всего задач:** 32 задачи
- 🔴 Critical: 4 задачи (16-22 часа)
- 🟡 Important: 15 задач (23-39 часов)
- 🟢 Nice to have: 13 задач (14-24 часа)

**Общее время:**
- Sequential: 53-85 часов (~7-11 дней)
- Parallel (оптимальное): 28-45 часов (~4-6 дней)
- **ВЫБРАНО:** Full Refactoring с максимальной параллелизацией (45-63ч работы агентов, 8-10 дней)

**Фазы:** 5 фаз (Phase 0 - подготовка, Phase 1-4 - выполнение)

**Критические зависимости:**
1. 🔴 Infrastructure extraction - БЛОКИРУЕТ все Framework улучшения
2. 🔴 YandexTrackerFacade рефакторинг - БЛОКИРУЕТ Yandex-Tracker Phase 2
3. 🔴 ToolRegistry refactoring - зависит от Infrastructure extraction

**✅ РЕШЕНИЯ PHASE 0 (ПРИНЯТЫ ПОЛЬЗОВАТЕЛЕМ):**
- ✅ **Сценарий:** Full Refactoring (Сценарий 3) - делаем ВСЕ задачи
- ✅ **Infrastructure extraction (F1.1):** ДЕЛАЕМ - разблокирует Framework улучшения
- ✅ **YandexTrackerFacade (Y2.1):** ДЕЛАЕМ - сначала создать план (Этап 0), потом выполнить
- ✅ **ToolRegistry refactoring (F2.1):** ДЕЛАЕМ - после Infrastructure extraction
- ✅ **Параллелизация:** Максимальная (3+ агентов где возможно)
- ✅ **Phase 1B, 2, 3, 4:** Все задачи выполняем
- 📋 **Промпты для запуска:** См. SESSION_START_PROMPTS.md

---

## 🗺️ Unified Dependency Graph

```
┌────────────────────────────────────────────────────────────────┐
│ Phase 0: Prerequisites & Planning                              │
│ ⚠️ YandexTrackerFacade рефакторинг не запланирован!           │
│ Action: Создать план или интегрировать сюда                    │
└───────────────────────┬────────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌──────────────────────┐    ┌─────────────────────────────────┐
│ Phase 1A: CRITICAL   │    │ Phase 1B: Independent Quick Wins│
│ (SEQUENTIAL)         │    │ (PARALLEL - пока идет 1A)       │
│                      │    │                                 │
│ 🔴 [F1.1] Extract    │    │ Yandex-Tracker:                 │
│   domain code from   │    │ 🟡 [Y1.1] Entity factories (2-4h)│
│   infrastructure     │    │ 🟡 [Y1.2] CLI BaseConnector (4-6h)│
│   6-8h | BLOCKER     │    │ 🟢 [Y1.3] DI validation (1h)    │
│                      │    │                                 │
│                      │    │ Test Coverage:                  │
│                      │    │ 🟡 [T1.1] ZodJsonSchema (2h)    │
│                      │    │ 🟡 [T1.2] ToolSearch (2h)       │
│                      │    │ 🟡 [T1.3] HttpClient (1.5h)     │
│                      │    │ 🟡 [T1.4] Smoke tests (2h)      │
│                      │    │ 🟡 [T1.5] Logger tests (1h)     │
│                      │    │ 🟢 [T1.6] Branches (0.5h)       │
│                      │    │                                 │
│                      │    │ Code Quality (Low priority):    │
│                      │    │ 🟡 [Q1.1] Type safety (2-3h)    │
│                      │    │ 🟡 [Q1.2] Logger extract (2-3h) │
│                      │    │ 🟡 [Q1.3] setupServer (2-3h)    │
│                      │    │ 🟡 [Q1.4] Schema opt (1-2h)     │
│                      │    │ 🟢 [Q1.5] Minor fixes (0.5h)    │
└──────────┬───────────┘    └─────────────────────────────────┘
           │ UNBLOCKS
           ▼
┌────────────────────────────────────────────────────────────────┐
│ Phase 2: Architecture Foundation (SEQUENTIAL)                  │
│                                                                 │
│ 🔴 [F2.1] Refactor ToolRegistry                   4-6h         │
│   └─ Depends on: F1.1 (infrastructure extraction)              │
│                                                                 │
│ 🟡 [F2.2] Move generated-index to yandex-tracker  1-2h         │
│   └─ Depends on: F1.1                                          │
│                                                                 │
│ 🟡 [F2.3] Add HttpClient interface                2-3h         │
│   └─ Can run parallel with F2.1, F2.2                          │
│                                                                 │
│ 🔴 [Y2.1] YandexTrackerFacade рефакторинг         TBD          │
│   └─ ⚠️ PLAN MISSING! Needs creation                           │
└───────────────────────┬────────────────────────────────────────┘
                        │ UNBLOCKS
                        ▼
┌────────────────────────────────────────────────────────────────┐
│ Phase 3: Post-Architecture Improvements (PARALLEL after Ph2)   │
│                                                                 │
│ Yandex-Tracker:                                                │
│ 🟢 [Y3.1] Entity factories review (1-2h, если нужно)           │
│   └─ Depends on: Y2.1 (Facade рефакторинг)                     │
│                                                                 │
│ Test Coverage:                                                 │
│ 🟡 [T3.1] DI Container integration tests (2h)                  │
│   └─ Depends on: Y2.1 (Facade рефакторинг)                     │
│                                                                 │
│ Framework (Nice-to-have):                                      │
│ 🟢 [F3.1] DRY text utils (0.5h)                                │
│ 🟢 [F3.2] Better LRU cache (1-2h)                              │
└────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────────────┐
│ Phase 4: Polish & Documentation (OPTIONAL)                     │
│                                                                 │
│ 🟢 [T4.1] Optimize test code (3h)                              │
│ 🟢 [T4.2] Performance monitoring (2h)                          │
│ 🟢 [T4.3] Test documentation (1h)                              │
│ 🟢 [DOC] Documentation updates                                 │
│ 🟢 [DOC] Final code quality pass                               │
└────────────────────────────────────────────────────────────────┘
```

**Legend:**
- F = Framework packages (2.1)
- Y = Yandex-Tracker (2.2)
- Q = Code Quality (2.3)
- T = Test Coverage (2.4)

---

## 📋 Execution Phases

### Phase 0: Prerequisites & Planning

**Duration:** 1-2 hours
**Can start:** Immediately
**Status:** ✅ COMPLETED (2025-11-21)

#### Tasks

- [x] **Review YandexTrackerFacade status**
  - ✅ **РЕШЕНИЕ:** Создать детальный план рефакторинга в Этапе 0 (см. SESSION_START_PROMPTS.md)
  - ✅ YandexTrackerFacade (1080 строк) будет отрефакторен согласно новому плану
  - ✅ План будет создан ПЕРВЫМ ДЕЛОМ перед началом выполнения

- [x] **Prioritize critical path**
  - ✅ Infrastructure extraction (F1.1) - **MUST DO** (Этап 1)
  - ✅ ToolRegistry refactoring (F2.1) - **MUST DO** (Phase 2, после F1.1)
  - ✅ YandexTrackerFacade (Y2.1) - **MUST DO** (Phase 2, отдельный подэтап)

- [x] **Decide on parallelization strategy**
  - ✅ **ВЫБРАНО:** Максимальная параллелизация (3+ агентов)
  - ✅ Phase 1B: 3 агента параллельно
  - ✅ Phase 2: 1-2 агента (некоторые задачи параллельно)

#### Deliverables

- ✅ Decision on YandexTrackerFacade: Создать план, потом выполнить
- ✅ Finalized task priorities: Full Refactoring (Сценарий 3)
- ✅ Execution strategy: Максимальная параллелизация
- ✅ **SESSION_START_PROMPTS.md** создан с готовыми промптами

---

### Phase 1A: Critical Foundation (SEQUENTIAL)

**Duration:** 6-8 hours
**Can start:** After Phase 0 decisions
**Must run sequentially:** YES (blocks everything else)

#### [F1.1] Extract Domain Code from Infrastructure

**Priority:** 🔴 CRITICAL
**Effort:** 6-8 hours
**Impact:** HIGH
**Source:** 2.1 Framework Packages Analysis

**Problem:**
- Infrastructure package contains Yandex-Tracker domain code
- Blocks reusability of framework packages
- Violates package boundaries

**Solution:**
- Move `config.ts` (372 lines) → yandex-tracker
- Move domain-specific constants → yandex-tracker
- Move `entity-cache-key.ts` (46 lines) → yandex-tracker or make generic
- Keep only generic types/utils in infrastructure

**Steps:**
1. Create new files in yandex-tracker/src/config (1-2h)
2. Update infrastructure (remove domain code) (1-2h)
3. Update imports across yandex-tracker (2-3h)
4. Update tests (1-2h)
5. Validate: `npm run validate:quiet` (30min)

**Success Criteria:**
- [ ] No grep hits for "yandex|tracker|issue|queue" in infrastructure/src
- [ ] Infrastructure builds without domain code
- [ ] Yandex-tracker uses local config
- [ ] All tests pass

**Blocks:**
- F2.1 (ToolRegistry refactoring)
- F2.2 (Move generated-index)
- Q2.1 (ToolRegistry from Code Quality perspective)

**Related Files:**
- [2.1 Framework Execution Plan](./results/2.1_framework_execution_plan.md) - Phase 1

---

### Phase 1B: Independent Quick Wins (PARALLEL)

**Duration:** 13-22 hours total (can do 7-11h if full parallel)
**Can start:** Immediately (while Phase 1A is running or waiting)
**Can run in parallel:** YES

**Strategy:** Группы задач можно распределить между разными агентами/разработчиками

---

#### Group 1: Yandex-Tracker Improvements

**Total:** 7-11 hours
**Can run:** Fully independent from Phase 1A

##### [Y1.1] Check and Split Entity Factories

**Priority:** 🟡 IMPORTANT
**Effort:** 2-4 hours
**Impact:** MEDIUM
**Source:** 2.2 Yandex-Tracker Analysis

**Steps:**
1. Measure size of `entity.factories.ts`
2. If >500 lines:
   - Split by domain: issue.factory.ts, comment.factory.ts, etc.
   - Update imports
   - Test

**Success Criteria:**
- [ ] Each factory file <500 lines
- [ ] All tests pass

**Blocks:** Nothing

---

##### [Y1.2] Create CLI BaseConnector (DRY)

**Priority:** 🟡 IMPORTANT (merges Q1.0 and Y1.2)
**Effort:** 4-6 hours
**Impact:** HIGH
**Source:** 2.3 Code Quality + 2.2 Yandex-Tracker

**Problem:**
- 12 code clones in CLI connectors
- ~200 lines of duplication

**Solution:**
```typescript
// packages/servers/yandex-tracker/src/cli/connectors/base/base-connector.ts
export abstract class BaseConnector {
  abstract getConfigPath(): string;
  abstract getDefaultConfig(): unknown;
  async readConfig(): Promise<unknown> { /* common */ }
  async writeConfig(config: unknown): Promise<void> { /* common */ }
  // ... other common methods
}
```

**Steps:**
1. Create BaseConnector class (2h)
2. Refactor 5 existing connectors (2-3h)
3. Tests and validation (1h)

**Expected Result:**
- Reduced from ~750 lines to ~350 lines
- Single source of truth

**Success Criteria:**
- [ ] BaseConnector implemented
- [ ] All 5 connectors refactored
- [ ] All CLI tests pass
- [ ] Duplication reduced by >50%

**Blocks:** Nothing

---

##### [Y1.3] Add DI Registration Validation

**Priority:** 🟢 NICE TO HAVE
**Effort:** 1 hour
**Impact:** LOW-MEDIUM
**Source:** 2.2 Yandex-Tracker Analysis

**Steps:**
1. In `bindOperations()` check class extends BaseOperation
2. In `bindTools()` check class extends BaseTool
3. Throw clear error at startup if invalid

**Success Criteria:**
- [ ] Validation added
- [ ] Tests cover invalid registration
- [ ] Error messages are clear

**Blocks:** Nothing

---

#### Group 2: Test Coverage Improvements

**Total:** 9-10.5 hours
**Can run:** Fully independent

##### [T1.1] ZodJsonSchemaAdapter Tests

**Priority:** 🟡 IMPORTANT
**Effort:** 2 hours
**Impact:** HIGH (53% → 95% coverage)
**Source:** 2.4 Test Coverage Analysis

**Add tests for:**
- All Zod primitive types
- Zod modifiers (optional, nullable, default)
- Complex types (array, object, union)
- Edge cases

**File:** `packages/framework/core/tests/definition/zod-json-schema-adapter.extended.test.ts`

**Success Criteria:**
- [ ] Coverage ≥95%
- [ ] All major code paths tested

---

##### [T1.2] ToolSearchEngine Tests

**Priority:** 🟡 IMPORTANT
**Effort:** 2 hours
**Impact:** HIGH (71% → 95% coverage)
**Source:** 2.4 Test Coverage Analysis

**Add tests for:**
- Search strategies (exact, fuzzy, name, description)
- Edge cases (empty query, special chars, no results)
- Performance scenarios
- Error handling

**File:** `packages/framework/search/tests/engine/tool-search-engine.extended.test.ts`

**Success Criteria:**
- [ ] Coverage ≥95%
- [ ] All strategies tested

---

##### [T1.3] HttpClient Tests

**Priority:** 🟡 IMPORTANT
**Effort:** 1.5 hours
**Impact:** MEDIUM (69% → 90% coverage)
**Source:** 2.4 Test Coverage Analysis

**Add tests for:**
- Retry logic (success after retry, exhausted retries)
- Timeout scenarios
- Error handling (network, HTTP 4xx/5xx)
- Headers & auth

**File:** `packages/framework/infrastructure/tests/http/client/http-client.extended.test.ts`

**Success Criteria:**
- [ ] Coverage ≥90%
- [ ] All retry paths tested

---

##### [T1.4] Add Smoke Tests

**Priority:** 🟡 IMPORTANT
**Effort:** 2 hours
**Impact:** HIGH (critical paths coverage)
**Source:** 2.4 Test Coverage Analysis

**Create 5 smoke test files:**
1. `mcp-server-lifecycle.smoke.test.ts` - server startup/shutdown (30min)
2. `api-connectivity.smoke.test.ts` - real API connectivity (30min)
3. `e2e-tool-execution.smoke.test.ts` - end-to-end tool flow (30min)
4. `tool-search.smoke.test.ts` - search integration (20min)
5. `di-container.smoke.test.ts` - DI resolution (20min)

**Success Criteria:**
- [ ] 5 smoke test files created
- [ ] All critical paths covered
- [ ] Tests can run in CI

---

##### [T1.5] Logger Tests

**Priority:** 🟡 IMPORTANT
**Effort:** 1 hour
**Impact:** MEDIUM (75% → 90% coverage)
**Source:** 2.4 Test Coverage Analysis

**Add tests for:**
- Log levels (trace, fatal, filtering)
- Formatting (pretty print, JSON)
- Child loggers (context inheritance)
- Error scenarios

**File:** `packages/framework/infrastructure/tests/logging/logger.extended.test.ts`

**Success Criteria:**
- [ ] Coverage ≥90%

---

##### [T1.6] Core Branches Coverage

**Priority:** 🟢 NICE TO HAVE
**Effort:** 30 minutes
**Impact:** LOW (84.9% → 85%+ branches)
**Source:** 2.4 Test Coverage Analysis

**Add tests for:**
- Branch conditions in ZodJsonSchemaAdapter
- Error branches
- Edge cases in type conversions

**Success Criteria:**
- [ ] Branches coverage ≥85%

---

#### Group 3: Code Quality Improvements (Lower Priority)

**Total:** 8-12 hours
**Can run:** Independent, but lower priority than Groups 1-2

##### [Q1.1] Type Safety Improvements

**Priority:** 🟡 IMPORTANT
**Effort:** 2-3 hours
**Impact:** MEDIUM
**Source:** 2.3 Code Quality Analysis

**Problem 1:** ApiError casts without type guard (10 places)

**Solution:**
```typescript
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
```

**Problem 2:** Double casting (5 places)

**Solution:** Add type guards for ToolWithMetadata, etc.

**Success Criteria:**
- [ ] Type guards added
- [ ] All 15 unsafe casts replaced
- [ ] Tests updated

---

##### [Q1.2] Extract Methods in createPinoLogger

**Priority:** 🟡 IMPORTANT
**Effort:** 2-3 hours
**Impact:** MEDIUM (137 lines → ~50 lines, complexity 18 → 8)
**Source:** 2.3 Code Quality Analysis

**Steps:**
1. Extract transport creators (1.5h)
2. Simplify main method (0.5h)
3. Tests (1h)

**Success Criteria:**
- [ ] Main method <50 lines
- [ ] Complexity <10
- [ ] Tests pass

---

##### [Q1.3] Refactor setupServer

**Priority:** 🟡 IMPORTANT
**Effort:** 2-3 hours
**Impact:** MEDIUM (214 lines → ~30 lines main)
**Source:** 2.3 Code Quality Analysis

**Steps:**
1. Extract phases (validateEnvironment, setupLogging, etc.) (2h)
2. Tests for each phase (1h)

**Success Criteria:**
- [ ] Main function <30 lines
- [ ] Each phase <40 lines
- [ ] Testable in isolation

---

##### [Q1.4] Schema Optimizations

**Priority:** 🟢 NICE TO HAVE
**Effort:** 1-2 hours
**Impact:** LOW-MEDIUM (reduces ~70 lines duplication)
**Source:** 2.3 Code Quality Analysis

**Solution:**
```typescript
// Use Zod .partial() or base schema + extend
export const UpdateProjectSchema = CreateProjectSchema.partial();
```

**Affected:** Project (41 lines), Checklist (27 lines), Board (19 lines)

**Success Criteria:**
- [ ] Duplication reduced by 50-70 lines
- [ ] Tests pass

---

##### [Q1.5] Minor Fixes

**Priority:** 🟢 LOW
**Effort:** 30 minutes
**Impact:** LOW
**Source:** 2.3 Code Quality Analysis

**Fixes:**
- Remove unused ESLint directives (3 places)
- Fix no-identical-expressions (1 place)
- Fix nested template literals (2 places)

**Success Criteria:**
- [ ] All 6 warnings fixed

---

### Phase 1B Summary

**Total Effort:** 13-22 hours (sequential) or 7-11 hours (parallel)

**Parallel Execution Strategy:**

| Agent/Dev | Tasks | Time |
|-----------|-------|------|
| **Agent 1: Yandex-Tracker** | Y1.1, Y1.2, Y1.3 | 7-11h |
| **Agent 2: Test Coverage** | T1.1, T1.2, T1.3, T1.4, T1.5, T1.6 | 9-10.5h |
| **Agent 3: Code Quality** | Q1.1, Q1.2, Q1.3, Q1.4, Q1.5 | 8-12h |

**Phase 1B wall time (if parallel):** ~9-12 hours (longest branch)

**Can run while Phase 1A is in progress:** YES (fully independent)

---

## Phase 2: Architecture Foundation (SEQUENTIAL)

**Duration:** 11-19 hours (+ TBD for Y2.1)
**Can start:** After Phase 1A completion
**Must run sequentially:** YES (architectural changes, high conflict risk)

### [F2.1] Refactor ToolRegistry

**Priority:** 🔴 CRITICAL
**Effort:** 4-6 hours
**Impact:** HIGH (549 lines → 150-200 lines, complexity 28 → 12)
**Source:** 2.1 Framework + 2.3 Code Quality
**Depends on:** F1.1 (Infrastructure extraction)

**Problem:**
- God Object (549 lines)
- High complexity (cognitive 28, cyclomatic 17)
- Multiple responsibilities

**Proposed Structure:**
```
packages/framework/core/src/tool-registry/
├── tool-registry.ts           (~150 lines)
├── tool-filter.service.ts     (~150 lines)
├── tool-sorter.ts             (~80 lines)
├── types.ts                   (~50 lines)
└── index.ts
```

**Steps:**
1. Create new files and directory structure (30min)
2. Extract ToolFilterService (2-3h)
3. Extract ToolSorter (1h)
4. Update ToolRegistry (delegate to services) (1-2h)
5. Update tests (1h)
6. Validate (30min)

**Success Criteria:**
- [ ] tool-registry.ts <250 lines
- [ ] ToolFilterService <200 lines
- [ ] ToolSorter <100 lines
- [ ] All tests pass
- [ ] No functionality lost

**Blocks:** Nothing (this is the end of critical path for Framework)

---

### [F2.2] Move generated-index to Yandex-Tracker

**Priority:** 🟡 IMPORTANT
**Effort:** 1-2 hours
**Impact:** MEDIUM (reusability)
**Source:** 2.1 Framework
**Depends on:** F1.1 (Infrastructure cleanup)

**Steps:**
1. Move file (15min)
2. Update search/src/index.ts (5min)
3. Update yandex-tracker composition-root (30min)
4. Update generation script (30min)
5. Validate (15min)

**Success Criteria:**
- [ ] Search package builds without domain index
- [ ] Yandex-tracker uses local index
- [ ] Search can still be used with dynamic index
- [ ] All tests pass

**Can run parallel with:** F2.1 (different files)

---

### [F2.3] Add HttpClient Interface

**Priority:** 🟡 IMPORTANT
**Effort:** 2-3 hours
**Impact:** MEDIUM (testability, DIP compliance)
**Source:** 2.1 Framework

**Steps:**
1. Create IHttpClient interface (30min)
2. Rename class to AxiosHttpClient (15min)
3. Update exports (5min)
4. Update yandex-tracker to use interface (1h)
5. Add mock for tests (30min)
6. Validate (30min)

**Success Criteria:**
- [ ] IHttpClient interface defined
- [ ] AxiosHttpClient implements IHttpClient
- [ ] Yandex-tracker uses interface type
- [ ] MockHttpClient available for tests
- [ ] All tests pass

**Can run parallel with:** F2.1, F2.2 (different files)

---

### [Y2.1] YandexTrackerFacade Refactoring

**Priority:** 🔴 CRITICAL (if doing Yandex-Tracker improvements)
**Effort:** TBD (plan missing!)
**Impact:** HIGH (1080 lines God Object)
**Source:** 2.2 Yandex-Tracker Analysis

**Status:** ⚠️ **PLAN MISSING**

**Options:**
1. **Create separate plan** `plan_architecture_refactoring/1.1`
   - Detailed design for Facade split
   - Break into smaller services/classes
   - Migration strategy

2. **Add to this consolidated plan**
   - Design Facade split here
   - Execute as part of Phase 2

3. **Postpone** (focus on other improvements first)
   - Do Phase 1 and 3 improvements
   - Leave Facade for later

**⚠️ DECISION REQUIRED FROM USER**

**Blocks:**
- Y3.1 (Entity factories review after Facade)
- T3.1 (DI Container tests after Facade)

---

## Phase 3: Post-Architecture Improvements (PARALLEL)

**Duration:** 3.5-5 hours
**Can start:** After Phase 2 completion
**Can run in parallel:** YES (after dependencies resolved)

### [Y3.1] Entity Factories Review

**Priority:** 🟢 NICE TO HAVE
**Effort:** 1-2 hours
**Impact:** LOW-MEDIUM
**Source:** 2.2 Yandex-Tracker
**Depends on:** Y2.1 (Facade рефакторинг, если он был)

**When:** Only if Facade рефакторинг affected entities

**Success Criteria:**
- [ ] Entities still work correctly
- [ ] Factories updated if needed

---

### [T3.1] DI Container Integration Tests

**Priority:** 🟡 IMPORTANT
**Effort:** 2 hours
**Impact:** MEDIUM (architecture confidence)
**Source:** 2.4 Test Coverage
**Depends on:** Y2.1 (Facade рефакторинг)

**File:** `packages/servers/yandex-tracker/tests/composition-root/di-integration.test.ts`

**Tests:**
- All service/operation/tool tokens resolve
- No circular dependencies
- Singletons return same instance
- Lifecycle management works
- Error on missing dependency

**Success Criteria:**
- [ ] ~15 tests added
- [ ] All DI resolution paths covered

---

### [F3.1] DRY Text Utils

**Priority:** 🟢 NICE TO HAVE
**Effort:** 30 minutes
**Impact:** LOW (reduces 20 lines duplication)
**Source:** 2.1 Framework

**Steps:**
1. Create text-utils.ts (10min)
2. Update imports (15min)
3. Validate (5min)

---

### [F3.2] Better LRU Cache

**Priority:** 🟢 NICE TO HAVE
**Effort:** 1-2 hours
**Impact:** LOW (better cache hit rate)
**Source:** 2.1 Framework

**Options:**
- Option 1: Implement simple LRU (1h)
- Option 2: Use lru-cache package (30min, adds dependency)

**Recommendation:** Option 1 (no new dependency)

---

## Phase 4: Polish & Documentation (OPTIONAL)

**Duration:** 6 hours
**Priority:** 🟢 LOW
**Impact:** Maintenance cost reduction

### [T4.1] Optimize Test Code

**Effort:** 3 hours
**Goal:** Test/source ratio 177% → 120-150%

**Actions:**
- Review smoke tests (209 tests in 1 file - split?)
- Refactor verbose integration tests
- Remove duplicate assertions

---

### [T4.2] Performance Monitoring

**Effort:** 2 hours

**Add:**
- CI check for slow tests (>1s)
- Test performance dashboard

---

### [T4.3] Test Documentation

**Effort:** 1 hour

**Add:**
- tests/helpers/README.md
- Update tests/README.md with smoke tests
- Document DI testing patterns

---

### Documentation Updates

**Effort:** TBD

**Update after architectural changes:**
- ARCHITECTURE.md
- Package READMEs
- CLAUDE.md (if rules changed)

---

## 📈 Timeline Estimate

| Phase | Duration | Type | Start Condition | Can Parallelize |
|-------|----------|------|-----------------|-----------------|
| Phase 0 | 1-2h | planning | immediate | No |
| Phase 1A | 6-8h | sequential | after Phase 0 | No (blocker) |
| Phase 1B | 13-22h<br>(7-11h parallel) | mostly parallel | immediate | YES (3 groups) |
| Phase 2 | 11-19h + TBD | sequential | after Phase 1A | Partial (F2.2, F2.3 parallel) |
| Phase 3 | 3.5-5h | parallel | after Phase 2 | YES |
| Phase 4 | 6h | parallel | after Phase 3 | YES |

**Timeline Scenarios:**

### Best Case (Full Parallelization)
- Phase 0: 1h
- Phase 1A + 1B parallel: ~12h (max of 8h for 1A and 11h for 1B Group 1)
- Phase 2: 11h (if some parallel)
- Phase 3: 2h (parallel)
- Phase 4: 3h (parallel, if doing)
- **Total: ~29 hours (~4 days)**

### Realistic Case (Partial Parallelization)
- Phase 0: 2h
- Phase 1A: 8h
- Phase 1B: 11h (2 groups parallel)
- Phase 2: 15h
- Phase 3: 4h
- Phase 4: skip
- **Total: ~40 hours (~5 days)**

### Worst Case (Sequential)
- Phase 0: 2h
- Phase 1A: 8h
- Phase 1B: 22h (all sequential)
- Phase 2: 19h + TBD
- Phase 3: 5h
- Phase 4: 6h
- **Total: ~62h + TBD (~8-10 days)**

---

## ⚠️ Risks & Mitigations

### 🔴 High Risk

**Risk:** Phase 2 architectural changes break existing functionality
**Impact:** HIGH
**Probability:** MEDIUM
**Mitigation:**
- Comprehensive tests before changes
- Feature flags for gradual rollout
- Rollback plan prepared
- Incremental commits

---

**Risk:** YandexTrackerFacade plan missing blocks Phase 2
**Impact:** HIGH
**Probability:** HIGH (plan doesn't exist)
**Mitigation:**
- **Option 1:** Create plan in Phase 0
- **Option 2:** Skip Y2.1, do other improvements
- **Option 3:** Integrate into this plan

---

**Risk:** Infrastructure extraction (F1.1) breaks many imports
**Impact:** HIGH
**Probability:** MEDIUM
**Mitigation:**
- Search & replace carefully
- Test after each file moved
- Keep yandex-tracker importing from infrastructure (one-way dependency)

---

### 🟡 Medium Risk

**Risk:** Multiple people/agents working on Phase 1B → merge conflicts
**Impact:** MEDIUM
**Probability:** MEDIUM
**Mitigation:**
- Clear ownership per task group
- Frequent commits and pushes
- Communication about overlapping files
- Use separate branches per group

---

**Risk:** Timeline underestimated (TBD for Facade)
**Impact:** MEDIUM
**Probability:** HIGH
**Mitigation:**
- Get realistic estimate for Facade in Phase 0
- Build buffer time into schedule
- Can postpone Phase 4 if needed

---

### 🟢 Low Risk

**Risk:** Tests fail during Phase 1B (independent improvements)
**Impact:** LOW
**Probability:** LOW
**Mitigation:**
- Each task validates independently
- Can rollback individual tasks
- No dependencies between Phase 1B tasks

---

## 🎯 Success Criteria

### Phase 0
- [ ] YandexTrackerFacade approach decided
- [ ] Priorities finalized
- [ ] Execution strategy chosen

### Phase 1A
- [ ] Infrastructure has no domain code
- [ ] Yandex-tracker has local config
- [ ] All tests pass
- [ ] `npm run validate:quiet` succeeds

### Phase 1B
- [ ] All assigned tasks completed
- [ ] No regressions
- [ ] Coverage improved (89% → 95%+)
- [ ] Code quality improved
- [ ] CI green

### Phase 2
- [ ] ToolRegistry refactored (<250 lines)
- [ ] generated-index moved
- [ ] HttpClient interface added
- [ ] YandexTrackerFacade resolved (if applicable)
- [ ] All tests passing
- [ ] Architecture goals achieved

### Phase 3
- [ ] Dependent improvements completed
- [ ] DI integration tests added (if Phase 2 done)
- [ ] Code quality metrics improved
- [ ] Coverage goals met

### Phase 4 (Optional)
- [ ] All nice-to-haves evaluated
- [ ] Documentation complete
- [ ] No known issues
- [ ] Test optimization done

---

## 📝 Progress Tracking

**Обновлять после каждой завершенной задачи!**

| Phase | Status | Started | Completed | Notes |
|-------|--------|---------|-----------|-------|
| Phase 0 | ⏸️ Pending | - | - | Requires user decisions |
| Phase 1A | ⏸️ Pending | - | - | Waiting for Phase 0 |
| Phase 1B | ⏸️ Pending | - | - | Can start after Phase 0 |
| Phase 2 | ⏸️ Pending | - | - | Waiting for Phase 1A |
| Phase 3 | ⏸️ Pending | - | - | Waiting for Phase 2 |
| Phase 4 | ⏸️ Pending | - | - | Optional |

**Статусы:** ⏸️ Pending | 🏗️ In Progress | ✅ Completed | ⏭️ Skipped | ❌ Blocked

---

## 🔗 References

### Detailed Analysis Reports
- [1.2 Dependency Analysis Summary](./results/1.2_dependency_analysis_summary.md)
- [2.1 Framework Packages Summary](./results/2.1_framework_packages_summary.md)
- [2.2 Yandex-Tracker Summary](./results/2.2_yandex_tracker_summary.md)
- [2.3 Code Quality Summary](./results/2.3_code_quality_summary.md)
- [2.4 Test Coverage Summary](./results/2.4_test_coverage_summary.md)

### Individual Execution Plans
- [Framework Plan](./results/2.1_framework_execution_plan.md)
- [Yandex-Tracker Plan](./results/2.2_yandex_tracker_execution_plan.md)
- [Code Quality Plan](./results/2.3_code_quality_execution_plan.md)
- [Test Coverage Plan](./results/2.4_test_coverage_execution_plan.md)

### Existing Plans
- ⚠️ Architecture Refactoring Plan - **MISSING** (referenced as plan_architecture_refactoring)

---

## 🚀 Next Steps

**Immediate actions needed:**

1. **User Review & Decisions** (Phase 0)
   - Review this consolidated plan
   - Decide on YandexTrackerFacade approach
   - Prioritize: which phases to do?
   - Choose execution strategy (sequential vs parallel)

2. **After Approval:**
   - Update progress tracking
   - Assign tasks (if parallel execution)
   - Create feature branches
   - Start execution!

---

**Last updated:** 2025-11-21
**Next review:** After user feedback
**Status:** 🤝 Awaiting user approval and decisions
