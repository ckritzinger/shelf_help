import jsYaml from 'js-yaml'

export function parseSummary(text) {
  const match = text.match(/<summary>([\s\S]+?)<\/summary>/)
  if (!match) return { yamlText: '', parsed: null, display: text.trim() }

  const yamlText = match[1].trim()
  let parsed = null
  try {
    parsed = jsYaml.load(yamlText)
  } catch {
    // malformed YAML — still usable as raw text
  }

  const display = text.slice(0, text.indexOf('<summary>')).trim()
  return { yamlText, parsed, display }
}

// Used during streaming: return only the portion before <summary>
export function stripSummaryFromStream(text) {
  const idx = text.indexOf('<summary>')
  return idx === -1 ? text : text.slice(0, idx).trim()
}
