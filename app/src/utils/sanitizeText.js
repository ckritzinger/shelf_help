export function sanitizeText(text) {
  if (!text) return text
  return text
    .replace(/ — /g, ', ')
    .replace(/—/g, ', ')
}
