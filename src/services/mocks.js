/**
 * Моки данных для API
 */

import sectionsMock from '../../mocks/sections.json'

// Кэш для хранения моков
const mockCache = {
  sections: sectionsMock,
  users: [
    {
      id: '1',
      username: 'admin',
      password: 'admin123', // В реальном приложении пароль должен быть хеширован
      role: 'admin',
      name: 'Администратор',
    },
    {
      id: '2',
      username: 'client',
      password: 'client123', // В реальном приложении пароль должен быть хеширован
      role: 'client',
      name: 'Клиент',
    },
  ],
  // Храним соответствие токен -> userId для моков
  tokens: {},
}

/**
 * Получить мок данные по эндпоинту
 */
export function getMockData(endpoint, method, data, headers = {}) {
  // Нормализуем endpoint
  const normalizedEndpoint = endpoint.replace(/^\/api/, '')

  // GET /sections
  if (normalizedEndpoint === '/sections' && method === 'GET') {
    return mockCache.sections
  }

  // GET /sections/:id
  const sectionMatch = normalizedEndpoint.match(/^\/sections\/(\d+)$/)
  if (sectionMatch && method === 'GET') {
    const sectionId = sectionMatch[1]
    const section = mockCache.sections.data.find((s) => s.id === sectionId)
    return {
      data: section,
      success: true,
    }
  }

  // GET /sections/:id/pages
  const pagesMatch = normalizedEndpoint.match(/^\/sections\/(\d+)\/pages$/)
  if (pagesMatch && method === 'GET') {
    const sectionId = pagesMatch[1]
    const section = mockCache.sections.data.find((s) => s.id === sectionId)
    return {
      data: section?.pages || [],
      success: true,
    }
  }

  // GET /sections/:id/pages/:pageId
  const pageMatch = normalizedEndpoint.match(/^\/sections\/(\d+)\/pages\/(.+)$/)
  if (pageMatch && method === 'GET') {
    const sectionId = pageMatch[1]
    const pageId = pageMatch[2]
    const section = mockCache.sections.data.find((s) => s.id === sectionId)
    const page = section?.pages.find((p) => p.id === pageId)
    return {
      data: page,
      success: true,
    }
  }

  // POST /sections
  if (normalizedEndpoint === '/sections' && method === 'POST') {
    const newSection = {
      id: Date.now().toString(),
      title: data.title,
      pages: [],
    }
    mockCache.sections.data.push(newSection)
    return {
      data: newSection,
      success: true,
    }
  }

  // PUT /sections/:id
  if (sectionMatch && method === 'PUT') {
    const sectionId = sectionMatch[1]
    const section = mockCache.sections.data.find((s) => s.id === sectionId)
    if (section) {
      section.title = data.title
      return {
        data: section,
        success: true,
      }
    }
  }

  // DELETE /sections/:id
  if (sectionMatch && method === 'DELETE') {
    const sectionId = sectionMatch[1]
    mockCache.sections.data = mockCache.sections.data.filter(
      (s) => s.id !== sectionId
    )
    return {
      success: true,
    }
  }

  // POST /sections/:id/pages
  if (pagesMatch && method === 'POST') {
    const sectionId = pagesMatch[1]
    const section = mockCache.sections.data.find((s) => s.id === sectionId)
    if (section) {
      const newPage = {
        id: `${sectionId}-${Date.now()}`,
        title: data.title,
        content: data.content || { blocks: [] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      section.pages.push(newPage)
      return {
        data: newPage,
        success: true,
      }
    }
  }

  // PUT /sections/:id/pages/:pageId
  if (pageMatch && method === 'PUT') {
    const sectionId = pageMatch[1]
    const pageId = pageMatch[2]
    const section = mockCache.sections.data.find((s) => s.id === sectionId)
    const page = section?.pages.find((p) => p.id === pageId)
    if (page) {
      Object.assign(page, data)
      page.updatedAt = new Date().toISOString()
      return {
        data: page,
        success: true,
      }
    }
  }

  // DELETE /sections/:id/pages/:pageId
  if (pageMatch && method === 'DELETE') {
    const sectionId = pageMatch[1]
    const pageId = pageMatch[2]
    const section = mockCache.sections.data.find((s) => s.id === sectionId)
    if (section) {
      section.pages = section.pages.filter((p) => p.id !== pageId)
      return {
        success: true,
      }
    }
  }

  // POST /auth/login
  if (normalizedEndpoint === '/auth/login' && method === 'POST') {
    const { username, password } = data
    const user = mockCache.users.find(
      (u) => u.username === username && u.password === password
    )
    if (user) {
      // Генерируем простой мок токен (в реальном приложении это должен быть JWT)
      const token = `mock_jwt_token_${user.id}_${Date.now()}`
      // Сохраняем соответствие токен -> userId для моков
      mockCache.tokens[token] = user.id
      const { password: _, ...userWithoutPassword } = user
      return {
        token,
        user: userWithoutPassword,
        success: true,
      }
    } else {
      throw new Error('Неверное имя пользователя или пароль')
    }
  }

  // POST /auth/logout
  if (normalizedEndpoint === '/auth/logout' && method === 'POST') {
    // В моках токен будет удален из cookies на клиенте
    return {
      success: true,
      message: 'Выход выполнен успешно',
    }
  }

  // GET /auth/me
  if (normalizedEndpoint === '/auth/me' && method === 'GET') {
    // Извлекаем токен из заголовка Authorization
    const authHeader = headers.Authorization || headers.authorization
    let token = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
    
    if (!token) {
      throw new Error('Не авторизован')
    }
    
    // Извлекаем userId из токена (формат: mock_jwt_token_${user.id}_${timestamp})
    // Также проверяем кэш на случай, если он еще доступен
    let userId = mockCache.tokens[token]
    
    if (!userId) {
      // Пытаемся извлечь userId из самого токена
      const tokenMatch = token.match(/^mock_jwt_token_(\d+)_/)
      if (tokenMatch) {
        userId = tokenMatch[1]
        // Сохраняем в кэш для будущих запросов
        mockCache.tokens[token] = userId
      }
    }
    
    if (!userId) {
      throw new Error('Не авторизован')
    }
    
    const user = mockCache.users.find((u) => u.id === userId)
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user
      return {
        user: userWithoutPassword,
        success: true,
      }
    } else {
      throw new Error('Пользователь не найден')
    }
  }

  // Дефолтный ответ
  return {
    data: null,
    success: true,
  }
}

