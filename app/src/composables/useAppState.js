import { reactive } from 'vue'

const state = reactive({
  stage: 'rant', // 'rant' | 'empathy' | 'thinkerSelect' | 'conversation'

  // Stage 1 → 2
  empathyHistory: [],

  // Set silently on Stage 2 confirmation
  summaryYaml: '',    // inner YAML content between <summary> tags
  summaryParsed: null,

  // Stage 3
  thinkerRecommendations: [], // [{ id, name, tagline, whyRelevant }]
  allThinkerProfiles: {},     // { [dirName]: parsedYamlObject }

  // Stage 4
  selectedThinkerId: null,
  conversationHistory: [], // includes hidden priming message
  visibleMessageCount: 0,  // how many messages from the end to show

  // Cross-cutting
  isLoading: false,
  error: null,
})

export function useAppState() {
  function setStage(name) {
    state.stage = name
    state.error = null
  }

  function resetToThinkerSelect() {
    state.selectedThinkerId = null
    state.conversationHistory = []
    state.visibleMessageCount = 0
    state.stage = 'thinkerSelect'
    state.error = null
  }

  return { state, setStage, resetToThinkerSelect }
}
