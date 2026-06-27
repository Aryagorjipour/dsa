import path from 'node:path'
import { generateSW } from 'workbox-build'
import { defineConfig } from 'vitepress'
import { VitePWA } from 'vite-plugin-pwa'
import {
  BG_COLOR,
  SITE_HOST,
  SITE_NAME,
  SITE_TAGLINE,
  THEME_COLOR,
  buildSiteHead,
  transformPageHead,
  withBase,
} from './seo.mts'
import { sidebar } from './sidebar'

const DIST = path.resolve('.vitepress/dist')

export default defineConfig({
  title: SITE_NAME,
  description: SITE_TAGLINE,
  lang: 'en-US',
  base: '/dsa/',
  srcDir: '.',
  cleanUrls: true,

  rewrites: {
    'algorithms/22-bst-operations.md': 'algorithms/21-bst-operations.md',
  },

  head: buildSiteHead(),

  transformHead(ctx) {
    return transformPageHead(ctx)
  },

  sitemap: {
    hostname: SITE_HOST,
  },

  vite: {
    publicDir: 'public',
    plugins: [
      VitePWA({
        registerType: 'prompt',
        injectRegister: 'script',
        includeAssets: [
          'favicon.ico',
          'favicon.svg',
          'favicon-16x16.png',
          'favicon-32x32.png',
          'apple-touch-icon.png',
          'logo.png',
          'logo.svg',
          'robots.txt',
          'offline-shell.html',
          'icons/**/*',
          'images/**/*',
          'examples-manifest.json',
        ],
        manifest: {
          name: SITE_NAME,
          short_name: 'DSA',
          description: 'Data Structures & Algorithms — read offline on any device',
          theme_color: THEME_COLOR,
          background_color: BG_COLOR,
          display: 'standalone',
          display_override: ['standalone', 'browser'],
          categories: ['education', 'books'],
          scope: withBase('/'),
          start_url: withBase('/'),
          id: withBase('/'),
          icons: [
            {
              src: withBase('/icons/icon-192.png'),
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: withBase('/icons/icon-512.png'),
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: withBase('/icons/icon-512.png'),
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2,webp}'],
          globIgnores: ['**/hashmap.json'],
          cleanupOutdatedCaches: false,
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          importScripts: ['sw-clean-urls.js'],
          navigateFallback: withBase('/index.html'),
          navigateFallbackDenylist: [/^\/dsa\/api\//],
        },
      }),
    ],
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/@codemirror') || id.includes('node_modules/codemirror')) {
              return 'codemirror'
            }
            if (id.includes('PlaygroundPage.vue')) {
              return 'playground'
            }
            if (id.includes('idb-keyval')) {
              return 'storage'
            }
            if (id.includes('/quizzes/') || id.includes('QuizSection') || id.includes('QuizDashboard')) {
              return 'quiz'
            }
          },
        },
      },
    },
  },

  search: {
    provider: 'local',
  },

  themeConfig: {
    siteTitle: false,

    nav: [
      { text: 'Handbook', link: '/README' },
      { text: 'Playground', link: '/playground' },
      { text: 'My Notes', link: '/my-notes' },
      { text: 'Quizzes', link: '/quizzes' },
      { text: 'Project Lab', link: '/projects/README' },
      { text: 'GitHub', link: 'https://github.com/Aryagorjipour/dsa' },
    ],

    sidebar,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Aryagorjipour/dsa' }
    ],

    editLink: {
      pattern: 'https://github.com/Aryagorjipour/dsa/edit/main/:path',
      text: 'Edit this page on GitHub'
    },

    footer: {
      message: 'Made with ❤️ for learners everywhere.',
      copyright: 'Copyright © Aryagorjipour'
    }
  },

  async buildEnd() {
    await generateSW({
      swDest: path.join(DIST, 'sw.js'),
      globDirectory: DIST,
      globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2,webp}'],
      globIgnores: ['**/hashmap.json', 'sw.js', 'workbox-*.js'],
      importScripts: ['sw-clean-urls.js'],
      cleanupOutdatedCaches: false,
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      modifyURLPrefix: {
        '': '/dsa/',
      },
      navigateFallback: '/dsa/index.html',
      navigateFallbackDenylist: [/^\/dsa\/api\//],
      skipWaiting: false,
      clientsClaim: true,
    })
  },
})