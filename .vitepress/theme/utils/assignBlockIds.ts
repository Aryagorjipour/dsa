const BLOCK_SELECTOR = '.vp-doc p, .vp-doc li, .vp-doc td, .vp-doc th, .vp-doc blockquote, .vp-doc h1, .vp-doc h2, .vp-doc h3, .vp-doc h4, .vp-doc h5, .vp-doc h6'

export function assignBlockIds(): void {
  const doc = document.querySelector('.vp-doc')
  if (!doc) return

  let counter = 0
  doc.querySelectorAll(BLOCK_SELECTOR).forEach(el => {
    if (el.closest('pre, code, .vp-code-group, .language-')) return
    if (el.hasAttribute('data-dsa-block')) return
    el.setAttribute('data-dsa-block', String(counter++))
  })
}