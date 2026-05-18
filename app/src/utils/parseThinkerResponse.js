function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/^dr\.?\s+/i, '')
    .replace(/[^a-z\s]/g, '')
    .trim()
}

export function parseThinkerResponse(responseText, allProfiles) {
  // Build name → dirId lookup
  const nameToId = {}
  for (const [id, profile] of Object.entries(allProfiles)) {
    const norm = normalizeName(profile.thinker.name)
    nameToId[norm] = id
    // Also index by last name for fuzzy matching
    const parts = norm.split(' ')
    if (parts.length > 1) {
      nameToId[parts[parts.length - 1]] = id
    }
  }

  function findId(rawName) {
    const norm = normalizeName(rawName)
    if (nameToId[norm]) return nameToId[norm]
    // Substring fallback
    for (const [key, id] of Object.entries(nameToId)) {
      if (norm.includes(key) || key.includes(norm)) return id
    }
    return null
  }

  const results = []
  const seen = new Set()

  // Match **Name** sections
  const sectionRegex = /\*\*([^*]+)\*\*\s*\n([^\n*]+)/g
  let match
  while ((match = sectionRegex.exec(responseText)) !== null) {
    const rawName = match[1].trim()
    const whyRelevant = match[2].trim()
    const id = findId(rawName)
    if (!id || seen.has(id)) continue
    seen.add(id)

    const profile = allProfiles[id]
    results.push({
      id,
      name: profile.thinker.name,
      tagline: profile.thinker.tagline,
      whyRelevant,
    })
  }

  return results
}
