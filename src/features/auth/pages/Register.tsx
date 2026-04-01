import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'
import { Label } from '@shared/components/ui/label'
import { AuthLayout } from '../components/AuthLayout'
import { PasswordInput } from '@shared/components/ui/password-input'

export default function Register() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    localStorage.setItem('authenticated', 'true')
    localStorage.setItem('username', username || 'Utilisateur')
    navigate('/')
  }

  return (
    <AuthLayout
      title="Créer un compte"
      description="Rejoignez la plateforme et accédez à tous les outils."
      onSubmit={handleSubmit}
      footerText="Vous avez déjà un compte ?"
      footerLink={{ text: 'Connectez-vous.', href: '/login' }}
    >
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
      <PasswordInput
        id="password"
        label="Mot de passe"
        value={password}
        onChange={setPassword}
      />

      {/* Confirmation */}
      <PasswordInput
        id="confirm"
        label="Confirmer le mot de passe"
        value={confirm}
        onChange={setConfirm}
      />

      {/* Bouton */}
      <Button
        type="submit"
        className="w-full h-13 text-body-lg font-semibold rounded-lg text-cream mt-2"
      >
        Créer mon compte
      </Button>
    </AuthLayout>
  )
}
