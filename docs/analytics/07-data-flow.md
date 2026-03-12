# 7. Потоки данных

## 7.1 Инициализация приложения

```
Браузер открывает приложение
        │
        ▼
main.jsx → React рендерит <App>
        │
        ▼
App.jsx → Router → PrivateRoute
        │
        ▼
PrivateRoute: authStore.initialized == false
        │
        ▼
authStore.initializeAuth()
  ├── Читает auth_token из cookie
  ├── Если токен есть:
  │     authStore.isAuthenticated = true
  │     GET /auth/me → authStore.user
  │     authStore.userLoaded = true
  └── Если нет / 401:
        authStore.isAuthenticated = false
        authStore.clearToken()
        │
        ▼
authStore.initialized = true
        │
  ┌─────┴──────┐
  ▼            ▼
isAuth?      isAuth?
  Да → MainLayout   Нет → /login
```

---

## 7.2 Аутентификация (логин)

```
LoginPage: пользователь вводит логин/пароль
        │
        ▼
authStore.login(username, password)
        │
        ▼
authService.login(username, password)
  POST /auth/login
  ← { token, user }
        │
        ▼
cookie: auth_token = token (7 дней)
authStore.token = token
authStore.user = user
authStore.isAuthenticated = true
        │
        ▼
PrivateRoute: isAuthenticated = true
        │
        ▼
navigate('/') → MainLayout
```

---

## 7.3 Загрузка и навигация по контенту

```
MainLayout монтируется
        │
        ▼
cookbookStore.loadSections()
  GET /sections
  ← [{ id, title, subsections? }]
sectionsStore.sections = [...]
sectionsStore.loaded = true
        │
        ▼
URL: /:sectionSlug/:subsectionSlug/:pageSlug
        │
        ▼
MainLayout: useMatch → парсит slugs
        │
        ▼
Сопоставление slug → entities:
  sections.find(s => toSlug(s.title) === sectionSlug)
        │
        ▼
sectionsStore.loadSectionSubsections(sectionId)   [если не загружены]
  GET /sections/:sectionId/subsections
        │
        ▼
  subsections.find(ss => toSlug(ss.title) === subsectionSlug)
        │
        ▼
sectionsStore.loadSubsectionPages(sectionId, subsectionId)   [если не загружены]
  GET /subsections/:subsectionId/pages
        │
        ▼
  pages.find(p => toSlug(p.title) === pageSlug)
        │
        ▼
uiStore.selectSection(section.id)
uiStore.selectSubsection(subsection.id)
uiStore.selectPage(page.id)
        │
        ▼
observer-компоненты перерисовываются:
  Sidebar подсвечивает активную страницу
  PageView отображает содержимое page.content
```

---

## 7.4 Редактирование страницы

```
PageView: пользователь нажимает Edit (только admin)
        │
        ▼
isEditMode = true
originalContent = page.content  [для diff-view]
        │
        ▼
MDXEditor: пользователь редактирует markdown
(live preview Mermaid-диаграмм)
        │
        ▼
Пользователь нажимает Save
        │
        ▼
const markdown = editorRef.current.getMarkdown()
        │
        ▼
cookbookStore.updatePage(sectionId, subsectionId, pageId, { content: markdown })
  │
  ▼
pagesStore.updatePage(...)
  PUT /pages/:pageId { content: markdown }
  ← { data: updatedPage }
  │
  ▼
runInAction:
  subsection.pages[i] = { ...page, content: markdown, updatedAt: now }
        │
        ▼
observer: PageView перерисовывается с новым контентом
isEditMode = false
```

---

## 7.5 Создание сущностей

### Создание страницы

```
Sidebar: контекстное меню → "Создать страницу"
        │
        ▼
Диалог: пользователь вводит title
        │
        ▼
cookbookStore.addPage(sectionId, subsectionId, title)
  POST /subsections/:subsectionId/pages { title }
  ← { data: newPage }
        │
        ▼
runInAction: subsection.pages.push(newPage)
        │
        ▼
navigate('/:sectionSlug/:subsectionSlug/:newPageSlug')
PageView открывает пустую страницу
```

---

## 7.6 Поиск (Ctrl+K)

```
MainLayout: Ctrl+K
        │
        ▼
searchDialogOpen = true
SearchDialog монтируется
        │
        ▼
Пользователь вводит запрос (debounced)
        │
        ▼
performSearch(query):
  for each section
    for each subsection
      if subsection.pages загружены:
        for each page
          match(query, page.title)     → приоритет 1
          match(query, page.content)   → приоритет 2
          match(query, subsection.title) → приоритет 3
        match(query, section.title)    → приоритет 4
        │
        ▼
  deduplicate by pageId
  sort by priority
  return results[]
        │
        ▼
Пользователь кликает по результату
        │
        ▼
navigate('/:sectionSlug/:subsectionSlug/:pageSlug')
searchDialogOpen = false
```

---

## 7.7 Выход из системы

```
AppBar: пользователь нажимает Logout
        │
        ▼
authStore.logout()
  POST /auth/logout
  authService.clearToken()  → удаляет cookie
  authStore.user = null
  authStore.token = null
  authStore.isAuthenticated = false
  authStore.userLoaded = false
        │
        ▼
PrivateRoute: isAuthenticated = false
        │
        ▼
navigate('/login')
```
