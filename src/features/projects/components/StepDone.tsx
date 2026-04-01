import { useNavigate } from 'react-router-dom'

export function StepDone({ projectName }: { projectName: string }) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center text-center py-10 space-y-8">
      <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" className="animate-check-draw" />
        </svg>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Projet créé</p>
        <h2 className="text-4xl font-black text-gray-900 leading-tight">
          {projectName || 'Ton projet'} est en ligne !
        </h2>
        <p className="mt-3 text-sm text-gray-500 max-w-xs mx-auto">
          La communauté peut maintenant le découvrir et y contribuer.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => navigate('/projects/new')}
          className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold text-base hover:bg-gray-700 active:scale-[0.98] transition-all duration-200 shadow-sm"
        >
          Voir mon projet →
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full py-3 rounded-2xl text-gray-500 text-sm hover:text-gray-800 transition-colors"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  )
}
