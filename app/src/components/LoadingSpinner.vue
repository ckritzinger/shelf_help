<template>
  <div class="flex items-center justify-center gap-1.5 py-4">
    <span
      v-for="i in 3"
      :key="i"
      class="w-2 h-2 rounded-full bg-warm-400 animate-bounce"
      :style="{ animationDelay: `${(i - 1) * 0.15}s` }"
    />
  </div>
</template>
