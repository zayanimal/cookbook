import { makeAutoObservable, runInAction } from 'mobx'
import { pagesService } from '../services/pagesService'

/**
 * Store для управления страницами
 */
class PagesStore {
  error = null

  constructor(sectionsStore) {
    makeAutoObservable(this)
    this.sectionsStore = sectionsStore
  }

  /**
   * Создать новую страницу в подразделе
   */
  async addPage(sectionId, subsectionId, title) {
    this.error = null
    try {
      const newPage = await pagesService.createPage(subsectionId, title)
      runInAction(() => {
        const subsection = this.sectionsStore.getSubsectionById(
          sectionId,
          subsectionId
        )
        if (subsection) {
          if (!subsection.pages) subsection.pages = []
          subsection.pages.push(newPage)
        }
      })
      return newPage.id
    } catch (error) {
      runInAction(() => {
        this.error = error.message || 'Ошибка создания страницы'
      })
      throw error
    }
  }

  /**
   * Обновить страницу
   */
  async updatePage(sectionId, subsectionId, pageId, updates) {
    this.error = null
    try {
      const updatedPage = await pagesService.updatePage(pageId, updates)
      runInAction(() => {
        const subsection = this.sectionsStore.getSubsectionById(
          sectionId,
          subsectionId
        )
        if (subsection?.pages) {
          const page = subsection.pages.find((p) => p.id === pageId)
          if (page) Object.assign(page, updatedPage)
        }
      })
    } catch (error) {
      runInAction(() => {
        this.error = error.message || 'Ошибка обновления страницы'
      })
      throw error
    }
  }

  /**
   * Удалить страницу
   */
  async deletePage(sectionId, subsectionId, pageId) {
    this.error = null
    try {
      await pagesService.deletePage(pageId)
      runInAction(() => {
        const subsection = this.sectionsStore.getSubsectionById(
          sectionId,
          subsectionId
        )
        if (subsection?.pages) {
          subsection.pages = subsection.pages.filter((p) => p.id !== pageId)
        }
      })
    } catch (error) {
      runInAction(() => {
        this.error = error.message || 'Ошибка удаления страницы'
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
}

export const createPagesStore = (sectionsStore) => new PagesStore(sectionsStore)

