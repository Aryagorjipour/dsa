import path from 'node:path'
import { generateSW } from 'workbox-build'
import { defineConfig } from 'vitepress'
import { VitePWA } from 'vite-plugin-pwa'
import { sidebar } from './sidebar'

const DIST = path.resolve('.vitepress/dist')

export default defineConfig({
  title: 'DSA Handbook',
  description: 'From Zero to "I Actually Get It and Use It Daily" — A complete, real-world guide to Data Structures & Algorithms in C# and Go.',
  base: '/dsa/',
  srcDir: '.',
  cleanUrls: true,

  rewrites: {
    'algorithms/22-bst-operations.md': 'algorithms/21-bst-operations.md',
  },

  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'apple-touch-icon', href: '/icons/icon-192.png', sizes: '192x192' }],
    ['link', { rel: 'mask-icon', href: '/favicon.svg', color: '#6366f1' }],
    ['meta', { name: 'theme-color', content: '#6366f1' }],
    ['meta', { name: 'mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }],
    ['link', { rel: 'manifest', href: '/dsa/manifest.webmanifest' }],
  ],

  vite: {
    publicDir: 'public',
    plugins: [
      VitePWA({
        registerType: 'prompt',
        injectRegister: false,
        includeAssets: ['favicon.svg', 'icons/**/*', 'images/**/*', 'examples-manifest.json'],
        manifest: {
          name: 'DSA Handbook',
          short_name: 'DSA',
          description: 'Data Structures & Algorithms — read offline',
          theme_color: '#6366f1',
          background_color: '#1b1b1f',
          display: 'standalone',
          scope: '/dsa/',
          start_url: '/dsa/',
          id: '/dsa/',
          icons: [
            { src: '/dsa/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/dsa/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/dsa/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,ico,png,svg,json,woff2,webp}'],
          globIgnores: ['**/hashmap.json'],
          cleanupOutdatedCaches: true,
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          importScripts: ['sw-clean-urls.js'],
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
      cleanupOutdatedCaches: true,
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      modifyURLPrefix: {
        '': '/dsa/',
      },
      skipWaiting: false,
      clientsClaim: true,
    })
  },
})