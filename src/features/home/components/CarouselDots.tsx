interface CarouselDotsProps {
  count: number
  active: number
  onSelect: (i: number) => void
}

export function CarouselDots({
  count,
  active,
  onSelect,
}: CarouselDotsProps) {
  return (
    <div className="flex gap-2 justify-center mt-5">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Aller au projet ${i + 1}`}
          className={`rounded-full transition-all duration-300 ${
            i === active
              ? 'bg-blue-500 w-5 h-2.5'
              : 'bg-gray-300 hover:bg-gray-400 w-2.5 h-2.5'
          }`}
        />
      ))}
    </div>
  )
}
