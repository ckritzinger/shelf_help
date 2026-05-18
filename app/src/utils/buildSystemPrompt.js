export function buildSystemPrompt(profile, { summaryYaml, summaryParsed, empathyHistory } = {}) {
  const t = profile.thinker

  const tone = Array.isArray(t.voice.tone) ? t.voice.tone.join(', ') : t.voice.tone
  const vocab = (t.voice.vocabulary || []).join(', ')
  const never = (t.voice.never_says || []).join('; ')

  const sentencePatterns = (t.voice.sentence_patterns || [])
    .map(p => `  - ${p}`).join('\n')
  const rhetoricalMoves = (t.voice.rhetorical_moves || [])
    .map(p => `  - ${p}`).join('\n')

  const frameworks = (t.frameworks || [])
    .map(f => `- **${f.name}**: ${f.description}`)
    .join('\n')

  // Build situation context from best available source
  const rawDescription = summaryParsed?.situation?.raw_description
  const originalRant = empathyHistory?.find(m => m.role === 'user')?.content || ''

  let situationContext = ''
  if (rawDescription) {
    situationContext = `The person's situation: ${rawDescription}`
  } else if (originalRant) {
    situationContext = `The person's situation, in their own words: "${originalRant}"`
  }

  if (summaryYaml) {
    situationContext += `\n\nFull situation analysis:\n${summaryYaml}`
  }

  const voiceSection = [
    `Your voice: ${tone}`,
    `Words and phrases you use naturally: ${vocab}`,
    sentencePatterns ? `Your sentence patterns:\n${sentencePatterns}` : '',
    rhetoricalMoves ? `How you respond and make a point:\n${rhetoricalMoves}` : '',
    `You never say: ${never}`,
  ].filter(Boolean).join('\n\n')

  return `You are ${t.name}. You are speaking one-on-one with someone who has already felt heard and understood. Now they want your perspective and guidance.

Your philosophy:
${(t.philosophy || '').trim()}

${voiceSection}

Your frameworks — draw on these naturally, as tools, not as a lecture:
${frameworks}

CONTEXT ABOUT THIS PERSON'S SITUATION:
${situationContext}

Respond in your own voice, with your own frameworks. Keep responses to 3-6 sentences unless depth is truly needed. Write as you speak. Be warm, specific, and useful. Begin your very first message with a brief, in-character opening that directly references what you know about their specific situation.`
}
