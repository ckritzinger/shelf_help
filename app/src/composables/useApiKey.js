import { ref, computed } from 'vue'

const STORAGE_KEY = 'shelf_help_api_key'
const apiKey = ref(localStorage.getItem(STORAGE_KEY) || '')

export function useApiKey() {
  const hasKey = computed(() => apiKey.value.length > 0)

  function setApiKey(key) {
    apiKey.value = key.trim()
    localStorage.setItem(STORAGE_KEY, apiKey.value)
  }

  function clearApiKey() {
    apiKey.value = ''
    localStorage.removeItem(STORAGE_KEY)
  }

  return { apiKey, hasKey, setApiKey, clearApiKey }
}
