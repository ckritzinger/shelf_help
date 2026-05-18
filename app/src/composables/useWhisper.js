import { ref } from 'vue'
import { pipeline } from '@huggingface/transformers'

// Singleton — shared across all component instances
let transcriber = null
const modelReady = ref(false)
let loadPromise = null

export function useWhisper() {
  function loadModel() {
    if (loadPromise) return loadPromise
    loadPromise = pipeline(
      'automatic-speech-recognition',
      'Xenova/whisper-tiny.en',
      { dtype: 'fp32' },
    ).then((t) => {
      transcriber = t
      modelReady.value = true
    }).catch((e) => {
      console.error('Whisper model load failed:', e)
      loadPromise = null
    })
    return loadPromise
  }

  async function transcribe(audioBlob) {
    if (!transcriber) throw new Error('Model not ready')
    const url = URL.createObjectURL(audioBlob)
    try {
      const result = await transcriber(url)
      return result.text.trim()
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  return { modelReady, loadModel, transcribe }
}
