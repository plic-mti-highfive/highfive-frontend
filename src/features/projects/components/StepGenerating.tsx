import { useState, useEffect } from 'react'

const LINES = [
  'Analyse de ton pitch…',
  'Génération du titre…',
  'Rédaction de la description…',
  'Sélection des tags…',
  'Finalisation…',
]

export function StepGenerating() {
  const [lineIdx, setLineIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setLineIdx(i => Math.min(i + 1, LINES.length - 1)), 600)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-8">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#c0392b] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-[#c0392b]/40 border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.8s', animationDirection: 'reverse' }} />
      </div>

      <div className="space-y-1">
        <p className="text-lg font-black text-gray-900">Génération en cours…</p>
        <p className="text-sm text-[#c0392b] font-medium min-h-[1.25rem] transition-all duration-300">
          {LINES[lineIdx]}
        </p>
      </div>
    </div>
  )
}
