export function ProgressBar({ value }: { value: number }) {
  const capped = Math.min(value, 100)
  const color = value >= 100 ? 'var(--color-apple)' : 'var(--color-purple)'
  return (
    <div className="w-full h-[3px] rounded-full bg-black/8 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${capped}%`, backgroundColor: color }}
      />
    </div>
  )
}
