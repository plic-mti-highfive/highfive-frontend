import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { Button } from '@shared/components/ui/button'

interface UnfollowConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  displayName: string
  onConfirm: () => void
}

export function UnfollowConfirmDialog({
  open,
  onOpenChange,
  displayName,
  onConfirm,
}: UnfollowConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50" />

        <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
          <div className="bg-cream rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-2xl font-heading font-semibold text-ink">
                Se désabonner
              </Dialog.Title>
              <Dialog.Close className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-cream-dark transition-colors">
                <X className="w-5 h-5 text-ink" />
              </Dialog.Close>
            </div>

            <p className="text-body-md text-ink-muted mb-6">
              Êtes-vous sûr de vouloir vous désabonner de{' '}
              <span className="font-semibold text-ink">{displayName}</span> ?
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                size="lg"
              >
                Annuler
              </Button>
              <Button
                onClick={handleConfirm}
                className="bg-rose hover:bg-rose-dark text-white"
                size="lg"
              >
                Se désabonner
              </Button>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
