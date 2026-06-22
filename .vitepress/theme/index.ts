import DefaultTheme from 'vitepress/theme'
import './style.css'
import DSALogo from './components/DSALogo.vue'
import DSAExplorer from './components/DSAExplorer.vue'
import { defineAsyncComponent } from 'vue'

const PlaygroundPage = defineAsyncComponent(() => import('./components/PlaygroundPage.vue'))
const MyNotesView = defineAsyncComponent(() => import('./components/MyNotesView.vue'))
const QuizDashboard = defineAsyncComponent(() => import('./components/QuizDashboard.vue'))
import Layout from './Layout.vue'
import { blockIdPlugin } from './plugins/block-id'
import { setupAnnotationRouter } from './utils/annotationLifecycle'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router }) {
    setupAnnotationRouter(router)
    app.component('DSALogo', DSALogo)
    app.component('DSAExplorer', DSAExplorer)
    app.component('PlaygroundPage', PlaygroundPage)
    app.component('MyNotesView', MyNotesView)
    app.component('QuizDashboard', QuizDashboard)
  },
  markdown: {
    config(md) {
      blockIdPlugin(md)
    },
  },
}