<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppState } from '../composables/useAppState'

const { state, setStage } = useAppState()

const thinkerList = computed(() =>
  Object.values(state.allThinkerProfiles).map(p => p.thinker.name)
)

const cycleIndex = ref(0)
const cycleVisible = ref(true)
let cycleTimer = null

function startCycle() {
  cycleTimer = setInterval(() => {
    cycleVisible.value = false
    setTimeout(() => {
      cycleIndex.value = (cycleIndex.value + 1) % (thinkerList.value.length || 1)
      cycleVisible.value = true
    }, 400)
  }, 2200)
}

onMounted(() => startCycle())
onUnmounted(() => clearInterval(cycleTimer))

const RANT_KEY = 'shelf_help_rant_draft'
const rant = ref(localStorage.getItem(RANT_KEY) || '')

function onRantInput(e) {
  const v = e.target.value
  rant.value = v
  if (v) localStorage.setItem(RANT_KEY, v)
  else localStorage.removeItem(RANT_KEY)
}

function submit() {
  if (!rant.value.trim()) return
  state.empathyHistory = [{ role: 'user', content: rant.value.trim() }]
  state.error = null
  localStorage.removeItem(RANT_KEY)
  setStage('empathy')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] px-4 py-12">
    <div class="w-full max-w-xl">
      <h1 class="font-serif text-3xl text-warm-800 mb-2 text-center">What's going on?</h1>
      <div class="text-center mb-8">
        <p class="text-warm-600 text-sm mb-2">Share what's on your mind and get perspective from:</p>
        <div class="h-6 flex items-center justify-center">
          <span
            class="font-medium text-warm-700 text-sm transition-opacity duration-300"
            :class="cycleVisible ? 'opacity-100' : 'opacity-0'"
          >{{ thinkerList[cycleIndex] }}</span>
        </div>
      </div>

      <div class="space-y-4">
        <textarea
          :value="rant"
          @input="onRantInput"
          rows="8"
          placeholder="Start wherever feels right..."
          class="w-full px-5 py-4 rounded-2xl border border-warm-200 bg-white text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-warm-300 resize-none text-base leading-relaxed shadow-sm"
        />

        <button
          type="button"
          :disabled="!rant.trim()"
          @click="submit"
          class="w-full bg-warm-700 text-warm-50 font-medium py-3 rounded-xl hover:bg-warm-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Tell me about it
        </button>
      </div>
    </div>
  </div>
</template>
