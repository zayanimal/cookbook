# 5. Управление состоянием (MobX Stores)

## 5.1 Общая схема зависимостей сторов

```
                    ┌─────────────────┐
                    │  cookbookStore  │  ← Фасад (оркестратор)
                    └────────┬────────┘
                             │ содержит ссылки на
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
    ┌──────────────┐ ┌─────────────┐ ┌──────────────┐
    │sectionsStore │ │ pagesStore  │ │   uiStore    │
    └──────────────┘ └─────────────┘ └──────────────┘
                             │ ссылка на
                    ┌────────▼────────┐
                    │  sectionsStore  │  (для обновления дерева)
                    └─────────────────┘

    ┌──────────────┐
    │  authStore   │  ← независимый, читается компонентами напрямую
    └──────────────┘
```

---

## 5.2 authStore

**Файл:** `src/stores/authStore.js`

### Состояние

| Поле | Тип | Описание |
|------|-----|----------|
| `user` | `object \| null` | Данные текущего пользователя |
| `token` | `string \| null` | JWT-токен |
| `isAuthenticated` | `boolean` | Флаг авторизации |
| `loading` | `boolean` | Выполняется запрос |
| `error` | `string \| null` | Сообщение об ошибке |
| `userLoaded` | `boolean` | Данные пользователя загружены (дедупликация) |
| `initialized` | `boolean` | Инициализация завершена |

### Вычисляемые свойства (computed)

| Свойство | Описание |
|----------|----------|
| `isAdmin` | `user.role === 'admin'` |
| `isClient` | `user.role === 'client'` |
| `canEdit` | `isAdmin` |
| `canAdd` | `isAdmin` |

### Методы

| Метод | Описание |
|-------|----------|
| `initializeAuth()` | Читает токен из cookie, загружает пользователя, устанавливает `initialized = true` |
| `login(username, password)` | POST /auth/login, сохраняет токен в cookie, обновляет состояние |
| `logout()` | POST /auth/logout, очищает токен и состояние |
| `fetchCurrentUser()` | GET /auth/me (с защитой от повторных вызовов через `userLoaded`) |
| `clearError()` | Сбрасывает `error` |

---

## 5.3 sectionsStore

**Файл:** `src/stores/sectionsStore.js`

### Состояние

| Поле | Тип | Описание |
|------|-----|----------|
| `sections` | `Section[]` | Массив всех разделов |
| `loading` | `boolean` | Загрузка данных |
| `error` | `string \| null` | Ошибка |
| `loaded` | `boolean` | Данные загружены (кеш) |

### Методы

| Метод | Описание |
|-------|----------|
| `loadSections()` | GET /sections (однократно, кешируется через `loaded`) |
| `loadSectionSubsections(sectionId)` | GET /sections/:id/subsections (lazy-load) |
| `loadSubsectionPages(sectionId, subsectionId)` | GET /subsections/:id/pages (lazy-load) |
| `addSection(title)` | POST /sections |
| `updateSection(id, title)` | PUT /sections/:id |
| `deleteSection(id)` | DELETE /sections/:id |
| `addSubsection(sectionId, title)` | POST /sections/:id/subsections |
| `updateSubsection(sectionId, id, title)` | PUT /subsections/:id |
| `deleteSubsection(sectionId, id)` | DELETE /subsections/:id |
| `getSectionById(id)` | Поиск раздела в `sections[]` |
| `getSubsectionById(sectionId, id)` | Поиск подраздела в разделе |

---

## 5.4 pagesStore

**Файл:** `src/stores/pagesStore.js`

**Особенность:** не хранит собственный массив страниц. Страницы хранятся внутри объектов Subsection в `sectionsStore`. После каждой мутации `pagesStore` обновляет `sectionsStore` через прямую ссылку.

### Методы

| Метод | Описание |
|-------|----------|
| `addPage(sectionId, subsectionId, title)` | POST /subsections/:id/pages, добавляет страницу в `sectionsStore` |
| `updatePage(sectionId, subsectionId, pageId, updates)` | PUT /pages/:id, обновляет поля страницы в `sectionsStore` |
| `deletePage(sectionId, subsectionId, pageId)` | DELETE /pages/:id, удаляет из `sectionsStore` |

---

## 5.5 uiStore

**Файл:** `src/stores/uiStore.js`

### Состояние

| Поле | Тип | Описание |
|------|-----|----------|
| `selectedSectionId` | `string \| null` | ID выбранного раздела |
| `selectedSubsectionId` | `string \| null` | ID выбранного подраздела |
| `selectedPageId` | `string \| null` | ID выбранной страницы |
| `sidebarOpen` | `boolean` | Открыт ли сайдбар |
| `sidebarWidth` | `number` | Ширина сайдбара (px), [200–600] |
| `isResizing` | `boolean` | Активен drag-resize |
| `error` | `string \| null` | Ошибка для Snackbar |

### Методы

| Метод | Описание |
|-------|----------|
| `selectSection(id)` | Устанавливает `selectedSectionId` |
| `selectSubsection(id)` | Устанавливает `selectedSubsectionId` |
| `selectPage(id)` | Устанавливает `selectedPageId` |
| `clearSelection()` | Сбрасывает все выбранные ID |
| `toggleSidebar()` | Инвертирует `sidebarOpen` |
| `setSidebarOpen(value)` | Устанавливает `sidebarOpen` |
| `setSidebarWidth(value)` | Зажимает в [200,600], сохраняет в `localStorage` |
| `setIsResizing(value)` | Устанавливает флаг ресайза |
| `setError(message)` | Устанавливает ошибку |
| `clearError()` | Сбрасывает ошибку |

---

## 5.6 cookbookStore (Фасад)

**Файл:** `src/stores/cookbookStore.js`

Объединяет `sectionsStore`, `pagesStore` и `uiStore`. Компоненты вызывают методы `cookbookStore`, не зная о внутреннем разделении стейта.

### Делегирующие методы (выборка ключевых)

| Метод | Делегирует в | Описание |
|-------|-------------|----------|
| `loadSections()` | `sectionsStore` | Загрузка разделов |
| `selectPage(sId, ssId, pId)` | `uiStore` + `sectionsStore` | Выбор страницы, ленивая загрузка |
| `updatePage(...)` | `pagesStore` | Обновление страницы |
| `deletePage(...)` | `pagesStore` + `uiStore` | Удаление + сброс выбора |
| `getSelectedPage()` | `sectionsStore` + `uiStore` | Возвращает текущую страницу |
| `setError(msg)` | `uiStore` | Показ Snackbar-ошибки |

---

## 5.7 Инициализация сторов

```jsx
// src/stores/index.js
export const stores = {
  authStore: new AuthStore(),
  cookbookStore: new CookbookStore(),
}

// src/main.jsx
<StoreContext.Provider value={stores}>
  <App />
</StoreContext.Provider>
```

```jsx
// src/hooks/useStores.js
export const useStores = () => useContext(StoreContext)
```
