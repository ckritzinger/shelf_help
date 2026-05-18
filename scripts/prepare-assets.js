const fs = require('fs')
const path = require('path')
const jsYaml = require('js-yaml')

const root = path.join(__dirname, '..')
const appPublic = path.join(root, 'app', 'public')

// Ensure output dirs exist
fs.mkdirSync(path.join(appPublic, 'prompts'), { recursive: true })

// Copy prompt files verbatim
for (const name of ['empathy.md', 'selector.md']) {
  fs.copyFileSync(
    path.join(root, 'prompts', name),
    path.join(appPublic, 'prompts', name)
  )
}

// Process each therapist directory
const therapistsDir = path.join(root, 'therapists')
const thinkerDirs = fs.readdirSync(therapistsDir).filter(d =>
  fs.statSync(path.join(therapistsDir, d)).isDirectory()
)

const manifest = {
  prompts: {
    empathy: '/prompts/empathy.md',
    selector: '/prompts/selector.md',
  },
  thinkers: [],
}

for (const dirName of thinkerDirs) {
  const yamlPath = path.join(therapistsDir, dirName, 'profile.yaml')
  if (!fs.existsSync(yamlPath)) continue

  const raw = fs.readFileSync(yamlPath, 'utf8')

  // Extract all ```yaml blocks
  const blocks = []
  const blockRegex = /```yaml\n([\s\S]+?)```/g
  let match
  while ((match = blockRegex.exec(raw)) !== null) {
    try {
      const parsed = jsYaml.load(match[1])
      if (parsed && parsed.thinker) blocks.push(parsed)
    } catch {
      // skip malformed blocks
    }
  }

  if (blocks.length === 0) continue

  // If multiple docs, find the one matching this directory (by id or name similarity)
  let profile = blocks[0]
  if (blocks.length > 1) {
    const normalized = dirName.toLowerCase().replace(/_/g, ' ')
    const found = blocks.find(b => {
      const id = (b.thinker.id || '').toLowerCase().replace(/_/g, ' ')
      const name = (b.thinker.name || '').toLowerCase()
      return normalized.includes(id.split(' ')[0]) || name.split(' ').some(w => normalized.includes(w))
    })
    if (found) profile = found
  }

  // Write clean YAML (no fences) to app/public
  const outDir = path.join(appPublic, 'therapists', dirName)
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'profile.yaml'), jsYaml.dump(profile))

  manifest.thinkers.push({
    id: dirName,
    path: `/therapists/${dirName}/profile.yaml`,
  })
}

fs.writeFileSync(
  path.join(appPublic, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
)

console.log(`Assets prepared: ${manifest.thinkers.length} thinkers, manifest written.`)
