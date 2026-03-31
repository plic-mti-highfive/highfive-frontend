import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import Logo from '@/components/Logo'

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember]     = useState(false)
  const [error, setError]           = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Adresse e-mail invalide.')
      return
    }

    localStorage.setItem('authenticated', 'true')
    if (remember) localStorage.setItem('remember', 'true')

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
          <Logo className="text-3xl" textColor="text-ink" />
        </div>

        {/* Formulaire centré verticalement */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-md">

          {/* En-tête */}
          <div className="mb-10 text-center">
            <h1 className="font-heading text-display-lg text-ink mb-3">
              Se connecter
            </h1>
            <p className="text-body-lg text-ink-muted">
              Profitez de tous les outils fournis par la plateforme.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-6">

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
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Se souvenir + Mot de passe oublié */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <Checkbox
                  checked={remember}
                  onCheckedChange={(v) => setRemember(v === true)}
                />
                <span className="text-body-md text-ink-soft">Se souvenir de moi</span>
              </label>
              <button
                type="button"
                className="text-body-md text-ink-muted hover:text-ink transition-colors underline-offset-4 hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Erreur */}
            {error && (
              <p className="text-body-md text-rose-dark">{error}</p>
            )}

            {/* Bouton Se connecter */}
            <Button
              type="submit"
              className="w-full h-13 text-body-lg font-semibold rounded-lg text-cream mt-2"
            >
              Se connecter
            </Button>
          </form>
        </div>

        {/* Bas : lien inscription */}
        <div className="pb-4 text-center">
          <p className="text-body-md text-ink-muted">
            Vous n'avez pas de compte ?{' '}
            <Link
              to="/register"
              className="text-ink font-semibold underline-offset-4 hover:underline"
            >
              Créez-en un ici.
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
