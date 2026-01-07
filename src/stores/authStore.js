/**
 * Store для управления авторизацией и ролями пользователей
 */

import { makeAutoObservable, runInAction } from 'mobx'
import { authService } from '../services/authService'

export const USER_ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client',
}

class AuthStore {
  user = null
  token = null
  isAuthenticated = false
  loading = false
  error = null

  constructor() {
    makeAutoObservable(this)
    // Не вызываем initializeAuth здесь, это делается в App.jsx
    // чтобы контролировать процесс инициализации
  }

  /**
   * Инициализация авторизации
   * Проверяет наличие токена и загружает данные пользователя
   */
  async initializeAuth() {
    const token = authService.getToken()
    if (token) {
      runInAction(() => {
        this.token = token
        this.isAuthenticated = true
        this.loading = true
      })
      try {
        await this.fetchCurrentUser()
      } catch (error) {
        // Если токен недействителен, очищаем авторизацию
        runInAction(() => {
          this.isAuthenticated = false
          this.token = null
          this.loading = false
        })
        authService.clearToken()
      }
    } else {
      runInAction(() => {
        this.isAuthenticated = false
        this.loading = false
      })
    }
  }

  /**
   * Вход пользователя
   */
  async login(username, password) {
    this.loading = true
    this.error = null
    try {
      const { user, token } = await authService.login(username, password)
      runInAction(() => {
        this.user = user
        this.token = token
        this.isAuthenticated = true
        this.loading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error.message || 'Ошибка авторизации'
        this.loading = false
        this.isAuthenticated = false
      })
      throw error
    }
  }

  /**
   * Выход пользователя
   */
  async logout() {
    this.loading = true
    try {
      await authService.logout()
    } catch (error) {
      console.error('Ошибка при выходе:', error)
    } finally {
      runInAction(() => {
        this.user = null
        this.token = null
        this.isAuthenticated = false
        this.loading = false
        this.error = null
      })
      authService.clearToken()
    }
  }

  /**
   * Загрузить данные текущего пользователя
   */
  async fetchCurrentUser() {
    this.loading = true
    this.error = null
    try {
      const user = await authService.getCurrentUser()
      runInAction(() => {
        this.user = user
        this.loading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error.message || 'Ошибка загрузки данных пользователя'
        this.loading = false
      })
      throw error
    }
  }

  /**
   * Очистить ошибку
   */
  clearError() {
    this.error = null
  }

  /**
   * Проверить, является ли пользователь администратором
   */
  get isAdmin() {
    return this.user?.role === USER_ROLES.ADMIN
  }

  /**
   * Проверить, является ли пользователь клиентом
   */
  get isClient() {
    return this.user?.role === USER_ROLES.CLIENT
  }

  /**
   * Проверить, может ли пользователь редактировать (только администратор)
   */
  get canEdit() {
    return this.isAdmin
  }

  /**
   * Проверить, может ли пользователь добавлять (только администратор)
   */
  get canAdd() {
    return this.isAdmin
  }
}

export const authStore = new AuthStore()

