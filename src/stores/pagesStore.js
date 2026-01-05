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
   * Создать новую страницу
   */
  async addPage(sectionId, title) {
    this.error = null
    try {
      const newPage = await pagesService.createPage(sectionId, title)
      runInAction(() => {
        const section = this.sectionsStore.getSectionById(sectionId)
        if (section) {
          if (!section.pages) {
            section.pages = []
          }
          section.pages.push(newPage)
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
  async updatePage(sectionId, pageId, updates) {
    this.error = null
    try {
      const updatedPage = await pagesService.updatePage(sectionId, pageId, updates)
      runInAction(() => {
        const section = this.sectionsStore.getSectionById(sectionId)
        if (section) {
          const page = section.pages?.find((p) => p.id === pageId)
          if (page) {
            Object.assign(page, updatedPage)
          }
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
  async deletePage(sectionId, pageId) {
    this.error = null
    try {
      await pagesService.deletePage(sectionId, pageId)
      runInAction(() => {
        const section = this.sectionsStore.getSectionById(sectionId)
        if (section) {
          section.pages = section.pages?.filter((p) => p.id !== pageId) || []
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

