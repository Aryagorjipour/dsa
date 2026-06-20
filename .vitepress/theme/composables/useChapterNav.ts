import { computed } from 'vue'
import { useRoute } from 'vitepress'
import { getChapterOrder, getSectionMap } from '../../sidebar'

const CHAPTER_ORDER = getChapterOrder()
const SECTION_MAP = getSectionMap()

export function useChapterNav() {
  const route = useRoute()

  const currentIndex = computed(() =>
    CHAPTER_ORDER.findIndex(c => c.link === route.path)
  )

  const prev = computed(() => {
    const idx = currentIndex.value
    return idx > 0 ? CHAPTER_ORDER[idx - 1] : null
  })

  const next = computed(() => {
    const idx = currentIndex.value
    return idx >= 0 && idx < CHAPTER_ORDER.length - 1 ? CHAPTER_ORDER[idx + 1] : null
  })

  const section = computed(() => SECTION_MAP[route.path] || null)

  const breadcrumbs = computed(() => {
    const crumbs: { text: string; link?: string }[] = [{ text: 'Handbook', link: '/README' }]
    const sec = section.value
    if (sec) crumbs.push({ text: sec })
    const item = CHAPTER_ORDER.find(c => c.link === route.path)
    if (item) {
      crumbs.push({ text: item.text })
    } else if (route.path.startsWith('/projects/')) {
      crumbs[0] = { text: 'Project Lab', link: '/projects/README' }
      crumbs.push({ text: route.path.split('/').pop()?.replace(/-/g, ' ') || 'Project' })
    } else if (route.path.startsWith('/resources/')) {
      crumbs.push({ text: route.path.split('/').pop()?.replace(/-/g, ' ') || 'Resource' })
    }
    return crumbs
  })

  return { prev, next, section, breadcrumbs, currentIndex }
}

export { CHAPTER_ORDER, SECTION_MAP }