<script setup>
import { useAppState } from '../composables/useAppState'

const { state, resetToThinkerSelect } = useAppState()
</script>

<template>
  <header class="flex items-center justify-between px-6 py-4 border-b border-warm-200 bg-warm-50">
    <span class="font-serif text-xl text-warm-800 tracking-wide">Shelf Help</span>
    <button
      v-if="state.stage === 'conversation'"
      @click="resetToThinkerSelect"
      class="text-sm text-warm-600 hover:text-warm-800 transition-colors"
    >
      Switch thinker
    </button>
  </header>
</template>
