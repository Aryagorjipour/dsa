import DefaultTheme from 'vitepress/theme'
import './style.css'
import DSALogo from './components/DSALogo.vue'
import DSAExplorer from './components/DSAExplorer.vue'
import { defineAsyncComponent } from 'vue'

const PlaygroundPage = defineAsyncComponent(() => import('./components/PlaygroundPage.vue'))
const MyNotesView = defineAsyncComponent(() => import('./components/MyNotesView.vue'))
import Layout from './Layout.vue'
import { blockIdPlugin } from './plugins/block-id'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('DSALogo', DSALogo)
    app.component('DSAExplorer', DSAExplorer)
    app.component('PlaygroundPage', PlaygroundPage)
    app.component('MyNotesView', MyNotesView)
  },
  markdown: {
    config(md) {
      blockIdPlugin(md)
    },
  },
}