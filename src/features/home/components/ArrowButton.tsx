interface ArrowButtonProps {
  onClick: () => void
  label: string
  children: React.ReactNode
}

export function ArrowButton({ onClick, label, children }: ArrowButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="
        flex-shrink-0 w-9 h-9 rounded-full
        flex items-center justify-center
        text-gray-400 text-2xl leading-none
        hover:text-gray-800 hover:bg-white/80 hover:scale-110 hover:shadow-sm
        active:scale-95
        transition-all duration-200
      "
    >
      {children}
    </button>
  )
}
