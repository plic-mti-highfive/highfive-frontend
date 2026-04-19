export function PrimaryButton({ children, onClick, disabled = false, type = 'button' }: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold text-base hover:bg-gray-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm">
      {children}
    </button>
  )
}
