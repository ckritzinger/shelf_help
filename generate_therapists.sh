#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
THERAPISTS_FILE="$SCRIPT_DIR/therapists.txt"

if [[ ! -f "$THERAPISTS_FILE" ]]; then
  echo "therapists.txt not found" >&2
  exit 1
fi

while IFS= read -r name || [[ -n "$name" ]]; do
  [[ -z "$name" || "$name" == \#* ]] && continue

  id="$(echo "$name" | tr '[:upper:]' '[:lower:]' | tr ' ' '_' | tr -cd '[:alnum:]_')"
  profile="$SCRIPT_DIR/therapists/$id/profile.yaml"

  if [[ -f "$profile" ]]; then
    echo "Skip (exists): $name"
  else
    echo "Generating: $name"
    "$SCRIPT_DIR/make_therapist.sh" "$name"
  fi
done < "$THERAPISTS_FILE"
