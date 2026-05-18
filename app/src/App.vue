<script setup>
import { computed, onMounted } from 'vue'
import { useApiKey } from './composables/useApiKey'
import { useAppState } from './composables/useAppState'
import { fetchAllThinkerProfiles } from './composables/useManifest'
import AppHeader from './components/AppHeader.vue'
import ApiKeyGate from './components/ApiKeyGate.vue'
import StageRant from './components/StageRant.vue'
import StageEmpathy from './components/StageEmpathy.vue'
import StageThinkerSelect from './components/StageThinkerSelect.vue'
import StageConversation from './components/StageConversation.vue'

const { hasKey } = useApiKey()
const { state } = useAppState()

const stageComponents = {
  rant: StageRant,
  empathy: StageEmpathy,
  thinkerSelect: StageThinkerSelect,
  conversation: StageConversation,
}

const currentComponent = computed(() => stageComponents[state.stage] || StageRant)

onMounted(async () => {
  try {
    state.allThinkerProfiles = await fetchAllThinkerProfiles()
  } catch (e) {
    state.error = 'Failed to load thinker profiles. Is the dev server running?'
  }
})
</script>

<template>
  <div class="min-h-screen bg-warm-50">
    <AppHeader />

    <Transition name="stage" mode="out-in">
      <component :is="currentComponent" :key="state.stage" />
    </Transition>

    <ApiKeyGate v-if="!hasKey" />
  </div>
</template>
