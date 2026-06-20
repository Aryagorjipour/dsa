import type MarkdownIt from 'markdown-it'

let blockCounter = 0

const BLOCK_TAGS = new Set(['p', 'li', 'td', 'th', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

export function blockIdPlugin(md: MarkdownIt) {
  md.core.ruler.push('dsa-block-ids', state => {
    blockCounter = 0
    const tokens = state.tokens
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      if (token.type !== 'inline' || !token.content.trim()) continue

      // Find parent block-level open token
      let depth = 0
      let parentIdx = -1
      for (let j = i - 1; j >= 0; j--) {
        const t = tokens[j]
        if (t.type.endsWith('_close')) depth++
        if (t.type.endsWith('_open')) {
          if (depth === 0) {
            parentIdx = j
            break
          }
          depth--
        }
      }
      if (parentIdx < 0) continue

      const parent = tokens[parentIdx]
      const tag = parent.tag
      if (!BLOCK_TAGS.has(tag)) continue
      if (parent.attrGet('data-dsa-block')) continue

      parent.attrSet('data-dsa-block', String(blockCounter++))
    }
    return true
  })
}