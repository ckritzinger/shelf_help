#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <thinker_name>" >&2
  exit 1
fi

THINKER_NAME="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROMPT_FILE="$SCRIPT_DIR/prompts/make_therapist.md"
THINKER_ID="$(echo "$THINKER_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '_' | tr -cd '[:alnum:]_')"
OUTPUT_DIR="$SCRIPT_DIR/therapists/$THINKER_ID"
OUTPUT_FILE="$OUTPUT_DIR/profile.yaml"

mkdir -p "$OUTPUT_DIR"

PROMPT="$(sed "s/{{THINKER_NAME}}/$THINKER_NAME/g" "$PROMPT_FILE")"

echo "Generating profile for: $THINKER_NAME"
echo "Output: $OUTPUT_FILE"

claude --model claude-opus-4-7 -p "$PROMPT" > "$OUTPUT_FILE"

echo "Done."
