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

  constructor() {
    makeAutoObservable(this)
  }

  /**
   * Загрузить все разделы с сервера
   */
  async loadSections() {
    this.loading = true
    this.error = null
    try {
      const sections = await sectionsService.getAllSections()
      runInAction(() => {
        this.sections = sections
        this.loading = false
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

    try {
      const pages = await pagesService.getPagesBySection(sectionId)
      runInAction(() => {
        section.pages = pages
      })
    } catch (error) {
      console.error('Error loading pages:', error)
      runInAction(() => {
        this.error = error.message || 'Ошибка загрузки страниц'
      })
    }
  }

  /**
   * Создать новый раздел
   */
  async addSection(title) {
    this.error = null
    try {
      const newSection = await sectionsService.createSection(title)
      runInAction(() => {
        this.sections.push(newSection)
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

