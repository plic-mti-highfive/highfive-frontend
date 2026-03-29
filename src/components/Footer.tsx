import { Link } from 'react-router-dom'
import Logo from '@/components/Logo'

const LINKS = {
  Produit: [
    { label: 'Fonctionnalités', to: '/' },
    { label: 'Tarifs', to: '/' },
    { label: 'Nouveautés', to: '/' },
  ],
  Ressources: [
    { label: 'Documentation', to: '/' },
    { label: 'Tutoriels', to: '/' },
    { label: 'Blog', to: '/' },
  ],
  Légal: [
    { label: 'Confidentialité', to: '/' },
    { label: 'Conditions d\'utilisation', to: '/' },
    { label: 'Mentions légales', to: '/' },
  ],
}

export default function Footer() {
  return (
    <footer className="w-full bg-cream border-t border-cream-mid">

      {/* Corps */}
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">

        {/* Marque */}
        <div className="flex flex-col gap-3 md:w-56 shrink-0">
          <Logo className="text-xl" />
          <p className="text-body-sm text-ink-muted leading-relaxed">
            La plateforme de gestion de projets créatifs, pensée pour les équipes ambitieuses.
          </p>
        </div>

        {/* Liens */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-8">
          {Object.entries(LINKS).map(([category, items]) => (
            <div key={category} className="flex flex-col gap-3">
              <p className="text-label text-ink uppercase tracking-widest">{category}</p>
              <ul className="flex flex-col gap-2">
                {items.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-body-sm text-ink-muted hover:text-ink transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bas */}
      <div className="border-t border-cream-mid px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-body-sm text-ink-muted">
          © {new Date().getFullYear()} HighFive. Tous droits réservés.
        </p>
        <p className="text-body-sm text-ink-muted">
          Fait avec soin à Paris.
        </p>
      </div>

    </footer>
  )
}
