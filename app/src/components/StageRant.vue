<script setup>
import { ref, onUnmounted } from 'vue'
import { useAppState } from '../composables/useAppState'

const { state, setStage } = useAppState()
const rant = ref('')
const listening = ref(false)

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const speechSupported = !!SpeechRecognition

let recognition = null
let committedText = ''

function startListening() {
  committedText = rant.value
  recognition = new SpeechRecognition()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = 'en-US'

  recognition.onresult = (e) => {
    let interim = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) committedText += e.results[i][0].transcript
      else interim += e.results[i][0].transcript
    }
    rant.value = committedText + interim
  }

  recognition.onend = () => {
    listening.value = false
  }

  recognition.onerror = (e) => {
    listening.value = false
    if (e.error !== 'no-speech') alert(`Microphone error: ${e.error}`)
  }

  recognition.start()
  listening.value = true
}

function stopListening() {
  recognition?.stop()
  listening.value = false
}

function toggleListening() {
  listening.value ? stopListening() : startListening()
}

function submit() {
  if (!rant.value.trim()) return
  stopListening()
  state.empathyHistory = [{ role: 'user', content: rant.value.trim() }]
  state.error = null
  setStage('empathy')
}

onUnmounted(() => stopListening())
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] px-4 py-12">
    <div class="w-full max-w-xl">
      <h1 class="font-serif text-3xl text-warm-800 mb-2 text-center">What's going on?</h1>
      <p class="text-warm-500 text-center mb-8 text-sm">Take your time. No judgment here.</p>

      <form @submit.prevent="submit" class="space-y-4">
        <div class="relative">
          <textarea
            v-model="rant"
            rows="8"
            placeholder="Start wherever feels right..."
            class="w-full px-5 py-4 rounded-2xl border border-warm-200 bg-white text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-warm-300 resize-none text-base leading-relaxed shadow-sm"
            :class="{ 'border-red-300 ring-2 ring-red-200': listening }"
          />

          <button
            v-if="speechSupported"
            type="button"
            @click="toggleListening"
            :title="listening ? 'Stop recording' : 'Speak your rant'"
            class="absolute bottom-3 right-3 p-2 rounded-xl transition-colors"
            :class="listening
              ? 'bg-red-100 text-red-500 hover:bg-red-200'
              : 'bg-warm-100 text-warm-500 hover:bg-warm-200'"
          >
            <svg v-if="!listening" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <svg v-else class="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        </div>

        <p v-if="listening" class="text-red-500 text-xs text-center">
          Listening... tap the square to stop.
        </p>

        <button
          type="submit"
          :disabled="!rant.trim()"
          class="w-full bg-warm-700 text-warm-50 font-medium py-3 rounded-xl hover:bg-warm-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Tell me about it
        </button>
      </form>
    </div>
  </div>
</template>
