'use client'

import { useState, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface ProjectForm {
  name: string
  description: string
  tags: string[]
}

// ─────────────────────────────────────────────
// Predefined tags — remplace / étends cette liste selon ton backend
// 💡 Tu peux aussi les charger via: const { data: tags } = useSWR('/api/tags')
// ─────────────────────────────────────────────
const ALL_TAGS = [
  'Open Source', 'IA / ML', 'Web', 'Mobile', 'Hardware', 'IoT',
  'Environnement', 'Éducation', 'Santé', 'Social', 'Art', 'Jeu',
  'Infrastructure', 'Sécurité', 'Data', 'Blockchain', 'Design', 'Finance',
  'Logistique', 'Agriculture', 'Transport', 'Énergie', 'Robotique', 'Chimie',
  'Physique', 'Biologie', 'Médecine', 'Juridique', 'Sport', 'Musique',
  'Photographie', 'Cinéma', 'Littérature', 'Philosophie', 'Psychologie',
]

// ─────────────────────────────────────────────
// TagSearchDropdown
// ─────────────────────────────────────────────
function TagSearchDropdown({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (tags: string[]) => void
}) {
  const [query, setQuery]     = useState('')
  const [open, setOpen]       = useState(false)
  const containerRef          = useRef<HTMLDivElement>(null)

  const filtered = ALL_TAGS.filter(t =>
    t.toLowerCase().includes(query.toLowerCase())
  )

  const toggle = (tag: string) => {
    onChange(
      selected.includes(tag)
        ? selected.filter(t => t !== tag)
        : selected.length < 5 ? [...selected, tag] : selected
    )
  }

  const remove = (tag: string) => onChange(selected.filter(t => t !== tag))

  // Ferme le dropdown si on clique en dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={containerRef} className="relative">

      {/* Selected tags pills */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selected.map(tag => (
            <span
              key={tag}
              className="flex items-center gap-1 px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                className="opacity-60 hover:opacity-100 transition-opacity ml-0.5 text-sm leading-none"
                aria-label={`Retirer ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={selected.length >= 5 ? 'Maximum 5 tags atteint' : 'Rechercher un tag…'}
          disabled={selected.length >= 5}
          className="
            w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-3
            text-sm text-gray-800 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
            transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed
          "
        />
        {open && (
          <button
            type="button"
            onClick={() => { setOpen(false); setQuery('') }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="
          absolute z-20 top-full mt-1 w-full
          bg-white border border-gray-200 rounded-xl shadow-lg
          max-h-52 overflow-y-auto
        ">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 px-4 py-3">Aucun tag trouvé.</p>
          ) : (
            filtered.map(tag => {
              const active = selected.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggle(tag)}
                  className={`
                    w-full flex items-center justify-between px-4 py-2.5 text-sm
                    transition-colors duration-100
                    ${active
                      ? 'bg-gray-50 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <span>{tag}</span>
                  {active && (
                    <span className="text-gray-900 font-bold text-xs">✓</span>
                  )}
                </button>
              )
            })
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-1.5">
        {selected.length} / 5 tags sélectionnés
        {selected.length >= 5 && <span className="text-amber-600"> — maximum atteint</span>}
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────
// AI Modal
// ─────────────────────────────────────────────
function AIModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void
  onConfirm: (pitch: string) => void
}) {
  const [pitch, setPitch]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!pitch.trim()) return
    setLoading(true)
    // 💡 Branche ici ton appel API : POST /api/ai/generate-project avec { pitch }
    // La réponse devrait retourner { name, description, tags }
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    onConfirm(pitch)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-modal-in">

        {/* Header — rouge, cohérent avec le bouton */}
        <div className="bg-[#c0392b] px-7 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-red-200 uppercase tracking-widest mb-0.5">✦ IA</p>
            <h3 className="text-white text-lg font-bold">Pitch your project</h3>
          </div>
          <button
            onClick={onClose}
            className="text-red-300 hover:text-white transition-colors text-xl leading-none"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6 space-y-5">
          <p className="text-sm text-gray-500 leading-relaxed">
            Décris ton projet en quelques phrases. Notre IA va générer un titre,
            une description et des tags adaptés.
          </p>

          <textarea
            value={pitch}
            onChange={e => setPitch(e.target.value)}
            placeholder="Ex: Une app mobile qui aide les habitants d'un quartier à partager leurs outils et objets du quotidien…"
            rows={4}
            className="
              w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3
              text-sm text-gray-800 placeholder-gray-400 resize-none
              focus:outline-none focus:ring-2 focus:ring-[#c0392b] focus:border-transparent
              transition-all
            "
          />

          <button
            onClick={handleConfirm}
            disabled={!pitch.trim() || loading}
            className="
              w-full py-3 rounded-xl bg-[#c0392b] hover:bg-[#a93226] text-white text-sm font-semibold
              active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-200 flex items-center justify-center gap-2
            "
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Génération…
              </>
            ) : (
              'Générer ✦'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// CreateProject page
// ─────────────────────────────────────────────
export default function CreateProject() {
  const [form, setForm]     = useState<ProjectForm>({ name: '', description: '', tags: [] })
  const [showAI, setShowAI] = useState(false)

  const update = (field: keyof Pick<ProjectForm, 'name' | 'description'>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))

  const handleAIConfirm = (pitch: string) => {
    // 💡 Remplace par la vraie réponse de ton API IA
    // ex: const { name, description, tags } = await generateProject(pitch)
    setForm(f => ({
      ...f,
      name:        f.name        || 'Nom généré par l\'IA',
      description: f.description || pitch,
    }))
    setShowAI(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 💡 Branche ici ton appel API : POST /api/projects avec { form }
    console.log('Créer projet :', form)
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#f0ebe3] px-6 py-16">
        <div className="max-w-xl mx-auto">

          {/* Page title */}
          <div className="mb-10">
            <h1 className="text-5xl font-black text-gray-900 leading-tight">
              Make your own<br />project
            </h1>
            <p className="mt-3 text-sm text-gray-500">
              Partage ton idée avec la communauté et trouve des collaborateurs.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">

            {/* ① AI assistance — en premier */}
            <button
              type="button"
              onClick={() => setShowAI(true)}
              className="
                w-full flex items-center justify-between
                bg-[#c0392b] hover:bg-[#a93226] active:scale-[0.99]
                text-white rounded-2xl px-6 py-5
                transition-all duration-200 shadow-sm group
              "
            >
              <div className="text-left">
                <p className="font-bold text-base">✦ AI assistance</p>
                <p className="text-sm text-red-200 mt-0.5">Laisse l'IA remplir le formulaire pour toi</p>
              </div>
              <span className="text-2xl opacity-60 group-hover:translate-x-1 transition-transform">→</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-xs text-gray-400 font-medium">ou remplis manuellement</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            {/* ② Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800 block">Nom du projet</label>
              <input
                type="text"
                value={form.name}
                onChange={update('name')}
                placeholder="Ex: EcoTrack"
                className="
                  w-full rounded-xl border border-gray-200 bg-white px-4 py-3
                  text-sm text-gray-800 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                  transition-all shadow-sm
                "
              />
            </div>

            {/* ③ Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800 block">Description</label>
              <textarea
                value={form.description}
                onChange={update('description')}
                placeholder="Décris ton projet, ses objectifs, ce que tu recherches…"
                rows={4}
                className="
                  w-full rounded-xl border border-gray-200 bg-white px-4 py-3
                  text-sm text-gray-800 placeholder-gray-400 resize-none
                  focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                  transition-all shadow-sm
                "
              />
            </div>

            {/* ④ Tags */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800 block">Tags</label>
              <TagSearchDropdown
                selected={form.tags}
                onChange={tags => setForm(f => ({ ...f, tags }))}
              />
            </div>

            {/* ⑤ Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="
                  w-full py-4 rounded-2xl bg-gray-900 text-white font-bold text-base
                  hover:bg-gray-700 active:scale-[0.98]
                  transition-all duration-200 shadow-sm
                "
              >
                Créer le projet
              </button>
            </div>

          </form>
        </div>
      </main>

      {showAI && (
        <AIModal onClose={() => setShowAI(false)} onConfirm={handleAIConfirm} />
      )}

      <Footer />

      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-in { animation: modal-in 0.2s ease-out both; }
      `}</style>
    </>
  )
}