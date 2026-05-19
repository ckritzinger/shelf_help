<script setup>
import { computed, onMounted, ref } from 'vue'
import { useApiKey } from './composables/useApiKey'
import { useAppState } from './composables/useAppState'
import { fetchAllThinkerProfiles } from './composables/useManifest'
import { useWhisper } from './composables/useWhisper'
import AppHeader from './components/AppHeader.vue'
import ApiKeyGate from './components/ApiKeyGate.vue'
import StageRant from './components/StageRant.vue'
import StageEmpathy from './components/StageEmpathy.vue'
import StageThinkerSelect from './components/StageThinkerSelect.vue'
import StageConversation from './components/StageConversation.vue'

const { hasKey, clearApiKey } = useApiKey()
const { state } = useAppState()

const showChangeKeyModal = ref(false)

function confirmChangeKey() {
  clearApiKey()
  showChangeKeyModal.value = false
}
const { loadModel } = useWhisper()

const stageComponents = {
  rant: StageRant,
  empathy: StageEmpathy,
  thinkerSelect: StageThinkerSelect,
  conversation: StageConversation,
}

const currentComponent = computed(() => stageComponents[state.stage] || StageRant)

onMounted(async () => {
  try {
    state.allThinkerProfiles = await fetchAllThinkerProfiles()
  } catch (e) {
    state.error = 'Failed to load thinker profiles. Is the dev server running?'
  }
  // Background — don't await, mic appears when ready
  loadModel()
})
</script>

<template>
  <div class="min-h-screen bg-warm-50">
    <AppHeader />

    <Transition name="stage" mode="out-in">
      <component :is="currentComponent" :key="state.stage" />
    </Transition>

    <ApiKeyGate v-if="!hasKey" />

    <footer class="mt-16 pb-8 text-center text-sm text-warm-400 space-y-1">
      <div class="text-warm-500 text-xs max-w-sm mx-auto px-4">
        All your information stays in your browser and is sent directly to the Claude API.
        <button @click="showChangeKeyModal = true" class="underline hover:text-warm-700 transition-colors">Use your own API key</button> for full privacy.
      </div>
      <div class="pt-2">
        <a href="https://github.com/ckritzinger/shelf_help" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 hover:text-warm-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
          GitHub
        </a>
      </div>
      <div>
        Made with ❤️ by <a href="https://intuitably.com/" target="_blank" rel="noopener" class="underline hover:text-warm-600 transition-colors">Intuitably</a>
      </div>
    </footer>

    <!-- Change API key modal -->
    <Transition name="fade">
      <div v-if="showChangeKeyModal" class="fixed inset-0 bg-warm-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
          <h2 class="font-serif text-xl text-warm-900 mb-3">Change API key?</h2>
          <p class="text-warm-600 text-sm mb-6 leading-relaxed">
            This will remove your current key from local storage. You'll be asked to enter a new one.
          </p>
          <div class="flex gap-3">
            <button
              @click="confirmChangeKey"
              class="flex-1 bg-warm-700 text-warm-50 font-medium py-2.5 rounded-xl hover:bg-warm-600 transition-colors text-sm"
            >
              Yes, change it
            </button>
            <button
              @click="showChangeKeyModal = false"
              class="flex-1 bg-warm-100 text-warm-700 font-medium py-2.5 rounded-xl hover:bg-warm-200 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
