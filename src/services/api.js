/**
 * Базовый API клиент для работы с бэкендом
 */

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false' // По умолчанию используем моки

// Симуляция задержки сети
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

// Создаем экземпляр axios с базовой конфигурацией
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 секунд таймаут
})

// Интерцептор для обработки ошибок
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Обрабатываем ошибки axios
    if (error.response) {
      // Сервер ответил с кодом ошибки
      const message = error.response.data?.error || error.response.data?.message || `HTTP error! status: ${error.response.status}`
      return Promise.reject(new Error(message))
    } else if (error.request) {
      // Запрос был отправлен, но ответа не получено
      return Promise.reject(new Error('Network error: No response from server'))
    } else {
      // Ошибка при настройке запроса
      return Promise.reject(new Error(error.message || 'Request setup error'))
    }
  }
)

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

    return (await axiosInstance.get(endpoint, options)).data
  }

  /**
   * Выполняет POST запрос
   */
  async post(endpoint, data, options = {}) {
    if (this.useMocks) {
      return this.mockRequest('POST', endpoint, data, options)
    }

    return (await axiosInstance.post(endpoint, data, options)).data
  }

  /**
   * Выполняет PUT запрос
   */
  async put(endpoint, data, options = {}) {
    if (this.useMocks) {
      return this.mockRequest('PUT', endpoint, data, options)
    }

    return (await axiosInstance.put(endpoint, data, options)).data
  }

  /**
   * Выполняет DELETE запрос
   */
  async delete(endpoint, options = {}) {
    if (this.useMocks) {
      return this.mockRequest('DELETE', endpoint, null, options)
    }

    return (await axiosInstance.delete(endpoint, options)).data
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
