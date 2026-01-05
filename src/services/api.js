/**
 * Базовый API клиент для работы с бэкендом
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false' // По умолчанию используем моки

// Симуляция задержки сети
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
    this.useMocks = USE_MOCKS
  }

  /**
   * Выполняет GET запрос
   */
  async get(endpoint, options = {}) {
    if (this.useMocks) {
      return this.mockRequest('GET', endpoint, null, options)
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Выполняет POST запрос
   */
  async post(endpoint, data, options = {}) {
    if (this.useMocks) {
      return this.mockRequest('POST', endpoint, data, options)
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Выполняет PUT запрос
   */
  async put(endpoint, data, options = {}) {
    if (this.useMocks) {
      return this.mockRequest('PUT', endpoint, data, options)
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Выполняет DELETE запрос
   */
  async delete(endpoint, options = {}) {
    if (this.useMocks) {
      return this.mockRequest('DELETE', endpoint, null, options)
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Симулирует запрос к API используя моки
   */
  async mockRequest(method, endpoint, data, options) {
    await delay(options.delay || 300) // Симуляция задержки сети

    const { getMockData } = await import('./mocks')
    return getMockData(endpoint, method, data)
  }
}

export const apiClient = new ApiClient()

