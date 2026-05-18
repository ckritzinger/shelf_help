<script setup>
import { ref } from 'vue'
import { useAppState } from '../composables/useAppState'

const { state, setStage } = useAppState()
const rant = ref('')

function submit() {
  if (!rant.value.trim()) return
  state.empathyHistory = [{ role: 'user', content: rant.value.trim() }]
  state.error = null
  setStage('empathy')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] px-4 py-12">
    <div class="w-full max-w-xl">
      <h1 class="font-serif text-3xl text-warm-800 mb-2 text-center">What's going on?</h1>
      <p class="text-warm-500 text-center mb-8 text-sm">Take your time. No judgment here.</p>

      <form @submit.prevent="submit" class="space-y-4">
        <textarea
          v-model="rant"
          rows="8"
          placeholder="Start wherever feels right..."
          class="w-full px-5 py-4 rounded-2xl border border-warm-200 bg-white text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-warm-300 resize-none text-base leading-relaxed shadow-sm"
        />

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
