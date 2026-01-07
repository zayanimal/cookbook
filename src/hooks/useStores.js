import { cookbookStore } from '../stores/cookbookStore'
import { authStore } from '../stores/authStore'

export const useStores = () => {
  return {
    cookbookStore,
    authStore,
  }
}

