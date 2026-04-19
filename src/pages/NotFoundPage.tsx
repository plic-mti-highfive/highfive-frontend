import { useNavigate } from 'react-router-dom'
import { Header } from '@features/layout'
import { Footer } from '@features/layout'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <>
      <Header />
      <main className="relative z-0 min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h1 className="text-9xl font-bold text-foreground mb-6">404</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Oups ! La page que vous recherchez n'existe pas.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Retour à l'accueil
          </button>
        </div>
      </main>
      <Footer />
    </>
  )
}
