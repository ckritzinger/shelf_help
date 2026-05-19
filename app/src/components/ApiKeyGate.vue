<script setup>
import { ref } from 'vue'
import { useApiKey } from '../composables/useApiKey'

const { setApiKey } = useApiKey()
const input = ref('')
const error = ref('')

function submit() {
  if (!input.value.trim().startsWith('sk-')) {
    error.value = 'That doesn\'t look right — Anthropic API keys start with "sk-ant-".'
    return
  }
  setApiKey(input.value.trim())
}
</script>

<template>
  <div class="fixed inset-0 bg-warm-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
      <h2 class="font-serif text-2xl text-warm-900 mb-2">Welcome to Shelf Help</h2>
      <p class="text-warm-700 mb-6 leading-relaxed">
        To get started, you'll need an Anthropic API key. It's stored only in your browser, never sent anywhere else.
      </p>

      <form @submit.prevent="submit" class="space-y-4">
        <input
          v-model="input"
          type="password"
          placeholder="sk-ant-..."
          class="w-full px-4 py-3 rounded-xl border border-warm-200 bg-warm-50 text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-warm-400 text-sm font-mono"
          autofocus
        />
        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
        <button
          type="submit"
          class="w-full bg-warm-700 text-warm-50 font-medium py-3 rounded-xl hover:bg-warm-600 transition-colors"
        >
          Let's go
        </button>
      </form>

      <p class="text-warm-500 text-xs mt-4">
        Get a key at
        <a href="https://console.anthropic.com" target="_blank" class="underline hover:text-warm-700">console.anthropic.com</a>
      </p>
    </div>
  </div>
</template>
