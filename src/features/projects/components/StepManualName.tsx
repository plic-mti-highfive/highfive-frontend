import { BackButton } from './BackButton'
import { PrimaryButton } from './PrimaryButton'
import { ProgressDots } from './ProgressDots'

export function StepManualName({ onBack, onNext, value, onChange }: {
  onBack: () => void
  onNext: () => void
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-6">
      <BackButton onClick={onBack} />
      <ProgressDots step="manual-name" />
      <div className="mb-8">
        <h2 className="text-4xl font-black text-ink leading-tight">Quel est le nom<br />de ton projet ?</h2>
        <p className="mt-2 text-sm text-ink">Choisis un titre court et percutant.</p>
      </div>
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder="Ex : EcoTrack"
        autoFocus
        onKeyDown={e => { if (e.key === 'Enter' && value.trim()) onNext() }}
        className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-lg text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all shadow-sm"
      />
      <PrimaryButton onClick={onNext} disabled={!value.trim()}>
        Continuer →
      </PrimaryButton>
    </div>
  )
}
