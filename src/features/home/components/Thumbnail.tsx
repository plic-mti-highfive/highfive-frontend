import { useState } from 'react'

// Deterministic pseudo-random from a seed
function seededRand(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

// Palette sets: [bg, accent1, accent2, shape]
const PALETTE_SETS = [
  { bg: '#E8F4F0', a1: '#2D9E7A', a2: '#A8DDD0', shape: '#1A6B52' },
  { bg: '#EEE8F8', a1: '#7C5CBF', a2: '#C9B8EC', shape: '#4A2D8C' },
  { bg: '#FDF0E6', a1: '#D4783A', a2: '#F5C89A', shape: '#9B4E1A' },
  { bg: '#E6EEF8', a1: '#3A6FD4', a2: '#9ABCF5', shape: '#1A3D8C' },
  { bg: '#F8E6EE', a1: '#C43A7C', a2: '#F5A0C8', shape: '#8C1A52' },
  { bg: '#F0F0E6', a1: '#8C8C3A', a2: '#D4D49A', shape: '#5A5A1A' },
  { bg: '#E6F0F8', a1: '#3A8CC4', a2: '#9AC8F0', shape: '#1A5A8C' },
  { bg: '#F8EEE6', a1: '#C47C3A', a2: '#F0C09A', shape: '#8C4A1A' },
]

type PatternType = 'circles' | 'triangles' | 'grid' | 'waves' | 'hexagons' | 'dots'

// eslint-disable-next-line react-refresh/only-export-components
export function generateSVGPattern(id: number | string, width = 400, height = 280): string {
  const seed = typeof id === 'string' ? id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) : id
  const rand = seededRand(seed * 137)
  const palette = PALETTE_SETS[seed % PALETTE_SETS.length]
  const patternTypes: PatternType[] = ['circles', 'triangles', 'grid', 'waves', 'hexagons', 'dots']
  const patternType = patternTypes[seed % patternTypes.length]

  const r = rand
  let shapes = ''

  if (patternType === 'circles') {
    const cx1 = width * (0.2 + r() * 0.3)
    const cy1 = height * (0.2 + r() * 0.3)
    const cr1 = 60 + r() * 80
    const cx2 = width * (0.5 + r() * 0.3)
    const cy2 = height * (0.4 + r() * 0.4)
    const cr2 = 50 + r() * 70
    const cx3 = width * (0.1 + r() * 0.2)
    const cy3 = height * (0.5 + r() * 0.4)
    const cr3 = 30 + r() * 50
    shapes = `
      <circle cx="${cx1}" cy="${cy1}" r="${cr1}" fill="${palette.a2}" opacity="0.7"/>
      <circle cx="${cx2}" cy="${cy2}" r="${cr2}" fill="${palette.a1}" opacity="0.5"/>
      <circle cx="${cx3}" cy="${cy3}" r="${cr3}" fill="${palette.shape}" opacity="0.3"/>
      <circle cx="${width * 0.8}" cy="${height * 0.2}" r="${20 + r() * 30}" fill="${palette.a1}" opacity="0.4"/>
    `
  } else if (patternType === 'grid') {
    const size = 28 + r() * 16
    const gap = size * 1.6
    const angle = 15 + r() * 20
    let rects = ''
    for (let x = -size; x < width + size * 2; x += gap) {
      for (let y = -size; y < height + size * 2; y += gap) {
        const opacity = (0.08 + r() * 0.18).toFixed(2)
        const fill = r() > 0.5 ? palette.a1 : palette.a2
        rects += `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${fill}" opacity="${opacity}" rx="4" transform="rotate(${angle} ${width / 2} ${height / 2})"/>`
      }
    }
    shapes = rects + `<circle cx="${width * 0.7}" cy="${height * 0.35}" r="${50 + r() * 40}" fill="${palette.a1}" opacity="0.25"/>`
  } else if (patternType === 'triangles') {
    const pts1 = `${width * 0.0},${height * 0.6} ${width * 0.55},${height * 0.0} ${width * 0.0},${height * 0.0}`
    const pts2 = `${width * 1.0},${height * 0.0} ${width * 0.45},${height * 1.0} ${width * 1.0},${height * 1.0}`
    const pts3 = `${width * 0.3},${height * 0.5} ${width * 0.7},${height * 0.2} ${width * 0.8},${height * 0.9}`
    shapes = `
      <polygon points="${pts1}" fill="${palette.a2}" opacity="0.55"/>
      <polygon points="${pts2}" fill="${palette.a1}" opacity="0.45"/>
      <polygon points="${pts3}" fill="${palette.shape}" opacity="0.2"/>
    `
  } else if (patternType === 'waves') {
    const freq = 0.012 + r() * 0.008
    const amp = 18 + r() * 22
    const stripes = 7
    let paths = ''
    for (let i = 0; i < stripes; i++) {
      const y = (height / stripes) * i
      const phase = r() * Math.PI * 2
      let d = `M 0 ${y + amp * Math.sin(phase)}`
      for (let x = 0; x <= width; x += 8) {
        d += ` L ${x} ${y + amp * Math.sin(x * freq + phase)}`
      }
      d += ` L ${width} ${height} L 0 ${height} Z`
      const opacity = (0.06 + r() * 0.12).toFixed(2)
      const fill = i % 2 === 0 ? palette.a1 : palette.a2
      paths += `<path d="${d}" fill="${fill}" opacity="${opacity}"/>`
    }
    shapes = paths + `<ellipse cx="${width * 0.5}" cy="${height * 0.5}" rx="${80 + r() * 60}" ry="${40 + r() * 30}" fill="${palette.a1}" opacity="0.2"/>`
  } else if (patternType === 'hexagons') {
    const s = 32 + r() * 16
    const hx = s * 1.732
    const hy = s * 1.5
    let hexes = ''
    for (let row = -1; row < height / hy + 2; row++) {
      for (let col = -1; col < width / hx + 2; col++) {
        const cx = col * hx + (row % 2 === 0 ? 0 : hx / 2)
        const cy = row * hy
        const pts = Array.from({ length: 6 }, (_, i) => {
          const a = Math.PI / 180 * (60 * i - 30)
          return `${cx + s * Math.cos(a)},${cy + s * Math.sin(a)}`
        }).join(' ')
        const opacity = (0.04 + r() * 0.14).toFixed(2)
        const fill = r() > 0.6 ? palette.a1 : r() > 0.3 ? palette.a2 : palette.bg
        hexes += `<polygon points="${pts}" fill="${fill}" opacity="${opacity}" stroke="${palette.a1}" stroke-width="0.5" stroke-opacity="0.15"/>`
      }
    }
    shapes = hexes
  } else {
    const spacing = 22 + r() * 14
    const dotR = 2 + r() * 4
    let dots = ''
    for (let x = spacing / 2; x < width; x += spacing) {
      for (let y = spacing / 2; y < height; y += spacing) {
        const opacity = (0.1 + r() * 0.35).toFixed(2)
        const fill = r() > 0.7 ? palette.a1 : palette.a2
        dots += `<circle cx="${x}" cy="${y}" r="${dotR * (0.5 + r() * 0.8)}" fill="${fill}" opacity="${opacity}"/>`
      }
    }
    shapes = dots + `<circle cx="${width * 0.6}" cy="${height * 0.4}" r="${70 + r() * 50}" fill="${palette.a1}" opacity="0.12"/>`
  }

  return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${palette.bg}"/>
  ${shapes}
</svg>`)}`
}

interface ThumbnailProps {
  id: number | string
  name: string
  thumbnailUrl?: string
  className?: string
}

export function Thumbnail({ id, name, thumbnailUrl, className = '' }: ThumbnailProps) {
  const [imgError, setImgError] = useState(false)
  const fallbackSvg = generateSVGPattern(id)

  if (thumbnailUrl && !imgError) {
    return (
      <img
        src={thumbnailUrl}
        alt={name}
        className={`object-cover ${className}`}
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <img
      src={fallbackSvg}
      alt={name}
      className={`object-cover ${className}`}
    />
  )
}
