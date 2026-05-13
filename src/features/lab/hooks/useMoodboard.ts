import { useState, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

export type ActiveTool = 'select' | 'text' | 'rect' | 'sticky'
export type MoodboardElementType = 'text' | 'rect' | 'sticky'

export interface MoodboardElement {
  id: string
  type: MoodboardElementType
  x: number
  y: number
  width: number
  height: number
  // text
  content?: string
  fontSize?: number
  // rect / sticky
  color?: string
}

export interface Viewport {
  x: number  // pan offset x
  y: number  // pan offset y
  scale: number
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const INITIAL_VIEWPORT: Viewport = { x: 0, y: 0, scale: 1 }

const MIN_SCALE = 0.15
const MAX_SCALE = 4

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useMoodboard() {
  const [elements, setElements] = useState<MoodboardElement[]>([])
  const [viewport, setViewport] = useState<Viewport>(INITIAL_VIEWPORT)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // ── Viewport ────────────────────────────────────────────────────────────────

  const pan = useCallback((dx: number, dy: number) => {
    setViewport(v => ({ ...v, x: v.x + dx, y: v.y + dy }))
  }, [])

  const zoomAt = useCallback((delta: number, cx: number, cy: number) => {
    setViewport(v => {
      const factor = delta > 0 ? 1.1 : 0.9
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor))
      // zoom toward cursor: adjust pan so point under cursor stays fixed
      const ratio = newScale / v.scale
      return {
        scale: newScale,
        x: cx - ratio * (cx - v.x),
        y: cy - ratio * (cy - v.y),
      }
    })
  }, [])

  const resetViewport = useCallback(() => setViewport(INITIAL_VIEWPORT), [])

  // ── Elements ────────────────────────────────────────────────────────────────

  function addElement(type: MoodboardElementType, canvasX: number, canvasY: number) {
    const id = crypto.randomUUID()
    let el: MoodboardElement
    if (type === 'text') {
      el = { id, type, x: canvasX, y: canvasY, width: 200, height: 40, content: 'Texte', fontSize: 18 }
    } else if (type === 'sticky') {
      el = { id, type, x: canvasX, y: canvasY, width: 180, height: 180, content: 'Note', color: '#FDE68A' }
    } else {
      el = { id, type, x: canvasX, y: canvasY, width: 160, height: 100, color: '#93C5FD' }
    }
    setElements(prev => [...prev, el])
    setSelectedId(id)
    return id
  }

  function updateElement(id: string, changes: Partial<MoodboardElement>) {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...changes } : el))
  }

  function deleteElement(id: string) {
    setElements(prev => prev.filter(el => el.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  function moveElement(id: string, x: number, y: number) {
    setElements(prev => prev.map(el => el.id === id ? { ...el, x, y } : el))
  }

  function bringToFront(id: string) {
    setElements(prev => {
      const idx = prev.findIndex(el => el.id === id)
      if (idx === -1) return prev
      const next = [...prev]
      next.push(next.splice(idx, 1)[0])
      return next
    })
  }

  return {
    elements,
    viewport,
    selectedId,
    setSelectedId,
    pan,
    zoomAt,
    resetViewport,
    addElement,
    updateElement,
    deleteElement,
    moveElement,
    bringToFront,
  }
}
