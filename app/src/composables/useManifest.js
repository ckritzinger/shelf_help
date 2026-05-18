import jsYaml from 'js-yaml'

let manifestCache = null

async function getManifest() {
  if (!manifestCache) {
    const res = await fetch('/manifest.json')
    manifestCache = await res.json()
  }
  return manifestCache
}

export async function fetchPrompt(key) {
  const manifest = await getManifest()
  const res = await fetch(manifest.prompts[key])
  return res.text()
}

export async function fetchAllThinkerProfiles() {
  const manifest = await getManifest()
  const profiles = {}

  await Promise.all(
    manifest.thinkers.map(async ({ id, path }) => {
      const res = await fetch(path)
      const text = await res.text()
      profiles[id] = jsYaml.load(text)
    })
  )

  return profiles
}

export function getManifestSync() {
  return manifestCache
}
