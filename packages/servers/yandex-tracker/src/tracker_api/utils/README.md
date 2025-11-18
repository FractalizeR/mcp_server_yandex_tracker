# Utils — Вспомогательные утилиты

**Перед использованием утилит прочитай этот файл.**

---

## 🎯 Назначение Utils

**Utils** — вспомогательные классы для работы с API Яндекс.Трекера:
- Инкапсулируют переиспользуемую логику
- Чистые функции без side effects
- Используются в Operations и Tools

---

## 📁 Структура

```
src/tracker_api/utils/
├── pagination.util.ts    # PaginationUtil
├── file-upload.util.ts   # FileUploadUtil
└── index.ts              # Экспорты
```

---

## 📊 PaginationUtil

Утилиты для работы с пагинацией в API запросах.

### buildQueryParams

Построить query параметры для пагинации:

```typescript
const params = PaginationUtil.buildQueryParams({
  perPage: 50,
  page: 2
});
// URLSearchParams { perPage: "50", page: "2" }
```

### parsePaginatedResponse

Распарсить ответ с пагинацией от API:

```typescript
const response = {
  items: [comment1, comment2],
  total: 150,
  page: 2,
  perPage: 50
};
const parsed = PaginationUtil.parsePaginatedResponse<Comment>(response);
// PaginatedResponse<Comment>
```

### parseFromHeaders

Распарсить пагинацию из заголовков HTTP:

```typescript
const items = [comment1, comment2];
const headers = {
  'x-total-count': '150',
  'x-page': '2',
  'x-per-page': '50'
};
const parsed = PaginationUtil.parseFromHeaders(items, headers);
// PaginatedResponse<Comment>
```

### calculateTotalPages

Вычислить общее количество страниц:

```typescript
const totalPages = PaginationUtil.calculateTotalPages(150, 50);
// 3
```

---

## 📁 FileUploadUtil

Утилиты для работы с загрузкой файлов.

### prepareMultipartFormData

Подготовить multipart/form-data для загрузки файла:

```typescript
const buffer = Buffer.from('file content');
const formData = FileUploadUtil.prepareMultipartFormData(
  buffer,
  'document.pdf',
  'attachment'
);
// FormData готова для POST запроса
```

### validateFileSize

Валидация размера файла:

```typescript
const isValid = FileUploadUtil.validateFileSize(
  1024 * 1024,           // 1 MB
  10 * 1024 * 1024      // max 10 MB
);
// true
```

### getMimeType

Определить MIME тип файла по расширению:

```typescript
const mimeType = FileUploadUtil.getMimeType('document.pdf');
// 'application/pdf'

const mimeType = FileUploadUtil.getMimeType('image.jpg');
// 'image/jpeg'
```

### getFileExtension

Получить расширение файла:

```typescript
const ext = FileUploadUtil.getFileExtension('document.pdf');
// 'pdf'
```

### validateFilename

Валидация имени файла (проверка на path traversal и недопустимые символы):

```typescript
FileUploadUtil.validateFilename('document.pdf');      // true
FileUploadUtil.validateFilename('../etc/passwd');     // false
FileUploadUtil.validateFilename('file<script>.js');   // false
```

### formatFileSize

Форматировать размер файла для отображения:

```typescript
FileUploadUtil.formatFileSize(1024);           // "1.0 KB"
FileUploadUtil.formatFileSize(1024 * 1024);    // "1.0 MB"
FileUploadUtil.formatFileSize(1536);           // "1.5 KB"
```

---

## 🚨 Критические правила

### 1. Только статические методы

✅ **Правильно:**
```typescript
export class PaginationUtil {
  static buildQueryParams(params: PaginationParams): URLSearchParams {
    // ...
  }
}
```

❌ **Неправильно:**
```typescript
export class PaginationUtil {
  buildQueryParams(params: PaginationParams): URLSearchParams {
    // ...
  }
}
```

### 2. Чистые функции без side effects

✅ **Правильно:**
```typescript
static getMimeType(filename: string): string {
  const mimeType = lookup(filename);
  return mimeType !== false ? mimeType : 'application/octet-stream';
}
```

❌ **Неправильно:**
```typescript
// НЕ изменять глобальное состояние
static setDefaultMimeType(mimeType: string): void {
  globalMimeType = mimeType;
}
```

### 3. Валидация входных данных

✅ **Правильно:**
```typescript
static calculateTotalPages(total: number, perPage: number): number {
  if (perPage <= 0) {
    throw new Error('perPage must be greater than 0');
  }
  return Math.ceil(total / perPage);
}
```

---

## 📋 Чек-лист создания Utils

- [ ] Создать файл `src/tracker_api/utils/{name}.util.ts`
- [ ] **Создать класс с static методами:**
  - [ ] Только static методы
  - [ ] JSDoc комментарии для класса и методов
  - [ ] Валидация входных данных
  - [ ] Явная типизация параметров и возвращаемых значений
  - [ ] Примеры использования в JSDoc
- [ ] **Экспорт:**
  - [ ] Добавить в `utils/index.ts`:
    ```typescript
    export { FileUploadUtil } from './file-upload.util.js';
    ```
- [ ] **Тесты:**
  - [ ] Создать `tests/tracker_api/utils/{name}.util.test.ts`
  - [ ] Покрытие тестами ≥90%
  - [ ] Тесты на edge cases (пустые строки, null, undefined)
- [ ] `npm run validate` — проходит

---

## 🧪 Примеры использования в Operations

### Использование PaginationUtil

```typescript
export class GetCommentsOperation extends BaseOperation {
  async execute(
    issueKey: string,
    params: PaginationParams
  ): Promise<PaginatedResponse<CommentWithUnknownFields>> {
    // Построить query параметры
    const queryParams = PaginationUtil.buildQueryParams(params);

    // Выполнить запрос
    const response = await this.httpClient.get(
      `/v3/issues/${issueKey}/comments`,
      queryParams
    );

    // Распарсить ответ
    return PaginationUtil.parsePaginatedResponse<CommentWithUnknownFields>(response);
  }
}
```

### Использование FileUploadUtil

```typescript
export class UploadAttachmentOperation extends BaseOperation {
  async execute(
    issueKey: string,
    file: Buffer,
    filename: string
  ): Promise<AttachmentWithUnknownFields> {
    // Валидация имени файла
    if (!FileUploadUtil.validateFilename(filename)) {
      throw new Error('Invalid filename');
    }

    // Валидация размера (макс 10MB)
    if (!FileUploadUtil.validateFileSize(file.length, 10 * 1024 * 1024)) {
      throw new Error('File too large');
    }

    // Подготовить FormData
    const formData = FileUploadUtil.prepareMultipartFormData(file, filename);

    // Загрузить файл
    return this.uploadFile<AttachmentWithUnknownFields>(
      `/v3/issues/${issueKey}/attachments`,
      formData
    );
  }
}
```

---

**Версия:** 2.0
**Обновлено:** 2025-01-18
