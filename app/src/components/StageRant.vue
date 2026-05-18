<script setup>
import { ref, onUnmounted } from 'vue'
import { useAppState } from '../composables/useAppState'
import { useWhisper } from '../composables/useWhisper'

const { state, setStage } = useAppState()
const { modelReady, transcribe } = useWhisper()

const rant = ref('')
const recording = ref(false)
const transcribing = ref(false)

let mediaRecorder = null
let chunks = []

async function startRecording() {
  chunks = []
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  mediaRecorder = new MediaRecorder(stream)
  mediaRecorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data) }
  mediaRecorder.onstop = async () => {
    stream.getTracks().forEach(t => t.stop())
    recording.value = false
    transcribing.value = true
    try {
      const blob = new Blob(chunks, { type: mediaRecorder.mimeType })
      const text = await transcribe(blob)
      if (text) rant.value = rant.value ? rant.value + ' ' + text : text
    } catch (e) {
      alert('Transcription failed: ' + e.message)
    } finally {
      transcribing.value = false
    }
  }
  mediaRecorder.start()
  recording.value = true
}

function stopRecording() {
  mediaRecorder?.stop()
}

function submit() {
  if (!rant.value.trim()) return
  stopRecording()
  state.empathyHistory = [{ role: 'user', content: rant.value.trim() }]
  state.error = null
  setStage('empathy')
}

onUnmounted(() => { mediaRecorder?.stop() })
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] px-4 py-12">
    <div class="w-full max-w-xl">
      <h1 class="font-serif text-3xl text-warm-800 mb-2 text-center">What's going on?</h1>
      <p class="text-warm-500 text-center mb-8 text-sm">Take your time. No judgment here.</p>

      <!-- Listening state -->
      <div v-if="recording" class="flex flex-col items-center gap-6 py-12">
        <div class="relative flex items-center justify-center">
          <span class="absolute w-16 h-16 rounded-full bg-red-200 animate-ping opacity-60" />
          <button
            type="button"
            @click="stopRecording"
            class="relative w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        </div>
        <p class="text-warm-600 text-sm">Listening — tap to stop.</p>
      </div>

      <!-- Transcribing state -->
      <div v-else-if="transcribing" class="flex flex-col items-center gap-4 py-12">
        <svg class="w-8 h-8 text-warm-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        <p class="text-warm-500 text-sm">Transcribing...</p>
      </div>

      <!-- Normal input state -->
      <form v-else @submit.prevent="submit" class="space-y-4">
        <div class="relative">
          <textarea
            v-model="rant"
            rows="8"
            placeholder="Start wherever feels right..."
            class="w-full px-5 py-4 rounded-2xl border border-warm-200 bg-white text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-warm-300 resize-none text-base leading-relaxed shadow-sm"
          />
          <button
            v-if="modelReady"
            type="button"
            @click="startRecording"
            title="Speak"
            class="absolute bottom-3 right-3 p-2 rounded-xl bg-warm-100 text-warm-500 hover:bg-warm-200 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        </div>

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
