import { makeAutoObservable, runInAction } from 'mobx'
import { sectionsService } from '../services/sectionsService'
import { subsectionsService } from '../services/subsectionsService'
import { pagesService } from '../services/pagesService'

/**
 * Store для управления разделами и подразделами
 */
class SectionsStore {

  sections = []

  loading = false

  error = null

  loaded = false

  constructor() {
    makeAutoObservable(this)
  }

  /**
   * Загрузить все разделы с сервера
   */
  async loadSections() {
    if (this.loading || this.loaded) {
      return
    }

    this.loading = true
    this.error = null
    try {
      const sections = await sectionsService.getAllSections()
      runInAction(() => {
        this.sections = sections
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
   * Загрузить подразделы для раздела
   */
  async loadSectionSubsections(sectionId) {
    const section = this.sections.find((s) => s.id === sectionId)
    if (!section) return

    try {
      const subsections = await subsectionsService.getSubsectionsBySection(sectionId)
      runInAction(() => {
        section.subsections = subsections
      })
    } catch (error) {
      console.error('Error loading subsections:', error)
      runInAction(() => {
        this.error = error.message || 'Ошибка загрузки подразделов'
      })
    }
  }

  /**
   * Загрузить страницы для подраздела
   */
  async loadSubsectionPages(sectionId, subsectionId) {
    const section = this.sections.find((s) => s.id === sectionId)
    const subsection = section?.subsections?.find((ss) => ss.id === subsectionId)
    if (!subsection) return

    try {
      const pages = await pagesService.getPagesBySubsection(subsectionId)
      runInAction(() => {
        subsection.pages = pages
      })
    } catch (error) {
      console.error('Error loading pages:', error)
      runInAction(() => {
        this.error = error.message || 'Ошибка загрузки страниц'
      })
    }
  }

  /**
   * Создать новый подраздел в разделе
   */
  async addSubsection(sectionId, title) {
    this.error = null
    try {
      const newSubsection = await subsectionsService.createSubsection(sectionId, title)
      runInAction(() => {
        const section = this.sections.find((s) => s.id === sectionId)
        if (section) {
          if (!section.subsections) section.subsections = []
          section.subsections.push(newSubsection)
        }
      })
      return newSubsection.id
    } catch (error) {
      runInAction(() => {
        this.error = error.message || 'Ошибка создания подраздела'
      })
      throw error
    }
  }

  /**
   * Обновить подраздел
   */
  async updateSubsection(sectionId, subsectionId, title) {
    this.error = null
    try {
      const updated = await subsectionsService.updateSubsection(subsectionId, title)
      runInAction(() => {
        const section = this.sections.find((s) => s.id === sectionId)
        const subsection = section?.subsections?.find((ss) => ss.id === subsectionId)
        if (subsection) subsection.title = updated.title
      })
    } catch (error) {
      runInAction(() => {
        this.error = error.message || 'Ошибка обновления подраздела'
      })
      throw error
    }
  }

  /**
   * Удалить подраздел
   */
  async deleteSubsection(sectionId, subsectionId) {
    this.error = null
    try {
      await subsectionsService.deleteSubsection(subsectionId)
      runInAction(() => {
        const section = this.sections.find((s) => s.id === sectionId)
        if (section?.subsections) {
          section.subsections = section.subsections.filter(
            (ss) => ss.id !== subsectionId
          )
        }
      })
    } catch (error) {
      runInAction(() => {
        this.error = error.message || 'Ошибка удаления подраздела'
      })
      throw error
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
   * Получить подраздел по ID
   */
  getSubsectionById(sectionId, subsectionId) {
    const section = this.sections.find((s) => s.id === sectionId)
    return section?.subsections?.find((ss) => ss.id === subsectionId)
  }

  /**
   * Очистить ошибку
   */
  clearError() {
    this.error = null
  }
}

export const sectionsStore = new SectionsStore()

