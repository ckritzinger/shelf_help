<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppState } from '../composables/useAppState'
import { useAnthropicClient } from '../composables/useAnthropicClient'
import { fetchPrompt } from '../composables/useManifest'
import { parseSummary, stripSummaryFromStream } from '../utils/parseSummary'
import LoadingSpinner from './LoadingSpinner.vue'

const { state, setStage } = useAppState()
const { sendMessage } = useAnthropicClient()

const clarifying = ref(false)
const clarification = ref('')
const isStreaming = ref(false)
const streamingText = ref('')
const error = ref('')

const lastAssistantMessage = computed(() => {
  const msgs = state.empathyHistory.filter(m => m.role === 'assistant')
  return msgs[msgs.length - 1]?.content || ''
})

const displayText = computed(() => {
  const text = isStreaming.value ? streamingText.value : lastAssistantMessage.value
  return stripSummaryFromStream(text)
})

async function callEmpathyApi() {
  isStreaming.value = true
  streamingText.value = ''
  error.value = ''

  try {
    const systemPrompt = await fetchPrompt('empathy')
    let response = ''
    await sendMessage({
      systemPrompt,
      messages: state.empathyHistory,
      maxTokens: 600,
      onChunk: (text) => {
        response = text
        streamingText.value = text
      },
    })
    state.empathyHistory.push({ role: 'assistant', content: response })
    streamingText.value = ''
  } catch (e) {
    error.value = `Something went wrong: ${e?.message || 'Check your API key and try again.'}`
  } finally {
    isStreaming.value = false
  }
}

async function confirm() {
  const { yamlText, parsed } = parseSummary(lastAssistantMessage.value)
  state.summaryYaml = yamlText
  state.summaryParsed = parsed
  setStage('thinkerSelect')
}

async function sendClarification() {
  if (!clarification.value.trim()) return
  state.empathyHistory.push({ role: 'user', content: clarification.value.trim() })
  clarification.value = ''
  clarifying.value = false
  await callEmpathyApi()
}

onMounted(() => {
  if (!lastAssistantMessage.value) {
    callEmpathyApi()
  }
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] px-4 py-12">
    <div class="w-full max-w-xl">
      <div class="px-2 py-2 mb-6 min-h-[8rem] flex items-start">
        <div class="w-full">
          <LoadingSpinner v-if="isStreaming && !displayText" />
          <template v-else>
            <p class="leading-relaxed text-warm-800 whitespace-pre-wrap">{{ displayText }}</p>
            <span
              v-if="isStreaming"
              class="inline-block w-1 h-4 ml-0.5 bg-warm-400 animate-pulse align-middle"
            />
          </template>
        </div>
      </div>

      <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
        <p class="text-red-700 text-sm">{{ error }}</p>
        <button
          @click="callEmpathyApi"
          class="mt-2 text-sm text-red-600 underline hover:text-red-800"
        >
          Try again
        </button>
      </div>

      <div v-if="!isStreaming && lastAssistantMessage && !error" class="space-y-3">
        <div v-if="!clarifying" class="flex flex-col sm:flex-row gap-3">
          <button
            @click="confirm"
            class="flex-1 bg-warm-700 text-warm-50 font-medium py-3 rounded-xl hover:bg-warm-600 transition-colors"
          >
            Yes, you've got it
          </button>
          <button
            @click="clarifying = true"
            class="flex-1 bg-warm-100 text-warm-800 font-medium py-3 rounded-xl hover:bg-warm-200 transition-colors border border-warm-200"
          >
            Not quite — let me clarify
          </button>
        </div>

        <div v-else class="space-y-3">
          <textarea
            v-model="clarification"
            rows="4"
            placeholder="What did I miss or get wrong?"
            class="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-warm-300 resize-none"
            autofocus
          />
          <div class="flex gap-3">
            <button
              @click="sendClarification"
              :disabled="!clarification.trim()"
              class="flex-1 bg-warm-700 text-warm-50 font-medium py-3 rounded-xl hover:bg-warm-600 transition-colors disabled:opacity-40"
            >
              Send
            </button>
            <button
              @click="clarifying = false; clarification = ''"
              class="px-5 py-3 rounded-xl bg-warm-100 text-warm-700 hover:bg-warm-200 transition-colors border border-warm-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
