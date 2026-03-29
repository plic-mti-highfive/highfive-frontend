import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Logo from '@/components/Logo'

export default function Register() {
  const navigate = useNavigate()

  const [username, setUsername]         = useState('')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [confirm, setConfirm]           = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    localStorage.setItem('authenticated', 'true')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-cream flex p-6 gap-6">

      {/* Gauche : placeholder image */}
      <div className="hidden md:flex w-1/2 bg-cream-dark rounded-xl" />

      {/* Droite : formulaire */}
      <div className="w-full md:w-1/2 flex flex-col items-center px-4">

        {/* Logo */}
        <div className="flex pt-4 w-full max-w-md justify-center">
          <Logo className="text-3xl" />
        </div>

        {/* Formulaire centré verticalement */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-md">

          {/* En-tête */}
          <div className="mb-10 text-center">
            <h1 className="font-heading text-display-lg text-ink mb-3">
              Créer un compte
            </h1>
            <p className="text-body-lg text-ink-muted">
              Rejoignez la plateforme et accédez à tous les outils.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* Nom affiché */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-body-md text-ink font-semibold">
                Nom affiché
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body-md text-ink-muted select-none">
                  @
                </span>
                <Input
                  id="username"
                  type="text"
                  placeholder="votre_nom"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-13 text-body-md bg-cream-dark border-cream-mid text-ink placeholder:text-ink-muted focus-visible:border-ink focus-visible:ring-ink/20 pl-7"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-body-md text-ink font-semibold">
                Adresse e-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-13 text-body-md bg-cream-dark border-cream-mid text-ink placeholder:text-ink-muted focus-visible:border-ink focus-visible:ring-ink/20"
              />
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-body-md text-ink font-semibold">
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-13 text-body-md bg-cream-dark border-cream-mid text-ink placeholder:text-ink-muted focus-visible:border-ink focus-visible:ring-ink/20 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirmation */}
            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-body-md text-ink font-semibold">
                Confirmer le mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="h-13 text-body-md bg-cream-dark border-cream-mid text-ink placeholder:text-ink-muted focus-visible:border-ink focus-visible:ring-ink/20 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
                  aria-label={showConfirm ? 'Masquer' : 'Afficher'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Bouton */}
            <Button
              type="submit"
              className="w-full h-13 text-body-lg font-semibold rounded-lg text-cream mt-2"
            >
              Créer mon compte
            </Button>
          </form>
        </div>

        {/* Bas : lien connexion */}
        <div className="pb-4 text-center">
          <p className="text-body-md text-ink-muted">
            Vous avez déjà un compte ?{' '}
            <Link
              to="/login"
              className="text-ink font-semibold underline-offset-4 hover:underline"
            >
              Connectez-vous.
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
