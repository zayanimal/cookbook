import { sectionsStore } from './sectionsStore'
import { createPagesStore } from './pagesStore'
import { uiStore } from './uiStore'

/**
 * Главный store, объединяющий все функциональные области
 */
class CookbookStore {
  constructor() {
    this.sectionsStore = sectionsStore
    this.pagesStore = createPagesStore(sectionsStore)
    this.uiStore = uiStore

    // Загружаем разделы при инициализации
    this.sectionsStore.loadSections()
  }

  /**
   * Загрузить все разделы
   */
  async loadSections() {
    return this.sectionsStore.loadSections()
  }

  /**
   * Загрузить страницы для раздела
   */
  async loadSectionPages(sectionId) {
    return this.sectionsStore.loadSectionPages(sectionId)
  }

  /**
   * Создать новый раздел
   */
  async addSection(title) {
    try {
      const sectionId = await this.sectionsStore.addSection(title)
      return sectionId
    } catch (error) {
      this.uiStore.setError(this.sectionsStore.error)
      throw error
    }
  }

  /**
   * Обновить раздел
   */
  async updateSection(sectionId, title) {
    try {
      await this.sectionsStore.updateSection(sectionId, title)
    } catch (error) {
      this.uiStore.setError(this.sectionsStore.error)
      throw error
    }
  }

  /**
   * Удалить раздел
   */
  async deleteSection(sectionId) {
    try {
      await this.sectionsStore.deleteSection(sectionId)
      // Если удаляемый раздел был выбран, сбрасываем выбор
      if (this.uiStore.selectedSectionId === sectionId) {
        this.uiStore.clearSelection()
      }
    } catch (error) {
      this.uiStore.setError(this.sectionsStore.error)
      throw error
    }
  }

  /**
   * Выбрать раздел
   */
  selectSection(sectionId) {
    this.uiStore.selectSection(sectionId)
    // Загружаем страницы раздела, если они еще не загружены
    const section = this.sectionsStore.getSectionById(sectionId)
    if (section && (!section.pages || section.pages.length === 0)) {
      this.loadSectionPages(sectionId)
    }
  }

  /**
   * Создать новую страницу
   */
  async addPage(sectionId, title) {
    try {
      const pageId = await this.pagesStore.addPage(sectionId, title)
      return pageId
    } catch (error) {
      this.uiStore.setError(this.pagesStore.error)
      throw error
    }
  }

  /**
   * Обновить страницу
   */
  async updatePage(sectionId, pageId, updates) {
    try {
      await this.pagesStore.updatePage(sectionId, pageId, updates)
    } catch (error) {
      this.uiStore.setError(this.pagesStore.error)
      throw error
    }
  }

  /**
   * Удалить страницу
   */
  async deletePage(sectionId, pageId) {
    try {
      await this.pagesStore.deletePage(sectionId, pageId)
      // Если удаляемая страница была выбрана, сбрасываем выбор страницы
      if (this.uiStore.selectedPageId === pageId) {
        this.uiStore.selectPage(null)
      }
    } catch (error) {
      this.uiStore.setError(this.pagesStore.error)
      throw error
    }
  }

  /**
   * Выбрать страницу
   */
  selectPage(pageId) {
    this.uiStore.selectPage(pageId)
  }

  /**
   * Получить выбранный раздел
   */
  getSelectedSection() {
    if (!this.uiStore.selectedSectionId) return null
    return this.sectionsStore.getSectionById(this.uiStore.selectedSectionId)
  }

  /**
   * Получить выбранную страницу
   */
  getSelectedPage() {
    const section = this.getSelectedSection()
    if (section && this.uiStore.selectedPageId) {
      return section.pages?.find((p) => p.id === this.uiStore.selectedPageId)
    }
    return null
  }

  /**
   * Переключить боковую панель
   */
  toggleSidebar() {
    this.uiStore.toggleSidebar()
  }

  /**
   * Установить состояние боковой панели
   */
  setSidebarOpen(open) {
    this.uiStore.setSidebarOpen(open)
  }

  /**
   * Очистить ошибку
   */
  clearError() {
    this.uiStore.clearError()
    this.sectionsStore.clearError()
    this.pagesStore.clearError()
  }

  // Геттеры для удобного доступа к состояниям
  get sections() {
    return this.sectionsStore.sections
  }

  get selectedSectionId() {
    return this.uiStore.selectedSectionId
  }

  get selectedPageId() {
    return this.uiStore.selectedPageId
  }

  get sidebarOpen() {
    return this.uiStore.sidebarOpen
  }

  get loading() {
    return this.sectionsStore.loading
  }

  get error() {
    return this.uiStore.error || this.sectionsStore.error || this.pagesStore.error
  }
}

export const cookbookStore = new CookbookStore()
