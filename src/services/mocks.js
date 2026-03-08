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

  // GET /sections/:id/subsections
  const subsectionsMatch = normalizedEndpoint.match(
    /^\/sections\/(\d+)\/subsections$/
  )
  if (subsectionsMatch && method === 'GET') {
    const sectionId = subsectionsMatch[1]
    const section = mockCache.sections.data.find((s) => s.id === sectionId)
    return {
      data: section?.subsections || [],
      success: true,
    }
  }

  // GET /subsections/:subsectionId
  const subsectionMatch = normalizedEndpoint.match(/^\/subsections\/([^/]+)$/)
  if (subsectionMatch && method === 'GET') {
    const subsectionId = subsectionMatch[1]
    for (const section of mockCache.sections.data) {
      const subsection = section.subsections?.find((ss) => ss.id === subsectionId)
      if (subsection) return { data: subsection, success: true }
    }
    return { data: null, success: true }
  }

  // GET /subsections/:subsectionId/pages
  const subsectionPagesMatch = normalizedEndpoint.match(
    /^\/subsections\/([^/]+)\/pages$/
  )
  if (subsectionPagesMatch && method === 'GET') {
    const subsectionId = subsectionPagesMatch[1]
    for (const section of mockCache.sections.data) {
      const subsection = section.subsections?.find((ss) => ss.id === subsectionId)
      if (subsection) return { data: subsection.pages || [], success: true }
    }
    return { data: [], success: true }
  }

  // GET /pages/:pageId
  const pageMatch = normalizedEndpoint.match(/^\/pages\/(.+)$/)
  if (pageMatch && method === 'GET') {
    const pageId = pageMatch[1]
    for (const section of mockCache.sections.data) {
      for (const subsection of section.subsections || []) {
        const page = subsection.pages?.find((p) => p.id === pageId)
        if (page) return { data: page, success: true }
      }
    }
    return { data: null, success: true }
  }

  // POST /sections
  if (normalizedEndpoint === '/sections' && method === 'POST') {
    const newSection = {
      id: Date.now().toString(),
      title: data.title,
      subsections: [],
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

  // POST /sections/:id/subsections
  if (subsectionsMatch && method === 'POST') {
    const sectionId = subsectionsMatch[1]
    const section = mockCache.sections.data.find((s) => s.id === sectionId)
    if (section) {
      if (!section.subsections) section.subsections = []
      const newSubsection = {
        id: `${sectionId}-${Date.now()}`,
        title: data.title,
        pages: [],
      }
      section.subsections.push(newSubsection)
      return {
        data: newSubsection,
        success: true,
      }
    }
  }

  // PUT /subsections/:subsectionId
  if (subsectionMatch && method === 'PUT') {
    const subsectionId = subsectionMatch[1]
    for (const section of mockCache.sections.data) {
      const subsection = section.subsections?.find((ss) => ss.id === subsectionId)
      if (subsection) {
        subsection.title = data.title
        return { data: subsection, success: true }
      }
    }
  }

  // DELETE /subsections/:subsectionId
  if (subsectionMatch && method === 'DELETE') {
    const subsectionId = subsectionMatch[1]
    for (const section of mockCache.sections.data) {
      if (section.subsections) {
        const before = section.subsections.length
        section.subsections = section.subsections.filter((ss) => ss.id !== subsectionId)
        if (section.subsections.length < before) return { success: true }
      }
    }
  }

  // POST /subsections/:subsectionId/pages
  if (subsectionPagesMatch && method === 'POST') {
    const subsectionId = subsectionPagesMatch[1]
    for (const section of mockCache.sections.data) {
      const subsection = section.subsections?.find((ss) => ss.id === subsectionId)
      if (subsection) {
        if (!subsection.pages) subsection.pages = []
        const newPage = {
          id: `${subsectionId}-${Date.now()}`,
          title: data.title,
          content: data.content || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        subsection.pages.push(newPage)
        return { data: newPage, success: true }
      }
    }
  }

  // PUT /pages/:pageId
  if (pageMatch && method === 'PUT') {
    const pageId = pageMatch[1]
    for (const section of mockCache.sections.data) {
      for (const subsection of section.subsections || []) {
        const page = subsection.pages?.find((p) => p.id === pageId)
        if (page) {
          Object.assign(page, data)
          page.updatedAt = new Date().toISOString()
          return { data: page, success: true }
        }
      }
    }
  }

  // DELETE /pages/:pageId
  if (pageMatch && method === 'DELETE') {
    const pageId = pageMatch[1]
    for (const section of mockCache.sections.data) {
      for (const subsection of section.subsections || []) {
        if (subsection.pages) {
          const before = subsection.pages.length
          subsection.pages = subsection.pages.filter((p) => p.id !== pageId)
          if (subsection.pages.length < before) return { success: true }
        }
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

