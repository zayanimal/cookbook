# 3. Архитектура приложения

## 3.1 Общая схема слоёв

```
┌─────────────────────────────────────────────────────┐
│                   PRESENTATION                      │
│   React-компоненты (components/)                    │
│   Отображение, пользовательский ввод, навигация     │
└──────────────────────┬──────────────────────────────┘
                       │ читают / вызывают методы
┌──────────────────────▼──────────────────────────────┐
│               STATE MANAGEMENT                      │
│   MobX-сторы (stores/)                              │
│   Бизнес-состояние, вычисляемые свойства            │
└──────────────────────┬──────────────────────────────┘
                       │ вызывают
┌──────────────────────▼──────────────────────────────┐
│                 SERVICE LAYER                       │
│   Сервисы (services/)                               │
│   HTTP-запросы, трансформация данных                │
└──────────────────────┬──────────────────────────────┘
                       │ через
┌──────────────────────▼──────────────────────────────┐
│                  API CLIENT                         │
│   api.js (axios + interceptors)                     │
│   Или mocks.js (in-memory, для разработки)          │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              BACKEND / MOCK                         │
│   REST API (http://cookbook:9000/api)               │
└─────────────────────────────────────────────────────┘
```

## 3.2 Структура файлов

```
src/
├── components/           # Presentation layer
│   ├── MainLayout.jsx    # Оболочка приложения (AppBar + Sidebar + контент)
│   ├── Sidebar.jsx       # Навигационное дерево
│   ├── PageView.jsx      # Редактор/просмотрщик Markdown
│   ├── LoginPage.jsx     # Форма авторизации
│   ├── PrivateRoute.jsx  # Защита маршрутов
│   ├── SearchDialog.jsx  # Полнотекстовый поиск
│   ├── EmptyState.jsx    # Заглушки для пустых состояний
│   ├── MermaidDiagram.jsx # Рендеринг диаграмм Mermaid
│   └── ResizeHandle.jsx  # Drag-handle для изменения ширины сайдбара
│
├── stores/               # State management layer
│   ├── index.js          # Создание и экспорт сторов
│   ├── authStore.js      # Аутентификация и права доступа
│   ├── cookbookStore.js  # Оркестратор (фасад над остальными сторами)
│   ├── sectionsStore.js  # Состояние разделов и подразделов
│   ├── pagesStore.js     # CRUD операции со страницами
│   └── uiStore.js        # UI-состояние (выбор, сайдбар, ошибки)
│
├── services/             # Service layer
│   ├── api.js            # HTTP-клиент (axios + перехватчики)
│   ├── authService.js    # Аутентификация
│   ├── sectionsService.js  # API разделов
│   ├── subsectionsService.js # API подразделов
│   ├── pagesService.js   # API страниц
│   └── mocks.js          # Mock API (in-memory)
│
├── hooks/
│   └── useStores.js      # Хук доступа к сторам через React Context
│
├── utils/
│   └── slug.js           # Транслитерация для URL
│
├── App.jsx               # Маршрутизация
└── main.jsx              # Точка входа, тема MUI, React Context сторов
```

## 3.3 Паттерны, применённые в архитектуре

### Facade (Фасад)
`cookbookStore` — фасад над `sectionsStore`, `pagesStore` и `uiStore`. Компоненты работают только с `cookbookStore`, не зная о внутреннем разделении.

### Repository (Репозиторий)
Каждый сервис (`sectionsService`, `pagesService`) инкапсулирует логику работы с конкретным ресурсом API. Сторы не знают об URL, заголовках и транспорте.

### Observer (Наблюдатель)
MobX реализует паттерн Observer: `observable`-состояние → реакции компонентов-`observer`. Компоненты автоматически перерисовываются при изменении только тех данных, которые они читают.

### Context + Custom Hook
Сторы передаются через `React.createContext` и читаются через `useStores()`. Это избавляет от prop drilling и позволяет легко подменить сторы в тестах.

### Strategy (Стратегия)
`api.js` выбирает стратегию выполнения запроса: реальный `axios`-запрос или `mocks.js` — в зависимости от переменной окружения `VITE_USE_MOCKS`.

## 3.4 Маршрутизация

```
/login                     → LoginPage
/                          → PrivateRoute → MainLayout
  /:sectionSlug            → MainLayout (секция выбрана)
  /:sectionSlug/:subsectionSlug/:pageSlug → MainLayout (страница открыта)
```

`PrivateRoute` блокирует доступ неавторизованным пользователям, перенаправляя на `/login`. На время инициализации авторизации отображается спиннер.

## 3.5 Конфигурация сборки

### Vite
- Сборщик и dev-сервер на порту 3000
- Поддержка HMR (Hot Module Replacement)
- Разделение бандла ограничено предупреждением при >500 кБ

### PWA (vite-plugin-pwa)
- Тип регистрации: `autoUpdate`
- Workbox precache всех JS/CSS/HTML/PNG/SVG
- Лимит размера кешируемого файла: 4 МБ (поднят с 2 МБ из-за Mermaid)
- Манифест: тема `#e67e22`, standalone-режим

### Docker
- `Dockerfile` и `start-static-app.sh` для деплоя в виде статики
