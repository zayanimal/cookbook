import { makeAutoObservable, runInAction } from 'mobx'
import { sectionsService } from '../services/sectionsService'
import { pagesService } from '../services/pagesService'

class CookbookStore {
  sections = []
  selectedSectionId = null
  selectedPageId = null
  sidebarOpen = true
  loading = false
  error = null

  constructor() {
    makeAutoObservable(this)
    this.loadSections()
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

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen
  }

  setSidebarOpen(open) {
    this.sidebarOpen = open
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
        if (this.selectedSectionId === sectionId) {
          this.selectedSectionId = null
          this.selectedPageId = null
        }
      })
    } catch (error) {
      runInAction(() => {
        this.error = error.message || 'Ошибка удаления раздела'
      })
      throw error
    }
  }

  selectSection(sectionId) {
    this.selectedSectionId = sectionId
    this.selectedPageId = null
    // Загружаем страницы раздела, если они еще не загружены
    const section = this.sections.find((s) => s.id === sectionId)
    if (section && (!section.pages || section.pages.length === 0)) {
      this.loadSectionPages(sectionId)
    }
  }

  /**
   * Создать новую страницу
   */
  async addPage(sectionId, title) {
    this.error = null
    try {
      const newPage = await pagesService.createPage(sectionId, title)
      runInAction(() => {
        const section = this.sections.find((s) => s.id === sectionId)
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
        const section = this.sections.find((s) => s.id === sectionId)
        if (section) {
          const page = section.pages.find((p) => p.id === pageId)
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
        const section = this.sections.find((s) => s.id === sectionId)
        if (section) {
          section.pages = section.pages.filter((p) => p.id !== pageId)
          if (this.selectedPageId === pageId) {
            this.selectedPageId = null
          }
        }
      })
    } catch (error) {
      runInAction(() => {
        this.error = error.message || 'Ошибка удаления страницы'
      })
      throw error
    }
  }

  selectPage(pageId) {
    this.selectedPageId = pageId
  }

  getSelectedSection() {
    return this.sections.find((s) => s.id === this.selectedSectionId)
  }

  getSelectedPage() {
    const section = this.getSelectedSection()
    if (section) {
      return section.pages?.find((p) => p.id === this.selectedPageId)
    }
    return null
  }

  clearError() {
    this.error = null
  }
}

export const cookbookStore = new CookbookStore()
