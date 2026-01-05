import { apiClient } from './api'

/**
 * Сервис для работы с разделами
 */
class SectionsService {
  /**
   * Получить все разделы
   */
  async getAllSections() {
    try {
      const response = await apiClient.get('/sections')
      return response.data || []
    } catch (error) {
      console.error('Error fetching sections:', error)
      throw error
    }
  }

  /**
   * Получить раздел по ID
   */
  async getSectionById(sectionId) {
    try {
      const response = await apiClient.get(`/sections/${sectionId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching section:', error)
      throw error
    }
  }

  /**
   * Создать новый раздел
   */
  async createSection(title) {
    try {
      const response = await apiClient.post('/sections', { title })
      return response.data
    } catch (error) {
      console.error('Error creating section:', error)
      throw error
    }
  }

  /**
   * Обновить раздел
   */
  async updateSection(sectionId, title) {
    try {
      const response = await apiClient.put(`/sections/${sectionId}`, { title })
      return response.data
    } catch (error) {
      console.error('Error updating section:', error)
      throw error
    }
  }

  /**
   * Удалить раздел
   */
  async deleteSection(sectionId) {
    try {
      await apiClient.delete(`/sections/${sectionId}`)
      return true
    } catch (error) {
      console.error('Error deleting section:', error)
      throw error
    }
  }
}

export const sectionsService = new SectionsService()

