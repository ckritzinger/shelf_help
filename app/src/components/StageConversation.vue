<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAppState } from '../composables/useAppState'
import { useAnthropicClient } from '../composables/useAnthropicClient'
import { buildSystemPrompt } from '../utils/buildSystemPrompt'
import { sanitizeText } from '../utils/sanitizeText'
import LoadingSpinner from './LoadingSpinner.vue'

const { state } = useAppState()
const { sendMessage } = useAnthropicClient()

const input = ref('')
const isStreaming = ref(false)
const streamingText = ref('')
const messagesEl = ref(null)

// visibleMessages: skip the hidden priming user message (index 0)
const visibleMessages = computed(() => {
  if (!state.conversationHistory.length) return []
  // The first message is the hidden priming user message — skip it
  return state.conversationHistory.slice(1)
})

const profile = computed(() => state.allThinkerProfiles[state.selectedThinkerId])
const thinkerName = computed(() => profile.value?.thinker?.name || 'Your thinker')

async function scrollToBottom() {
  await nextTick()
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  }
}

async function send() {
  const text = input.value.trim()
  if (!text || isStreaming.value) return

  input.value = ''
  state.conversationHistory.push({ role: 'user', content: text })
  await scrollToBottom()

  isStreaming.value = true
  streamingText.value = ''
  state.error = null

  try {
    const systemPrompt = buildSystemPrompt(profile.value, {
    summaryYaml: state.summaryYaml,
    summaryParsed: state.summaryParsed,
    empathyHistory: state.empathyHistory,
  })
    let response = ''
    await sendMessage({
      systemPrompt,
      messages: state.conversationHistory,
      maxTokens: 1024,
      onChunk: (t) => {
        response = t
        streamingText.value = t
        scrollToBottom()
      },
    })
    state.conversationHistory.push({ role: 'assistant', content: response })
    streamingText.value = ''
  } catch (e) {
    state.error = 'Something went wrong. Try sending again.'
    alert(state.error)
    // Remove the user message we just added so they can retry
    state.conversationHistory.pop()
    input.value = text
  } finally {
    isStreaming.value = false
    await scrollToBottom()
  }
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

onMounted(async () => {
  if (state.conversationHistory.length > 0) return

  const systemPrompt = buildSystemPrompt(profile.value, {
    summaryYaml: state.summaryYaml,
    summaryParsed: state.summaryParsed,
    empathyHistory: state.empathyHistory,
  })

  // Hidden priming message — gives the thinker context, not shown in UI
  const primerContent = 'Please begin the conversation now.'

  state.conversationHistory.push({ role: 'user', content: primerContent })

  isStreaming.value = true
  streamingText.value = ''

  try {
    let response = ''
    await sendMessage({
      systemPrompt,
      messages: state.conversationHistory,
      maxTokens: 1024,
      onChunk: (t) => {
        response = t
        streamingText.value = t
        scrollToBottom()
      },
    })
    state.conversationHistory.push({ role: 'assistant', content: response })
    streamingText.value = ''
  } catch (e) {
    state.error = 'Something went wrong starting the conversation.'
    alert(state.error)
  } finally {
    isStreaming.value = false
    await scrollToBottom()
  }
})
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-65px)]">
    <!-- Messages -->
    <div ref="messagesEl" class="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      <div class="max-w-xl mx-auto space-y-4">
        <template v-for="(msg, i) in visibleMessages" :key="i">
          <div
            :class="[
              'flex',
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            ]"
          >
            <div
              :class="[
                'max-w-[85%] px-4 py-3 rounded-2xl leading-relaxed text-sm',
                msg.role === 'user'
                  ? 'bg-warm-700 text-warm-50 rounded-br-sm'
                  : 'bg-white border border-warm-200 text-warm-900 rounded-bl-sm shadow-sm'
              ]"
            >
              <p class="whitespace-pre-wrap">{{ msg.role === 'assistant' ? sanitizeText(msg.content) : msg.content }}</p>
            </div>
          </div>
        </template>

        <!-- Streaming assistant response -->
        <div v-if="isStreaming" class="flex justify-start">
          <div class="max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-sm bg-white border border-warm-200 text-warm-900 shadow-sm text-sm leading-relaxed">
            <LoadingSpinner v-if="!streamingText" />
            <template v-else>
              <p class="whitespace-pre-wrap">{{ sanitizeText(streamingText) }}</p>
              <span class="inline-block w-1 h-3.5 ml-0.5 bg-warm-400 animate-pulse align-middle" />
            </template>
          </div>
        </div>

        <p v-if="state.error" class="text-red-600 text-sm text-center">{{ state.error }}</p>
      </div>
    </div>

    <!-- Input -->
    <div class="border-t border-warm-200 bg-warm-50 px-4 py-4">
      <div class="max-w-xl mx-auto flex gap-3 items-end">
        <textarea
          v-model="input"
          @keydown="handleKeydown"
          rows="2"
          :placeholder="`Talk to ${thinkerName}...`"
          :disabled="isStreaming"
          class="flex-1 px-4 py-3 rounded-xl border border-warm-200 bg-white text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-warm-300 resize-none text-sm leading-relaxed disabled:opacity-50"
        />
        <button
          @click="send"
          :disabled="!input.trim() || isStreaming"
          class="bg-warm-700 text-warm-50 p-3 rounded-xl hover:bg-warm-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
      <p class="text-warm-400 text-xs text-center mt-2">Enter to send · Shift+Enter for new line</p>
    </div>
  </div>
</template>
