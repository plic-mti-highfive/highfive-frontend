import { BackButton } from './BackButton'
import { PrimaryButton } from './PrimaryButton'
import { ProgressDots } from './ProgressDots'

export function StepManualDesc({ onBack, onNext, value, onChange }: {
  onBack: () => void
  onNext: () => void
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-6">
      <BackButton onClick={onBack} />
      <ProgressDots step="manual-desc" />
      <div className="mb-8">
        <h2 className="text-4xl font-black text-gray-900 leading-tight">Décris ton<br />projet</h2>
        <p className="mt-2 text-sm text-gray-500">Explique ce que tu construis, pour qui, et ce que tu recherches.</p>
      </div>
      <textarea
        value={value} onChange={e => onChange(e.target.value)}
        placeholder="Décris ton projet, ses objectifs, ce que tu recherches comme collaborateurs…"
        rows={5} autoFocus
        className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all shadow-sm"
      />
      <PrimaryButton onClick={onNext} disabled={!value.trim()}>
        Continuer →
      </PrimaryButton>
    </div>
  )
}
