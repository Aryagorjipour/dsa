export const BLOCK_SELECTOR =
  '.vp-doc p, .vp-doc li, .vp-doc blockquote, .vp-doc h1, .vp-doc h2, .vp-doc h3, .vp-doc h4, .vp-doc h5, .vp-doc h6, .vp-doc table caption, .vp-doc table tr, .vp-doc .custom-block'

export const CONTENT_BLOCK_TAGS = new Set([
  'P',
  'LI',
  'TD',
  'TH',
  'TR',
  'CAPTION',
  'BLOCKQUOTE',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
])

/** Keep runtime IDs above any build-time data-dsa-block values on the page. */
export function syncBlockCounter(doc: Element): void {
  let max = -1
  doc.querySelectorAll('[data-dsa-block]').forEach(el => {
    const n = parseInt(el.getAttribute('data-dsa-block') || '', 10)
    if (!Number.isNaN(n) && n > max) max = n
  })
  const next = max + 1
  const current = parseInt(doc.getAttribute('data-dsa-block-next') || '', 10)
  if (Number.isNaN(current) || current < next) {
    doc.setAttribute('data-dsa-block-next', String(next))
  }
}

function nextBlockCounter(doc: Element): number {
  syncBlockCounter(doc)
  const current = parseInt(doc.getAttribute('data-dsa-block-next') || '0', 10)
  doc.setAttribute('data-dsa-block-next', String(current + 1))
  return current
}

/** Assign a stable id to a content block element. */
export function ensureBlockId(el: Element): string {
  const existing = el.getAttribute('data-dsa-block')
  if (existing) return existing

  const doc = el.closest('.vp-doc')
  if (!doc) {
    el.setAttribute('data-dsa-block', '0')
    return '0'
  }

  const id = String(nextBlockCounter(doc))
  el.setAttribute('data-dsa-block', id)
  return id
}

/** Find the nearest highlightable content block from any selection node. */
export function findContentBlock(node: Node | null): Element | null {
  let current: Node | null = node
  while (current) {
    if (current instanceof Element) {
      if (current.classList.contains('vp-doc')) return null
      if (current.closest('pre, code, .vp-code-group, .language-')) return null
      if (CONTENT_BLOCK_TAGS.has(current.tagName)) return current
    }
    current = current.parentNode
  }
  return null
}

export function assignBlockIds(): void {
  const doc = document.querySelector('.vp-doc')
  if (!doc) return

  syncBlockCounter(doc)

  doc.querySelectorAll(BLOCK_SELECTOR).forEach(el => {
    if (!(el instanceof Element)) return
    if (el.closest('pre, code, .vp-code-group, .language-')) return
    if (el.closest('table') && (el.tagName === 'TD' || el.tagName === 'TH')) return
    if (el.hasAttribute('data-dsa-block')) return
    const childBlock = el.querySelector('[data-dsa-block]')
    if (childBlock && el !== childBlock) return
    ensureBlockId(el)
  })
}