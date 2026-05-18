import Anthropic from '@anthropic-ai/sdk'
import { useApiKey } from './useApiKey'

const MODEL_SONNET = 'claude-sonnet-4-6'
const MODEL_HAIKU = 'claude-haiku-4-5-20251001'

export function useAnthropicClient() {
  const { apiKey } = useApiKey()

  function createClient() {
    return new Anthropic({
      apiKey: apiKey.value,
      dangerouslyAllowBrowser: true,
    })
  }

  async function sendMessage({ systemPrompt, messages, maxTokens = 800, onChunk, model }) {
    const client = createClient()

    const stream = await client.messages.stream({
      model: model || MODEL_SONNET,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    })

    let fullText = ''
    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        fullText += chunk.delta.text
        onChunk?.(fullText)
      }
    }

    return fullText
  }

  return { sendMessage }
}
