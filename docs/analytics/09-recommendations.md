# 9. Рекомендации

## 9.1 Высокий приоритет

### R-01: Разбить `MainLayout.jsx` на отдельные хуки и компоненты

**Проблема:** `MainLayout` (358 строк) выполняет: рендер оболочки, синхронизацию URL ↔ стор, keyboard shortcut, логику скрытия шапки при скролле.

**Решение:**
```
MainLayout.jsx          → только рендер оболочки
hooks/useUrlSync.js     → синхронизация URL со стором
hooks/useKeyboardShortcuts.js → Ctrl+K и прочие shortcuts
hooks/useScrollHeader.js → авто-скрытие header
```

---

### R-02: Разбить `Sidebar.jsx` на самостоятельные компоненты

**Проблема:** 635 строк, смешаны навигация, диалоги создания, контекстное меню.

**Решение:**
```
Sidebar.jsx            → только дерево навигации
SectionItem.jsx        → компонент раздела (вынести из Sidebar)
SubsectionItem.jsx     → компонент подраздела
CreateEntityDialog.jsx → универсальный диалог создания
```

---

### R-03: Разбить `PageView.jsx` на компоненты

**Проблема:** редактор, просмотрщик, редактирование заголовка и диалог удаления в одном файле (432 строки).

**Решение:**
```
PageView.jsx           → координация состояния
PageEditor.jsx         → MDXEditor в режиме редактирования
PageReader.jsx         → MDXEditor readOnly
PageTitle.jsx          → inline-редактирование заголовка
```

---

### R-04: Вынести алгоритм поиска из `SearchDialog`

**Проблема:** логика ранжирования и обхода дерева живёт внутри UI-компонента, нарушая SRP.

**Решение:**
```js
// utils/search.js или stores/searchStore.js
export function searchContent(sections, query) { ... }
```

Компонент вызывает функцию, не зная алгоритма.

---

## 9.2 Средний приоритет

### R-05: Убрать прямую связь `pagesStore` → `sectionsStore`

**Проблема:** `pagesStore` знает о внутренней структуре `sectionsStore` и мутирует её напрямую. Это нарушает LSP и DIP.

**Решение:** добавить в `sectionsStore` метод для обновления страницы:

```js
// sectionsStore.js
updatePageInTree(sectionId, subsectionId, pageId, updates) {
  runInAction(() => {
    const page = this.findPage(sectionId, subsectionId, pageId)
    Object.assign(page, updates)
  })
}
```

`pagesStore` вызывает этот метод, не зная о внутренней структуре `sections[]`.

---

### R-06: Инверсия зависимости в `api.js`

**Проблема:** `api.js` импортирует `authService` для получения токена. Потенциально создаёт связанность на одном уровне слоя.

**Решение:** передавать getter токена при создании клиента:

```js
// api.js
export function createApiClient(getToken) {
  const client = axios.create({ ... })
  client.interceptors.request.use(config => {
    const token = getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })
  return client
}

// stores/index.js или main.jsx
const apiClient = createApiClient(() => Cookies.get('auth_token'))
```

---

### R-07: Добавить обработку ошибок при ленивой загрузке

**Проблема:** если `loadSectionSubsections()` или `loadSubsectionPages()` упадёт, пользователь увидит пустое дерево без объяснений.

**Решение:** показывать inline-ошибку внутри `SectionItem` / `SubsectionItem`, с кнопкой «Повторить».

---

### R-08: Мемоизировать `viewPlugins` в `PageView`

**Проблема:** `viewPlugins` — массив, определённый на уровне модуля. Включает `mermaidDescriptor`, который является замыканием с доступом к `useCodeBlockEditorContext`. При добавлении хуков в компонент дескриптора могут возникнуть проблемы с контекстом вне React-дерева.

**Решение:** определять `viewPlugins` внутри компонента через `useMemo`:

```js
const viewPlugins = useMemo(() => [
  headingsPlugin(),
  codeBlockPlugin({ codeBlockEditorDescriptors: [mermaidDescriptor] }),
  ...
], [])
```

---

## 9.3 Низкий приоритет

### R-09: Типизация TypeScript

Проект использует JSX без TypeScript. При росте команды рекомендуется ввести TypeScript для типизации сущностей (`Section`, `Page`, `User`), что исключит ошибки обращения к несуществующим полям.

---

### R-10: Пагинация или виртуализация дерева

**Проблема:** при большом количестве разделов/подразделов/страниц `Sidebar` загрузит всё в DOM одновременно.

**Решение:** использовать виртуализацию списка (например, `react-window`) для сайдбара при >100 элементах.

---

### R-11: Хранение slug в модели

**Проблема:** slug вычисляется на лету при каждой навигации из `title`. При изменении title страницы старые ссылки (закладки, расшаренные URL) сломаются.

**Решение:** хранить `slug` как отдельный атрибут на бэкенде, устанавливать при создании, не менять при переименовании.

---

## 9.4 Сводная таблица рекомендаций

| ID | Приоритет | Принцип SOLID | Описание |
|----|-----------|---------------|----------|
| R-01 | Высокий | S | Разбить `MainLayout` на хуки |
| R-02 | Высокий | S | Разбить `Sidebar` на компоненты |
| R-03 | Высокий | S | Разбить `PageView` на компоненты |
| R-04 | Высокий | S, O | Вынести алгоритм поиска |
| R-05 | Средний | L, D | Убрать прямую связь `pagesStore → sectionsStore` |
| R-06 | Средний | D | Инверсия зависимости в `api.js` |
| R-07 | Средний | — | Обработка ошибок lazy-load |
| R-08 | Средний | — | Мемоизировать `viewPlugins` |
| R-09 | Низкий | — | Типизация TypeScript |
| R-10 | Низкий | — | Виртуализация дерева навигации |
| R-11 | Низкий | — | Персистентные slug в БД |
