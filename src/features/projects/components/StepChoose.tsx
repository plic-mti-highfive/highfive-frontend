import type { Mode } from '../types'

export function StepChoose({ onChoose }: { onChoose: (m: Mode) => void }) {
  return (
    <div className="space-y-6">
      <div className="mb-10">
        <h1 className="text-5xl font-black text-gray-900 leading-tight">
          Créer un<br />projet
        </h1>
        <p className="mt-3 text-sm text-gray-500">Comment veux-tu démarrer ?</p>
      </div>

      <button type="button" onClick={() => onChoose('ai')}
        className="w-full text-left bg-[var(--color-rose-dark)] hover:bg-[var(--color-rose-deeper)] active:scale-[0.99] text-white rounded-2xl px-7 py-6 transition-all duration-200 shadow-sm group flex items-center justify-between">
        <div>
          <p className="font-bold text-lg mb-1">✦ Avec l'IA</p>
          <p className="text-sm text-red-200 leading-relaxed max-w-xs">
            Décris ton idée en quelques phrases, l'IA génère le reste automatiquement.
          </p>
        </div>
        <span className="text-3xl opacity-50 group-hover:translate-x-1 transition-transform ml-4">→</span>
      </button>

      <button type="button" onClick={() => onChoose('manual')}
        className="w-full text-left bg-white hover:bg-gray-50 active:scale-[0.99] text-gray-900 rounded-2xl px-7 py-6 border border-gray-200 transition-all duration-200 shadow-sm group flex items-center justify-between">
        <div>
          <p className="font-bold text-lg mb-1">✎ Remplir le formulaire</p>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
            Titre, description, tags — tu contrôles chaque étape.
          </p>
        </div>
        <span className="text-3xl opacity-30 group-hover:translate-x-1 transition-transform ml-4">→</span>
      </button>
    </div>
  )
}
