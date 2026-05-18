import jsYaml from 'js-yaml'
import { useAppState } from './useAppState'
import { useAnthropicClient } from './useAnthropicClient'
import { fetchPrompt } from './useManifest'
import { parseThinkerResponse } from '../utils/parseThinkerResponse'

export function useThinkerLoader() {
  const { state } = useAppState()
  const { sendMessage } = useAnthropicClient()

  function allThinkerCards() {
    return Object.entries(state.allThinkerProfiles).map(([id, profile]) => ({
      id,
      name: profile.thinker.name,
      tagline: profile.thinker.tagline,
      whyRelevant: '',
    }))
  }

  async function loadThinkers() {
    const template = await fetchPrompt('selector')

    const thinkerBlocks = Object.entries(state.allThinkerProfiles)
      .map(([, profile]) => {
        const yamlContent = jsYaml.dump(profile)
        return `<thinker>\n${yamlContent}\n</thinker>`
      })
      .join('\n\n')

    const systemPrompt = template
      .replace('{{SUMMARY}}', state.summaryYaml)
      .replace('{{THINKER_BLOCKS}}', thinkerBlocks)

    let response = ''
    await sendMessage({
      systemPrompt,
      messages: [{ role: 'user', content: 'Please recommend thinkers for this situation.' }],
      maxTokens: 600,
      model: 'claude-haiku-4-5-20251001',
      onChunk: (text) => { response = text },
    })

    const parsed = parseThinkerResponse(response, state.allThinkerProfiles)
    state.thinkerRecommendations = parsed.length > 0 ? parsed : allThinkerCards()
  }

  return { loadThinkers }
}
