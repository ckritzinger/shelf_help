You are building a Vue 3 + Tailwind CSS single-page application called "Shelf Help".

# PROJECT CONTEXT

The project already has the following structure:
- prompts/empathy.md — the empathic listening prompt
- prompts/selector.md — the thinker selection prompt
- therapists/[name]/profile.yaml — one YAML profile per thinker
- therapists.txt — list of thinker names

You will build a Vue 3 SPA (Vite) in ./app/

# WHAT THE APP DOES

The app guides the user through a 4-stage conversation flow, each stage making a call to the Anthropic API:

STAGE 1 — RANT
- Single textarea, generous sizing, warm prompt copy: "What's going on?"
- Submit button sends the rant to the Anthropic API using the empathy.md system prompt

STAGE 2 — EMPATHY LOOP
- Displays the AI's reflection
- Two options below it: "Yes, you've got it" and "Not quite — let me clarify"
- If "Not quite": show a textarea for clarification, resubmit with full conversation history
- Loop until user confirms
- On confirmation: parse the <summary> YAML block from the AI response silently
- Store the summary in app state, never display it

STAGE 3 — THINKER SELECTION
- Call the Anthropic API using selector.md system prompt
- Inject the <summary> block and all therapist profile.yaml contents as thinker blocks
- Display the AI's response (the 2-3 recommended thinkers with why-relevant sentences)
- Render each thinker as a selectable card, not just text
- User clicks a card to select their thinker

STAGE 4 — CONVERSATION
- Full chat interface with the selected thinker
- System prompt is built from the thinker's profile.yaml — their philosophy, voice, frameworks
- Conversation history maintained for the full session
- "Switch thinker" button in the header returns to Stage 3 without losing the summary

# TECHNICAL REQUIREMENTS

- Vue 3 with Composition API and <script setup> in ./app/
- Vite build tool
- Tailwind CSS
- Anthropic SDK (anthropic npm package). API calls from the front-end.
- Look for a claude API key in local storage. if one is not there, then prompt the user to enter one
- All prompts loaded from the prompts/ and therapists/ directories at runtime by the front-end. you can move these to a public directory. Create a manifest at build time that can be read by the front-end to know what is available
- Use claude-sonnet-4-20250514

# DESIGN DIRECTION

- Clean, warm, minimal
- Not clinical — this is a personal gift
- The app name "Shelf Help" should appear in the header
- Stages should feel like a natural progression, not separate pages — use transitions
- Mobile-friendly

# DELIVERABLES

1. app/ — full Vue 3 + Vite + Tailwind SPA
3. package.json — root level, with scripts to copy all therapist prompts to public and build manifest in public, and also script to run the front-end app
5. README.md — setup and run instructions

Do not scaffold placeholder components. Build the full working flow.