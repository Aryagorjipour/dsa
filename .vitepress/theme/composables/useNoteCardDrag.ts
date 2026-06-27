import { ref } from 'vue'
import type { Note } from './useStorage'
import { layoutBounds, viewportToDocTop } from '../utils/noteLayout'

const DRAG_THRESHOLD_PX = 4

export interface DragState {
  noteId: string
  startX: number
  startY: number
  originTop: number
  originLeft: number
  currentTop: number
  currentLeft: number
  dragging: boolean
}

const dragState = ref<DragState | null>(null)
const justDragged = ref(false)

export function useNoteCardDrag() {
  function onDragPointerDown(
    e: PointerEvent,
    note: Note,
    placement: { top: number; left: number },
  ) {
    if (e.button !== 0) return
    const target = e.currentTarget as HTMLElement | null
    target?.setPointerCapture?.(e.pointerId)

    dragState.value = {
      noteId: note.id,
      startX: e.clientX,
      startY: e.clientY,
      originTop: placement.top,
      originLeft: placement.left,
      currentTop: placement.top,
      currentLeft: placement.left,
      dragging: false,
    }

    document.body.style.userSelect = 'none'
  }

  function onDragPointerMove(e: PointerEvent, horizontalOnly = false) {
    const state = dragState.value
    if (!state) return

    const dx = e.clientX - state.startX
    const dy = horizontalOnly ? 0 : e.clientY - state.startY

    if (!state.dragging) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return
      state.dragging = true
    }

    let nextTop = horizontalOnly ? state.originTop : state.originTop + dy
    const bounds = layoutBounds()
    if (bounds) {
      nextTop = Math.max(nextTop, bounds.navBottom)
    }
    state.currentTop = nextTop
    state.currentLeft = state.originLeft + dx
  }

  async function onDragPointerUp(
    e: PointerEvent,
    onPersist: (noteId: string, docTop: number, docLeft: number) => Promise<void>,
    options: { horizontalOnly?: boolean } = {},
  ) {
    const state = dragState.value
    if (!state) return

    const target = e.currentTarget as HTMLElement | null
    target?.releasePointerCapture?.(e.pointerId)
    document.body.style.userSelect = ''

    if (state.dragging) {
      const docTop = options.horizontalOnly ? 0 : viewportToDocTop(state.currentTop, window.scrollY)
      const docLeft = state.currentLeft + window.scrollX
      await onPersist(state.noteId, docTop, docLeft)
      justDragged.value = true
      window.setTimeout(() => {
        justDragged.value = false
      }, 200)
    }

    dragState.value = null
  }

  function onDragKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Escape' || !dragState.value) return
    dragState.value = null
    document.body.style.userSelect = ''
  }

  function getDragStyle(noteId: string): { top?: string; left?: string } | null {
    const state = dragState.value
    if (!state || state.noteId !== noteId || !state.dragging) return null
    return {
      top: `${state.currentTop}px`,
      left: `${state.currentLeft}px`,
    }
  }

  function isDragging(noteId: string): boolean {
    return dragState.value?.noteId === noteId && dragState.value.dragging === true
  }

  return {
    dragState,
    justDragged,
    onDragPointerDown,
    onDragPointerMove,
    onDragPointerUp,
    onDragKeyDown,
    getDragStyle,
    isDragging,
  }
}