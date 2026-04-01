export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-1.5 text-sm text-ink hover:text-ink transition-colors mb-8 group">
      <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Précédent
    </button>
  )
}
