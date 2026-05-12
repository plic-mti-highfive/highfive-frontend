import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'
import { Label } from '@shared/components/ui/label'
import { AuthLayout } from '../components/AuthLayout'
import { PasswordInput } from '@shared/components/ui/password-input'
import { useAuth } from '../hooks/useAuth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    try {
      setIsSubmitting(true)
      await register(email, password)
      navigate('/')
    } catch {
      setError('Une erreur est survenue lors de la création du compte.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Créer un compte"
      description="Rejoignez la plateforme et accédez à tous les outils."
      imageUrl="https://images.unsplash.com/photo-1496115965489-21be7e6e59a0"
      onSubmit={handleSubmit}
      footerText="Vous avez déjà un compte ?"
      footerLink={{ text: 'Connectez-vous.', href: '/login' }}
    >
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-body-md text-foreground font-semibold">
          Adresse e-mail
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="vous@exemple.com"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          className="h-13 text-body-md"
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

      {/* Erreur */}
      {error && (
        <p className="text-body-md text-rose-dark">{error}</p>
      )}

      {/* Bouton */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-13 text-body-lg font-semibold rounded-lg mt-2 dark:bg-foreground dark:text-background dark:hover:bg-foreground/90"
      >
        {isSubmitting ? 'Création…' : 'Créer mon compte'}
      </Button>
    </AuthLayout>
  )
}
