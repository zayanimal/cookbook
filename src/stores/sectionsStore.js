import { makeAutoObservable, runInAction } from 'mobx'
import { sectionsService } from '../services/sectionsService'
import { pagesService } from '../services/pagesService'

/**
 * Store для управления разделами
 */
class SectionsStore {

  sections = []

  loading = false

  error = null

  loaded = false

  // Отслеживание загрузки страниц для каждой секции
  pagesLoading = {}

  constructor() {
    makeAutoObservable(this)
  }

  /**
   * Загрузить все разделы с сервера
   */
  async loadSections() {
    // Предотвращаем повторную загрузку, если уже загружается или уже загружено
    if (this.loading || this.loaded) {
      return
    }
    
    this.loading = true
    this.error = null
    try {
      const sections = await sectionsService.getAllSections()
      runInAction(() => {
        // Удаляем pages из каждой секции, чтобы они загружались отдельно
        this.sections = sections.map(section => ({
          ...section,
          pages: undefined // Не загружаем pages сразу
        }))
        this.loading = false
        this.loaded = true
      })
    } catch (error) {
      runInAction(() => {
        this.error = error.message || 'Ошибка загрузки разделов'
        this.loading = false
        console.error('Error loading sections:', error)
      })
    }
  }

  /**
   * Загрузить страницы для раздела
   */
  async loadSectionPages(sectionId) {
    const section = this.sections.find((s) => s.id === sectionId)
    if (!section) return

    // Если страницы уже загружены, не загружаем снова
    if (section.pages !== undefined) {
      return
    }

    // Если уже идет загрузка страниц для этой секции, не запускаем повторную загрузку
    if (this.pagesLoading[sectionId]) {
      return
    }

    runInAction(() => {
      this.pagesLoading[sectionId] = true
    })

    try {
      const pages = await pagesService.getPagesBySection(sectionId)
      runInAction(() => {
        section.pages = pages
        this.pagesLoading[sectionId] = false
      })
    } catch (error) {
      console.error('Error loading pages:', error)
      runInAction(() => {
        this.error = error.message || 'Ошибка загрузки страниц'
        this.pagesLoading[sectionId] = false
      })
    }
  }

  /**
   * Проверить, загружаются ли страницы для секции
   */
  isPagesLoading(sectionId) {
    return this.pagesLoading[sectionId] || false
  }

  /**
   * Создать новый раздел
   */
  async addSection(title) {
    this.error = null
    try {
      const newSection = await sectionsService.createSection(title)
      runInAction(() => {
        // Убеждаемся, что pages не загружены сразу для нового раздела
        const section = {
          ...newSection,
          pages: undefined
        }
        this.sections.push(section)
      })
      return newSection.id
    } catch (error) {
      runInAction(() => {
        this.error = error.message || 'Ошибка создания раздела'
      })
      throw error
    }
  }

  /**
   * Обновить раздел
   */
  async updateSection(sectionId, title) {
    this.error = null
    try {
      const updatedSection = await sectionsService.updateSection(sectionId, title)
      runInAction(() => {
        const section = this.sections.find((s) => s.id === sectionId)
        if (section) {
          section.title = updatedSection.title
        }
      })
    } catch (error) {
      runInAction(() => {
        this.error = error.message || 'Ошибка обновления раздела'
      })
      throw error
    }
  }

  /**
   * Удалить раздел
   */
  async deleteSection(sectionId) {
    this.error = null
    try {
      await sectionsService.deleteSection(sectionId)
      runInAction(() => {
        this.sections = this.sections.filter((s) => s.id !== sectionId)
      })
    } catch (error) {
      runInAction(() => {
        this.error = error.message || 'Ошибка удаления раздела'
      })
      throw error
    }
  }

  /**
   * Получить раздел по ID
   */
  getSectionById(sectionId) {
    return this.sections.find((s) => s.id === sectionId)
  }

  /**
   * Очистить ошибку
   */
  clearError() {
    this.error = null
  }
}

export const sectionsStore = new SectionsStore()

