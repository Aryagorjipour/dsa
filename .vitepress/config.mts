import { defineConfig } from 'vitepress'
import { sidebar } from './sidebar'

export default defineConfig({
  title: 'DSA Handbook',
  description: 'From Zero to "I Actually Get It and Use It Daily" — A complete, real-world guide to Data Structures & Algorithms in C# and Go.',
  base: '/dsa/',
  srcDir: '.',
  cleanUrls: true,

  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'apple-touch-icon', href: '/favicon.svg', sizes: '180x180' }],
    ['link', { rel: 'mask-icon', href: '/favicon.svg', color: '#6366f1' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap' }]
  ],

  vite: {
    publicDir: 'public',
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
  }
})