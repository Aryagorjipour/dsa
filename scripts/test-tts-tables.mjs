#!/usr/bin/env node
/**
 * Unit tests for table TTS extraction (mirrors extractReadingSegments.ts).
 */

function normalizeReadingText(raw) {
  return raw
    .replace(/\u200b/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim()
}

function speakableTableRowText(cellTexts, headers, isHeaderRow) {
  if (!cellTexts.length) return null
  if (isHeaderRow) {
    return {
      text: `Columns: ${cellTexts.join(', ')}`,
      isHeader: true,
      headers: cellTexts,
    }
  }
  const parts = cellTexts.map((text, i) => {
    const label = headers[i] || `column ${i + 1}`
    return `${label}: ${text}`
  })
  return { text: parts.join('. '), isHeader: false, headers }
}

let failed = 0
function assert(name, cond) {
  if (!cond) {
    console.error(`FAIL: ${name}`)
    failed++
  } else {
    console.log(`ok: ${name}`)
  }
}

const header = speakableTableRowText(['Operation', 'Time', 'Space'], [], true)
assert('header row labels columns', header?.text === 'Columns: Operation, Time, Space')
assert('header captures labels', header?.headers.join(',') === 'Operation,Time,Space')

const data = speakableTableRowText(['Add', 'O(1)', 'O(n)'], header.headers, false)
assert('data row uses headers', data?.text.includes('Operation: Add'))
assert('data row includes all cells', data?.text.includes('Time: O(1)') && data?.text.includes('Space: O(n)'))

if (failed) {
  console.error(`\n${failed} test(s) failed`)
  process.exit(1)
}

console.log('\nAll TTS table tests passed')