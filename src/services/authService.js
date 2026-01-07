/**
 * Сервис для работы с авторизацией
 */

import { apiClient } from './api'
import Cookies from 'js-cookie'

const TOKEN_COOKIE_NAME = 'auth_token'

class AuthService {
  /**
   * Авторизация пользователя
   * @param {string} username - Имя пользователя
   * @param {string} password - Пароль
   * @returns {Promise<{user: Object, token: string}>}
   */
  async login(username, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password,
      })

      const { token, user } = response

      // Сохраняем токен в cookies
      if (token) {
        // Устанавливаем cookie на 7 дней
        Cookies.set(TOKEN_COOKIE_NAME, token, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        })
      }

      return { user, token }
    } catch (error) {
      throw new Error(error.message || 'Ошибка авторизации')
    }
  }

  /**
   * Выход пользователя
   */
  async logout() {
    try {
      // Отправляем запрос на бекенд для удаления токена
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('Ошибка при выходе:', error)
    } finally {
      // Удаляем токен из cookies
      Cookies.remove(TOKEN_COOKIE_NAME)
    }
  }

  /**
   * Получить текущего пользователя
   * @returns {Promise<Object>}
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me')
      return response.user
    } catch (error) {
      throw new Error(error.message || 'Ошибка получения данных пользователя')
    }
  }

  /**
   * Получить токен из cookies
   * @returns {string|null}
   */
  getToken() {
    return Cookies.get(TOKEN_COOKIE_NAME) || null
  }

  /**
   * Проверить, авторизован ли пользователь
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getToken()
  }

  /**
   * Удалить токен из cookies
   */
  clearToken() {
    Cookies.remove(TOKEN_COOKIE_NAME)
  }
}

export const authService = new AuthService()

