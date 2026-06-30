import { computed } from 'vue'
import { useRoute, useData } from 'vitepress'
import { normalizePagePath } from '../utils/normalizePagePath'

const NON_HANDBOOK_PATHS = ['/my-notes', '/playground', '/quizzes']

/** True for chapter/handbook reading pages (not home, playground, quizzes hub, my-notes). */
export function useHandbookPage() {
  const route = useRoute()
  const { page } = useData()

  const isHomePage = computed(() => page.value.frontmatter.layout === 'home')

  const showDocPage = computed(() => {
    if (isHomePage.value) return false
    const path = normalizePagePath(route.path)
    return !NON_HANDBOOK_PATHS.some(p => path === p || path.startsWith(`${p}/`))
  })

  return { isHomePage, showDocPage }
}