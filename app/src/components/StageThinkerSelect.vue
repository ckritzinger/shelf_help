<script setup>
import { ref, onMounted } from 'vue'
import { useAppState } from '../composables/useAppState'
import { useThinkerLoader } from '../composables/useThinkerLoader'
import ThinkerCard from './ThinkerCard.vue'
import LoadingSpinner from './LoadingSpinner.vue'

const { state, setStage } = useAppState()
const { loadThinkers } = useThinkerLoader()

const isLoading = ref(false)
const error = ref('')

function selectThinker(id) {
  state.selectedThinkerId = id
  setStage('conversation')
}

async function load() {
  isLoading.value = true
  error.value = ''
  try {
    await loadThinkers()
  } catch (e) {
    error.value = e?.message || 'Something went wrong. Try again.'
    alert(error.value)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (state.thinkerRecommendations.length === 0) load()
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] px-4 py-12">
    <div class="w-full max-w-xl">
      <h2 class="font-serif text-2xl text-warm-800 mb-2 text-center">Who would you like to talk to?</h2>
      <p class="text-warm-500 text-sm text-center mb-8">Based on what you shared, here are some thinkers who might help.</p>

      <LoadingSpinner v-if="isLoading" />

      <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
        <p class="text-red-700 text-sm">{{ error }}</p>
        <button @click="load" class="mt-2 text-sm text-red-600 underline hover:text-red-800">Try again</button>
      </div>

      <div v-if="!isLoading && state.thinkerRecommendations.length" class="space-y-4">
        <ThinkerCard
          v-for="t in state.thinkerRecommendations"
          :key="t.id"
          v-bind="t"
          @select="selectThinker"
        />
      </div>
    </div>
  </div>
</template>
