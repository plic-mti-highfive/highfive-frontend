import { useNavigate } from 'react-router-dom'
import { UserX } from 'lucide-react'
import { Button } from '@shared/components/ui/button'

export function UserNotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <div className="w-24 h-24 rounded-full bg-rose-light flex items-center justify-center">
          <UserX className="w-12 h-12 text-rose-dark" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-heading font-semibold text-ink">
            Utilisateur introuvable
          </h1>
          <p className="text-body-lg text-ink-muted">
            L'utilisateur que vous recherchez n'existe pas ou a été supprimé.
          </p>
        </div>

        <Button
          onClick={() => navigate('/')}
          className="mt-4"
          size="lg"
        >
          Retour à l'accueil
        </Button>
      </div>
    </div>
  )
}
