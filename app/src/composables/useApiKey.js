import { ref, computed } from 'vue'

const STORAGE_KEY = 'shelf_help_api_key'

function resolveInitialKey() {
  const param = new URLSearchParams(window.location.search).get('apiKey')
  if (param) {
    localStorage.setItem(STORAGE_KEY, param)
    // Remove from URL so it's not visible or shared
    const url = new URL(window.location.href)
    url.searchParams.delete('apiKey')
    window.history.replaceState({}, '', url)
    return param
  }
  return localStorage.getItem(STORAGE_KEY) || ''
}

const apiKey = ref(resolveInitialKey())

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
