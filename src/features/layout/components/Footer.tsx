import { Link } from 'react-router-dom'
import { Logo } from '@features/layout'

const LINKS = [
  { label: 'Documentation', to: '/' },
  { label: 'Communauté', to: '/' },
  { label: 'Confidentialité', to: '/' },
  { label: 'Conditions', to: '/' },
]

export default function Footer() {
  return (
    <footer className="w-full bg-ink-soft border-t border-ink-muted">

      {/* Corps */}
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-8">

        {/* Marque */}
        <div className="flex flex-col gap-2 shrink-0">
          <Logo className="text-xl" textColor="text-white" />
        </div>

        {/* Liens - Ligne unique */}
        <div className="flex items-center gap-6">
          {LINKS.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="text-body-md text-white hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Droits */}
        <p className="text-body-md text-white/70 shrink-0">
          © {new Date().getFullYear()} HighFive
        </p>

      </div>

    </footer>
  )
}
