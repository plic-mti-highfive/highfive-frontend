import { useState } from 'react'
import { BackButton } from './BackButton'
import { PrimaryButton } from './PrimaryButton'

export function StepAIPitch({ onBack, onGenerate }: { onBack: () => void; onGenerate: (pitch: string) => void }) {
  const [pitch, setPitch] = useState('')
  return (
    <div className="space-y-6">
      <BackButton onClick={onBack} />
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-rose-dark)] mb-2">✦ IA</p>
        <h2 className="text-4xl font-black text-gray-900 leading-tight">Pitch ton projet</h2>
        <p className="mt-2 text-sm text-gray-500">
          Décris ton idée librement. L'IA va générer un titre, une description et des tags adaptés.
        </p>
      </div>
      <textarea
        value={pitch}
        onChange={e => setPitch(e.target.value)}
        placeholder="Ex : Une app qui permet aux habitants d'un quartier de partager leurs outils, organiser des événements locaux et créer du lien…"
        rows={6}
        autoFocus
        className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-rose-dark)] focus:border-transparent transition-all shadow-sm"
      />
      <PrimaryButton onClick={() => { if (pitch.trim()) onGenerate(pitch) }} disabled={!pitch.trim()}>
        Générer ✦
      </PrimaryButton>
    </div>
  )
}
