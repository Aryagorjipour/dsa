import DefaultTheme from 'vitepress/theme'
import './style.css'
import DSALogo from './components/DSALogo.vue'
import DSAExplorer from './components/DSAExplorer.vue'
import Layout from './Layout.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('DSALogo', DSALogo)
    app.component('DSAExplorer', DSAExplorer)
  }
}