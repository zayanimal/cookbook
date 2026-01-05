/**
 * Моки данных для API
 */

import sectionsMock from '../../mocks/sections.json'

// Кэш для хранения моков
const mockCache = {
  sections: sectionsMock,
}

/**
 * Получить мок данные по эндпоинту
 */
export function getMockData(endpoint, method, data) {
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

  // Дефолтный ответ
  return {
    data: null,
    success: true,
  }
}

