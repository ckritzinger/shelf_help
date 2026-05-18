<script setup>
defineProps({
  id: String,
  name: String,
  tagline: String,
  whyRelevant: String,
})
defineEmits(['select'])
</script>

<template>
  <button
    @click="$emit('select', id)"
    class="w-full text-left bg-white rounded-2xl border border-warm-200 px-6 py-5 shadow-sm hover:border-warm-400 hover:shadow-md transition-all group"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1">
        <h3 class="font-semibold text-warm-900 text-lg group-hover:text-warm-700 transition-colors">{{ name }}</h3>
        <p class="text-warm-600 text-sm mt-1 leading-relaxed">{{ whyRelevant }}</p>
        <p class="text-warm-400 text-xs mt-3 italic leading-snug">{{ tagline }}</p>
      </div>
      <svg class="w-5 h-5 text-warm-300 group-hover:text-warm-500 transition-colors mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </button>
</template>
