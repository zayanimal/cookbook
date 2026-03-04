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
  }

  /**
   * Загрузить все разделы
   */
  async loadSections() {
    return this.sectionsStore.loadSections()
  }

  /**
   * Загрузить подразделы для раздела
   */
  async loadSectionSubsections(sectionId) {
    return this.sectionsStore.loadSectionSubsections(sectionId)
  }

  /**
   * Загрузить страницы для подраздела
   */
  async loadSubsectionPages(sectionId, subsectionId) {
    return this.sectionsStore.loadSubsectionPages(sectionId, subsectionId)
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
      if (this.uiStore.selectedSectionId === sectionId) {
        this.uiStore.clearSelection()
      }
    } catch (error) {
      this.uiStore.setError(this.sectionsStore.error)
      throw error
    }
  }

  /**
   * Создать новый подраздел
   */
  async addSubsection(sectionId, title) {
    try {
      const subsectionId = await this.sectionsStore.addSubsection(sectionId, title)
      return subsectionId
    } catch (error) {
      this.uiStore.setError(this.sectionsStore.error)
      throw error
    }
  }

  /**
   * Обновить подраздел
   */
  async updateSubsection(sectionId, subsectionId, title) {
    try {
      await this.sectionsStore.updateSubsection(sectionId, subsectionId, title)
    } catch (error) {
      this.uiStore.setError(this.sectionsStore.error)
      throw error
    }
  }

  /**
   * Удалить подраздел
   */
  async deleteSubsection(sectionId, subsectionId) {
    try {
      await this.sectionsStore.deleteSubsection(sectionId, subsectionId)
      if (this.uiStore.selectedSubsectionId === subsectionId) {
        this.uiStore.selectPage(null)
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
    const section = this.sectionsStore.getSectionById(sectionId)
    if (section && (!section.subsections || section.subsections.length === 0)) {
      this.loadSectionSubsections(sectionId)
    }
  }

  /**
   * Выбрать подраздел
   */
  selectSubsection(sectionId, subsectionId) {
    this.uiStore.selectSubsection(subsectionId)
    const subsection = this.sectionsStore.getSubsectionById(
      sectionId,
      subsectionId
    )
    if (
      subsection &&
      (!subsection.pages || subsection.pages.length === 0)
    ) {
      this.loadSubsectionPages(sectionId, subsectionId)
    }
  }

  /**
   * Создать новую страницу в подразделе
   */
  async addPage(sectionId, subsectionId, title) {
    try {
      const pageId = await this.pagesStore.addPage(
        sectionId,
        subsectionId,
        title
      )
      return pageId
    } catch (error) {
      this.uiStore.setError(this.pagesStore.error)
      throw error
    }
  }

  /**
   * Обновить страницу
   */
  async updatePage(sectionId, subsectionId, pageId, updates) {
    try {
      await this.pagesStore.updatePage(
        sectionId,
        subsectionId,
        pageId,
        updates
      )
    } catch (error) {
      this.uiStore.setError(this.pagesStore.error)
      throw error
    }
  }

  /**
   * Удалить страницу
   */
  async deletePage(sectionId, subsectionId, pageId) {
    try {
      await this.pagesStore.deletePage(sectionId, subsectionId, pageId)
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
   * Получить выбранный подраздел
   */
  getSelectedSubsection() {
    const section = this.getSelectedSection()
    if (!section || !this.uiStore.selectedSubsectionId) return null
    return this.sectionsStore.getSubsectionById(
      section.id,
      this.uiStore.selectedSubsectionId
    )
  }

  /**
   * Получить выбранную страницу
   */
  getSelectedPage() {
    const subsection = this.getSelectedSubsection()
    if (subsection && this.uiStore.selectedPageId) {
      return subsection.pages?.find((p) => p.id === this.uiStore.selectedPageId)
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
   * Установить ширину боковой панели
   */
  setSidebarWidth(width) {
    this.uiStore.setSidebarWidth(width)
  }

  /**
   * Установить состояние изменения размера
   */
  setIsResizing(resizing) {
    this.uiStore.setIsResizing(resizing)
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

  get selectedSubsectionId() {
    return this.uiStore.selectedSubsectionId
  }

  get selectedPageId() {
    return this.uiStore.selectedPageId
  }

  get sidebarOpen() {
    return this.uiStore.sidebarOpen
  }

  get sidebarWidth() {
    return this.uiStore.sidebarWidth
  }

  get isResizing() {
    return this.uiStore.isResizing
  }

  get loading() {
    return this.sectionsStore.loading
  }

  get error() {
    return this.uiStore.error || this.sectionsStore.error || this.pagesStore.error
  }
}

export const cookbookStore = new CookbookStore()
