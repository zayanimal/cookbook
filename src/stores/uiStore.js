import { makeAutoObservable } from 'mobx'

/**
 * Store для управления UI состоянием
 */
class UIStore {
  selectedSectionId = null
  selectedPageId = null
  sidebarOpen = true
  error = null
  sidebarWidth = 280
  isResizing = false

  constructor() {
    makeAutoObservable(this)
    // Загружаем сохраненную ширину сайдбара из localStorage
    const savedWidth = localStorage.getItem('sidebarWidth')
    if (savedWidth) {
      const width = parseInt(savedWidth, 10)
      if (width >= 200 && width <= 600) {
        this.sidebarWidth = width
      }
    }
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
   * Установить ширину боковой панели
   */
  setSidebarWidth(width) {
    // Ограничиваем ширину от 200 до 600 пикселей
    const clampedWidth = Math.max(200, Math.min(600, width))
    this.sidebarWidth = clampedWidth
    localStorage.setItem('sidebarWidth', clampedWidth.toString())
  }

  /**
   * Установить состояние изменения размера
   */
  setIsResizing(resizing) {
    this.isResizing = resizing
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

