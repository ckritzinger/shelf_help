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

  let raw = fs.readFileSync(yamlPath, 'utf8')

  // Strip optional ```yaml ... ``` fences
  const fenceMatch = raw.match(/```yaml\s*\n([\s\S]+?)```/)
  if (fenceMatch) raw = fenceMatch[1]

  // Replace em dashes with commas
  raw = raw.replace(/—/g, ',')

  let profile
  try {
    profile = jsYaml.load(raw)
  } catch (e) {
    console.warn(`  SKIP ${dirName}: YAML parse error — ${e.message.split('\n')[0]}`)
    continue
  }

  if (!profile || !profile.thinker) {
    console.warn(`  SKIP ${dirName}: no 'thinker' key found`)
    continue
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
