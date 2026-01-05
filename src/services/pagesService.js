import { apiClient } from './api'

/**
 * Сервис для работы со страницами
 */
class PagesService {
  /**
   * Получить все страницы раздела
   */
  async getPagesBySection(sectionId) {
    try {
      const response = await apiClient.get(`/sections/${sectionId}/pages`)
      return response.data || []
    } catch (error) {
      console.error('Error fetching pages:', error)
      throw error
    }
  }

  /**
   * Получить страницу по ID
   */
  async getPageById(sectionId, pageId) {
    try {
      const response = await apiClient.get(`/sections/${sectionId}/pages/${pageId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching page:', error)
      throw error
    }
  }

  /**
   * Создать новую страницу
   */
  async createPage(sectionId, title, content = { blocks: [] }) {
    try {
      const response = await apiClient.post(`/sections/${sectionId}/pages`, {
        title,
        content,
      })
      return response.data
    } catch (error) {
      console.error('Error creating page:', error)
      throw error
    }
  }

  /**
   * Обновить страницу
   */
  async updatePage(sectionId, pageId, updates) {
    try {
      const response = await apiClient.put(`/sections/${sectionId}/pages/${pageId}`, updates)
      return response.data
    } catch (error) {
      console.error('Error updating page:', error)
      throw error
    }
  }

  /**
   * Удалить страницу
   */
  async deletePage(sectionId, pageId) {
    try {
      await apiClient.delete(`/sections/${sectionId}/pages/${pageId}`)
      return true
    } catch (error) {
      console.error('Error deleting page:', error)
      throw error
    }
  }
}

export const pagesService = new PagesService()

