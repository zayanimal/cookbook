import { apiClient } from './api'

/**
 * Сервис для работы с подразделами
 */
class SubsectionsService {
  /**
   * Получить все подразделы раздела
   */
  async getSubsectionsBySection(sectionId) {
    try {
      const response = await apiClient.get(`/sections/${sectionId}/subsections`)
      return response.data || []
    } catch (error) {
      console.error('Error fetching subsections:', error)
      throw error
    }
  }

  /**
   * Получить подраздел по ID
   */
  async getSubsectionById(subsectionId) {
    try {
      const response = await apiClient.get(`/subsections/${subsectionId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching subsection:', error)
      throw error
    }
  }

  /**
   * Создать новый подраздел
   */
  async createSubsection(sectionId, title) {
    try {
      const response = await apiClient.post(
        `/sections/${sectionId}/subsections`,
        { title }
      )
      return response.data
    } catch (error) {
      console.error('Error creating subsection:', error)
      throw error
    }
  }

  /**
   * Обновить подраздел
   */
  async updateSubsection(subsectionId, title) {
    try {
      const response = await apiClient.put(`/subsections/${subsectionId}`, { title })
      return response.data
    } catch (error) {
      console.error('Error updating subsection:', error)
      throw error
    }
  }

  /**
   * Удалить подраздел
   */
  async deleteSubsection(subsectionId) {
    try {
      await apiClient.delete(`/subsections/${subsectionId}`)
      return true
    } catch (error) {
      console.error('Error deleting subsection:', error)
      throw error
    }
  }
}

export const subsectionsService = new SubsectionsService()
