const FORMULA_PREFIX_PATTERN = /^\s*[=+\-@]/

export function spreadsheetSafeText(value) {
  const text = String(value ?? '')
  return FORMULA_PREFIX_PATTERN.test(text) ? `'${text}` : text
}

export function csvEscape(value) {
  const text = typeof value === 'number' ? String(value) : spreadsheetSafeText(value)
  return `"${text.replace(/"/g, '""')}"`
}
