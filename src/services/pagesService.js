import { apiClient } from './api'

/**
 * Сервис для работы со страницами (внутри подраздела)
 */
class PagesService {
  /**
   * Получить все страницы подраздела
   */
  async getPagesBySubsection(subsectionId) {
    try {
      const response = await apiClient.get(`/subsections/${subsectionId}/pages`)
      return response.data || []
    } catch (error) {
      console.error('Error fetching pages:', error)
      throw error
    }
  }

  /**
   * Создать новую страницу в подразделе
   */
  async createPage(subsectionId, title, content = '') {
    try {
      const response = await apiClient.post(
        `/subsections/${subsectionId}/pages`,
        { title, content }
      )
      return response.data
    } catch (error) {
      console.error('Error creating page:', error)
      throw error
    }
  }

  /**
   * Обновить страницу
   */
  async updatePage(pageId, updates) {
    try {
      const response = await apiClient.put(`/pages/${pageId}`, updates)
      return response.data
    } catch (error) {
      console.error('Error updating page:', error)
      throw error
    }
  }

  /**
   * Удалить страницу
   */
  async deletePage(pageId) {
    try {
      await apiClient.delete(`/pages/${pageId}`)
      return true
    } catch (error) {
      console.error('Error deleting page:', error)
      throw error
    }
  }
}

export const pagesService = new PagesService()

