export function NewMessagesSeparator() {
  return (
    <div className="flex items-center gap-3 py-4 px-4">
      <div className="flex-1 h-px bg-red-500" />
      <span className="text-xs font-medium text-red-500 uppercase tracking-wide">
        Messages non lus
      </span>
      <div className="flex-1 h-px bg-red-500" />
    </div>
  );
}
