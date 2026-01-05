import { makeAutoObservable } from 'mobx'

/**
 * Store для управления UI состоянием
 */
class UIStore {
  selectedSectionId = null
  selectedPageId = null
  sidebarOpen = true
  error = null

  constructor() {
    makeAutoObservable(this)
  }

  /**
   * Переключить состояние боковой панели
   */
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen
  }

  /**
   * Установить состояние боковой панели
   */
  setSidebarOpen(open) {
    this.sidebarOpen = open
  }

  /**
   * Выбрать раздел
   */
  selectSection(sectionId) {
    this.selectedSectionId = sectionId
    this.selectedPageId = null
  }

  /**
   * Выбрать страницу
   */
  selectPage(pageId) {
    this.selectedPageId = pageId
  }

  /**
   * Сбросить выбранные элементы
   */
  clearSelection() {
    this.selectedSectionId = null
    this.selectedPageId = null
  }

  /**
   * Установить ошибку
   */
  setError(error) {
    this.error = error
  }

  /**
   * Очистить ошибку
   */
  clearError() {
    this.error = null
  }
}

export const uiStore = new UIStore()

