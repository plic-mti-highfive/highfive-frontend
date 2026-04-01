export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8 group">
      <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Précédent
    </button>
  )
}
