import { Link } from 'react-router-dom'
import { Logo } from '@features/layout'

interface AuthLayoutProps {
  title: string
  description: string
  children: React.ReactNode
  footerText: string
  footerLink: { text: string; href: string }
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function AuthLayout({
  title,
  description,
  children,
  footerText,
  footerLink,
  onSubmit
}: AuthLayoutProps) {
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
              {title}
            </h1>
            <p className="text-body-lg text-ink-muted">
              {description}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} noValidate className="space-y-6">
            {children}
          </form>
        </div>

        {/* Bas : lien */}
        <div className="pb-4 text-center">
          <p className="text-body-md text-ink-muted">
            {footerText}{' '}
            <Link
              to={footerLink.href}
              className="text-ink font-semibold underline-offset-4 hover:underline"
            >
              {footerLink.text}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
