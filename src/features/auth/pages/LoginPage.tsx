import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'
import { Label } from '@shared/components/ui/label'
import { Checkbox } from '@shared/components/ui/checkbox'
import { AuthLayout } from '../components/AuthLayout'
import { PasswordInput } from '@shared/components/ui/password-input'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')

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

    login(email, remember)
    navigate('/')
  }

  return (
    <AuthLayout
      title="Se connecter"
      description="Profitez de tous les outils fournis par la plateforme."
      onSubmit={handleSubmit}
      footerText="Vous n'avez pas de compte ?"
      footerLink={{ text: 'Créez-en un ici.', href: '/register' }}
    >
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          className="h-13 text-body-md bg-cream-dark border-cream-mid text-ink placeholder:text-ink-muted focus-visible:border-ink focus-visible:ring-ink/20"
        />
      </div>

      {/* Mot de passe */}
      <PasswordInput
        id="password"
        label="Mot de passe"
        value={password}
        onChange={setPassword}
        ariaLabel="Mot de passe"
      />

      {/* Se souvenir + Mot de passe oublié */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <Checkbox
            checked={remember}
            onCheckedChange={(v: boolean) => setRemember(v === true)}
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
    </AuthLayout>
  )
}
