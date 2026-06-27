import type { HeadConfig, TransformContext } from 'vitepress'

export const SITE_HOST = 'https://aryagorjipour.github.io'
export const SITE_BASE = '/dsa/'
export const SITE_URL = `${SITE_HOST}${SITE_BASE}`
export const SITE_NAME = 'DSA Handbook'
export const SITE_TAGLINE =
  'From Zero to "I Actually Get It and Use It Daily" — A complete, real-world guide to Data Structures & Algorithms in C# and Go.'
export const SITE_AUTHOR = 'Aryagorjipour'
export const THEME_COLOR = '#6366f1'
export const BG_COLOR = '#0f172a'
export const OG_IMAGE = `${SITE_URL}logo.png`

export function withBase(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${SITE_BASE.replace(/\/$/, '')}${normalized}`
}

export function pageCanonical(ctx: TransformContext): string {
  const { pageData, siteConfig } = ctx
  const cleanUrls = siteConfig.cleanUrls ?? false
  let path = pageData.relativePath
    .replace(/(^|\/)index\.md$/, '$1')
    .replace(/\.md$/, cleanUrls ? '' : '.html')

  if (!path.startsWith('/')) path = `/${path}`
  if (path.endsWith('/') && path.length > 1) path = path.slice(0, -1)

  const base = SITE_BASE.replace(/\/$/, '')
  if (path === '/' || path === '') return `${SITE_HOST}${base}/`
  return `${SITE_HOST}${base}${path}`
}

export function buildSiteHead(): HeadConfig[] {
  const icon = (href: string, extra: Record<string, string> = {}) =>
    ['link', { rel: 'icon', href: withBase(href), ...extra }] as HeadConfig

  return [
    icon('/favicon.ico', { sizes: '48x48' }),
    icon('/favicon.svg', { type: 'image/svg+xml' }),
    icon('/favicon-32x32.png', { type: 'image/png', sizes: '32x32' }),
    icon('/favicon-16x16.png', { type: 'image/png', sizes: '16x16' }),
    [
      'link',
      {
        rel: 'apple-touch-icon',
        href: withBase('/apple-touch-icon.png'),
        sizes: '180x180',
      },
    ],
    ['link', { rel: 'mask-icon', href: withBase('/favicon.svg'), color: THEME_COLOR }],
    ['meta', { name: 'theme-color', content: THEME_COLOR }],
    ['meta', { name: 'color-scheme', content: 'dark light' }],
    ['meta', { name: 'application-name', content: SITE_NAME }],
    ['meta', { name: 'apple-mobile-web-app-title', content: 'DSA' }],
    ['meta', { name: 'mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }],
    ['meta', { name: 'author', content: SITE_AUTHOR }],
    ['meta', { name: 'robots', content: 'index, follow, max-image-preview:large' }],
    ['meta', { property: 'og:site_name', content: SITE_NAME }],
    ['meta', { property: 'og:locale', content: 'en_US' }],
    ['meta', { property: 'og:image', content: OG_IMAGE }],
    ['meta', { property: 'og:image:alt', content: `${SITE_NAME} logo` }],
    ['meta', { property: 'og:image:width', content: '1024' }],
    ['meta', { property: 'og:image:height', content: '1024' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: OG_IMAGE }],
    ['meta', { name: 'twitter:image:alt', content: `${SITE_NAME} logo` }],
    ['link', { rel: 'manifest', href: withBase('/manifest.webmanifest') }],
  ]
}

export function transformPageHead(ctx: TransformContext): HeadConfig[] {
  const title = ctx.title
  const description = ctx.description || SITE_TAGLINE
  const canonical = pageCanonical(ctx)
  const isHome = ctx.pageData.relativePath === 'index.md'

  const head: HeadConfig[] = [
    ['link', { rel: 'canonical', href: canonical }],
    ['meta', { property: 'og:type', content: isHome ? 'website' : 'article' }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: canonical }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'description', content: description }],
  ]

  if (isHome) {
    head.push([
      'script',
      {
        type: 'application/ld+json',
      },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        description: SITE_TAGLINE,
        url: SITE_URL,
        author: {
          '@type': 'Person',
          name: SITE_AUTHOR,
          url: 'https://github.com/Aryagorjipour',
        },
        publisher: {
          '@type': 'Person',
          name: SITE_AUTHOR,
        },
        inLanguage: 'en-US',
      }),
    ])
  }

  return head
}