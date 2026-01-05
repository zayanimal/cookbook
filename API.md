# API Документация

## Обзор

Проект использует REST API для работы с данными. Реализован слой сервисов, который может работать как с реальным бэкендом, так и с моками для разработки.

## Конфигурация

Настройка API происходит через переменные окружения в файле `.env`:

```env
VITE_API_BASE_URL=/api          # Базовый URL API
VITE_USE_MOCKS=true             # Использовать моки (true/false)
```

## Эндпоинты

### Разделы (Sections)

#### GET /api/sections
Получить все разделы

**Ответ:**
```json
{
  "data": [
    {
      "id": "1",
      "title": "Отопление",
      "pages": [...]
    }
  ],
  "success": true
}
```

#### GET /api/sections/:id
Получить раздел по ID

**Ответ:**
```json
{
  "data": {
    "id": "1",
    "title": "Отопление",
    "pages": [...]
  },
  "success": true
}
```

#### POST /api/sections
Создать новый раздел

**Тело запроса:**
```json
{
  "title": "Название раздела"
}
```

**Ответ:**
```json
{
  "data": {
    "id": "9",
    "title": "Название раздела",
    "pages": []
  },
  "success": true
}
```

#### PUT /api/sections/:id
Обновить раздел

**Тело запроса:**
```json
{
  "title": "Новое название"
}
```

**Ответ:**
```json
{
  "data": {
    "id": "1",
    "title": "Новое название",
    "pages": [...]
  },
  "success": true
}
```

#### DELETE /api/sections/:id
Удалить раздел

**Ответ:**
```json
{
  "success": true
}
```

### Страницы (Pages)

#### GET /api/sections/:id/pages
Получить все страницы раздела

**Ответ:**
```json
{
  "data": [
    {
      "id": "1-1",
      "title": "Общая информация",
      "content": {
        "blocks": [...]
      },
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "success": true
}
```

#### GET /api/sections/:id/pages/:pageId
Получить страницу по ID

**Ответ:**
```json
{
  "data": {
    "id": "1-1",
    "title": "Общая информация",
    "content": {
      "blocks": [...]
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  "success": true
}
```

#### POST /api/sections/:id/pages
Создать новую страницу

**Тело запроса:**
```json
{
  "title": "Название страницы",
  "content": {
    "blocks": []
  }
}
```

**Ответ:**
```json
{
  "data": {
    "id": "1-2",
    "title": "Название страницы",
    "content": {
      "blocks": []
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  "success": true
}
```

#### PUT /api/sections/:id/pages/:pageId
Обновить страницу

**Тело запроса:**
```json
{
  "title": "Новое название",
  "content": {
    "blocks": [...]
  }
}
```

**Ответ:**
```json
{
  "data": {
    "id": "1-1",
    "title": "Новое название",
    "content": {
      "blocks": [...]
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  },
  "success": true
}
```

#### DELETE /api/sections/:id/pages/:pageId
Удалить страницу

**Ответ:**
```json
{
  "success": true
}
```

## Структура данных

### Раздел (Section)
```typescript
{
  id: string
  title: string
  pages: Page[]
}
```

### Страница (Page)
```typescript
{
  id: string
  title: string
  content: {
    blocks: EditorJSBlock[]
  }
  createdAt: string  // ISO 8601
  updatedAt: string  // ISO 8601
}
```

### EditorJS Content
Содержимое страницы хранится в формате EditorJS:
```json
{
  "blocks": [
    {
      "type": "header",
      "data": {
        "text": "Заголовок",
        "level": 2
      }
    },
    {
      "type": "paragraph",
      "data": {
        "text": "Текст параграфа"
      }
    }
  ]
}
```

## Обработка ошибок

Все ошибки возвращаются в следующем формате:

```json
{
  "error": "Описание ошибки",
  "success": false
}
```

HTTP статус коды:
- `200` - Успешный запрос
- `400` - Неверный запрос
- `404` - Ресурс не найден
- `500` - Внутренняя ошибка сервера

## Использование сервисов

### В компонентах React

```javascript
import { sectionsService } from '../services/sectionsService'

// Получить все разделы
const sections = await sectionsService.getAllSections()

// Создать раздел
const newSection = await sectionsService.createSection('Название')
```

### В MobX Store

```javascript
import { sectionsService } from '../services/sectionsService'

async addSection(title) {
  const newSection = await sectionsService.createSection(title)
  this.sections.push(newSection)
}
```

## Моки

Моки находятся в папке `mocks/` и используются автоматически при `VITE_USE_MOCKS=true`. 

Структура моков:
```
mocks/
  └── sections.json          # Все разделы
  └── sections/
      └── {id}.json          # Конкретный раздел
      └── {id}/
          └── pages.json     # Страницы раздела
          └── pages/
              └── {pageId}.json  # Конкретная страница
```

Моки симулируют задержку сети (300ms по умолчанию) и возвращают данные в том же формате, что и реальный API.

