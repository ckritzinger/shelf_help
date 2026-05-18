# Shelf Help

A personal conversation app that helps you feel heard, then connects you with a thinker who can help.

## What it does

1. **Rant** — Tell it what's going on, without filtering
2. **Empathy loop** — It reflects back what it heard until you confirm it's got it right
3. **Thinker selection** — Based on your situation, it recommends 2–3 thinkers from your shelf
4. **Conversation** — Talk directly with the selected thinker, in their voice and using their frameworks

Thinkers currently available: David Burns, Becky Kennedy, Daniel Siegel, Adele Faber & Elaine Mazlish, Alfred Adler.

## Setup

You'll need an [Anthropic API key](https://console.anthropic.com).

```bash
# Install root dependencies (used for build scripts)
npm install

# Install app dependencies
npm --prefix app install
```

## Run

```bash
npm run dev
```

Opens the app at `http://localhost:5173` (or the next available port). On first load, you'll be prompted to enter your API key — it's stored only in your browser's localStorage.

## Build

```bash
npm run build
```

Output goes to `app/dist/`.

## Notes

- Designed for local use. API calls go directly from your browser to Anthropic's API, which works on localhost but will be blocked by CORS on a deployed domain.
- The `npm run dev` command automatically copies prompt files and therapist profiles to `app/public/` and generates a `manifest.json` before starting Vite.
- To add a new thinker: create a `therapists/[name]/profile.yaml` following the existing format, then run `npm run prepare:assets`.
