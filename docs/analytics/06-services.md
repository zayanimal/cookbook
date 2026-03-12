# 6. Сервисный слой

## 6.1 Обзор

Сервисный слой отделяет логику HTTP-запросов от MobX-сторов. Каждый сервис работает только с одним ресурсом API и возвращает нормализованные данные (не сырой `AxiosResponse`).

```
stores/ → вызывают → services/ → используют → api.js
```

---

## 6.2 api.js — HTTP-клиент

**Файл:** `src/services/api.js`

### Конфигурация Axios

| Параметр | Значение |
|----------|----------|
| `baseURL` | `VITE_API_BASE_URL` из `.env` |
| `timeout` | 10 000 мс |
| `withCredentials` | `true` |

### Request-интерцептор

Добавляет заголовок авторизации к каждому запросу:

```
Authorization: Bearer <token_from_cookie>
```

Токен читается из `authService.getToken()` при каждом запросе.

### Response-интерцептор

| Условие | Действие |
|---------|---------|
| HTTP 401 | `authService.clearToken()`, пользователь разлогинивается |
| Ошибка с `response.data.error` | Пробрасывает сообщение ошибки из API |
| Ошибка без `response` | Пробрасывает `error.message` |

### Mock-режим

При `VITE_USE_MOCKS=true` вместо Axios вызывается `getMockData(method, url, data)` из `mocks.js`. Ответ симулируется с задержкой 300 мс.

---

## 6.3 authService.js

**Файл:** `src/services/authService.js`

| Метод | HTTP | Путь | Описание |
|-------|------|------|----------|
| `login(username, password)` | POST | `/auth/login` | Логин, сохраняет токен в cookie (7 дней, SameSite=strict) |
| `logout()` | POST | `/auth/logout` | Выход, вызывает `clearToken()` |
| `getCurrentUser()` | GET | `/auth/me` | Получить данные текущего пользователя |
| `getToken()` | — | — | Читает `auth_token` из cookie |
| `isAuthenticated()` | — | — | Возвращает `!!getToken()` |
| `clearToken()` | — | — | Удаляет cookie `auth_token` |

---

## 6.4 sectionsService.js

**Файл:** `src/services/sectionsService.js`

| Метод | HTTP | Путь |
|-------|------|------|
| `getAllSections()` | GET | `/sections` |
| `getSectionById(id)` | GET | `/sections/:id` |
| `createSection(title)` | POST | `/sections` |
| `updateSection(id, title)` | PUT | `/sections/:id` |
| `deleteSection(id)` | DELETE | `/sections/:id` |

---

## 6.5 subsectionsService.js

**Файл:** `src/services/subsectionsService.js`

| Метод | HTTP | Путь |
|-------|------|------|
| `getSubsectionsBySection(sectionId)` | GET | `/sections/:sectionId/subsections` |
| `getSubsectionById(id)` | GET | `/subsections/:id` |
| `createSubsection(sectionId, title)` | POST | `/sections/:sectionId/subsections` |
| `updateSubsection(id, title)` | PUT | `/subsections/:id` |
| `deleteSubsection(id)` | DELETE | `/subsections/:id` |

---

## 6.6 pagesService.js

**Файл:** `src/services/pagesService.js`

| Метод | HTTP | Путь |
|-------|------|------|
| `getPagesBySubsection(subsectionId)` | GET | `/subsections/:subsectionId/pages` |
| `createPage(subsectionId, title, content)` | POST | `/subsections/:subsectionId/pages` |
| `updatePage(pageId, updates)` | PUT | `/pages/:pageId` |
| `deletePage(pageId)` | DELETE | `/pages/:pageId` |

---

## 6.7 mocks.js — Mock API

**Файл:** `src/services/mocks.js`

Полная имитация REST API без бэкенда. Данные хранятся in-memory и инициализируются при первом запросе из статических JSON-файлов в директории `mocks/`.

### Поддерживаемые операции

| Ресурс | Операции |
|--------|----------|
| `/auth/login` | Проверка credentials, выдача mock-токена |
| `/auth/logout` | Инвалидация токена (in-memory map) |
| `/auth/me` | Получение пользователя по токену |
| `/sections` | GET all, POST |
| `/sections/:id` | GET, PUT, DELETE |
| `/sections/:id/subsections` | GET all, POST |
| `/subsections/:id` | GET, PUT, DELETE |
| `/subsections/:id/pages` | GET all, POST |
| `/pages/:id` | PUT, DELETE |

### Mock-токены

Формат: `mock_jwt_token_{userId}_{timestamp}`

При logout токен добавляется в blacklist (`invalidatedTokens: Set`). При `/auth/me` проверяется, не находится ли токен в blacklist.

### Структура mock-данных

```
mocks/
├── sections.json          # Список разделов
└── sections/
    └── {sectionId}/
        ├── subsections.json
        └── {subsectionId}/
            └── pages.json
```

---

## 6.8 API: формат ответов

### Успешный ответ

```json
{
  "data": { /* полезные данные */ },
  "success": true
}
```

### Ошибка

```json
{
  "error": "Описание ошибки",
  "success": false
}
```

### Коды ответов

| Код | Значение |
|-----|----------|
| 200 | Успешно |
| 400 | Неверный запрос |
| 401 | Не авторизован |
| 403 | Доступ запрещён (недостаточно прав) |
| 404 | Ресурс не найден |
