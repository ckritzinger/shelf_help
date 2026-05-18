<script setup>
import { ref, onMounted } from 'vue'
import jsYaml from 'js-yaml'
import { useAppState } from '../composables/useAppState'
import { useAnthropicClient } from '../composables/useAnthropicClient'
import { fetchPrompt } from '../composables/useManifest'
import { parseThinkerResponse } from '../utils/parseThinkerResponse'
import ThinkerCard from './ThinkerCard.vue'
import LoadingSpinner from './LoadingSpinner.vue'

const { state, setStage } = useAppState()
const { sendMessage } = useAnthropicClient()

const isLoading = ref(false)
const error = ref('')
const rawResponse = ref('')

async function buildSelectorPrompt() {
  const template = await fetchPrompt('selector')

  const thinkerBlocks = Object.entries(state.allThinkerProfiles)
    .map(([, profile]) => {
      const yamlContent = jsYaml.dump(profile)
      return `<thinker>\n${yamlContent}\n</thinker>`
    })
    .join('\n\n')

  return template
    .replace('{{SUMMARY}}', state.summaryYaml)
    .replace('{{THINKER_BLOCKS}}', thinkerBlocks)
}

function selectThinker(id) {
  state.selectedThinkerId = id
  setStage('conversation')
}

// Build cards from all profiles as fallback
function allThinkerCards() {
  return Object.entries(state.allThinkerProfiles).map(([id, profile]) => ({
    id,
    name: profile.thinker.name,
    tagline: profile.thinker.tagline,
    whyRelevant: '',
  }))
}

async function load() {
  isLoading.value = true
  error.value = ''
  rawResponse.value = ''

  try {
    const systemPrompt = await buildSelectorPrompt()
    let response = ''
    await sendMessage({
      systemPrompt,
      messages: [{ role: 'user', content: 'Please recommend thinkers for this situation.' }],
      maxTokens: 600,
      onChunk: (text) => { response = text },
    })

    rawResponse.value = response
    console.log('[selector] raw response:', response)

    const parsed = parseThinkerResponse(response, state.allThinkerProfiles)
    console.log('[selector] parsed cards:', parsed)

    state.thinkerRecommendations = parsed.length > 0 ? parsed : allThinkerCards()
  } catch (e) {
    console.error('[selector] error:', e)
    error.value = e?.message || 'Something went wrong. Try again.'
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
