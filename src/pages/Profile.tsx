'use client'

import { useState, useRef, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'


interface ProfileForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  description: string
  tags: string[]
}


const ALL_TAGS = [
  'C++', 'Java', 'Python', 'JavaScript', 'TypeScript', 'Rust', 'Go', 'Swift',
  'Kotlin', 'React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Django', 'Rails',
  'Docker', 'Kubernetes', 'AWS', 'Design UI/UX', 'Figma', 'Data Science',
  'Machine Learning', 'DevOps', 'Cybersécurité', 'Blockchain', 'Embarqué',
  'Robotique', 'Rigoureux', 'Créatif', 'Leader', 'Pédagogue',
]


const INITIAL_FORM: ProfileForm = {
  firstName:   '',
  lastName:    '',
  email:       '',
  phone:       '',
  description: '',
  tags:        ['C++', 'Java', 'Rigoureux'],
}


function AvatarUpload() {
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="
        relative w-44 h-44 rounded-3xl overflow-hidden
        bg-[#e8e0f0] flex items-center justify-center
        group transition-all hover:brightness-95 active:scale-[0.98]
        flex-shrink-0
      "
      aria-label="Changer la photo de profil"
    >
      {preview ? (
        <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        /* Default avatar icon */
        <svg viewBox="0 0 80 80" className="w-28 h-28 text-[#6b3fa0]" fill="currentColor">
          <circle cx="40" cy="28" r="16" />
          <path d="M10 68c0-16.569 13.431-30 30-30s30 13.431 30 30" />
        </svg>
      )}
      {/* Hover overlay */}
      <div className="
        absolute inset-0 bg-black/0 group-hover:bg-black/20
        flex items-center justify-center transition-all
      ">
        <span className="
          text-white text-xs font-semibold opacity-0 group-hover:opacity-100
          transition-opacity bg-black/50 px-2 py-1 rounded-lg
        ">
          Modifier
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </button>
  )
}

function TagSearchDropdown({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (tags: string[]) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen]   = useState(false)
  const containerRef      = useRef<HTMLDivElement>(null)

  const filtered = ALL_TAGS.filter(t =>
    t.toLowerCase().includes(query.toLowerCase())
  )

  const toggle = (tag: string) => {
    onChange(
      selected.includes(tag)
        ? selected.filter(t => t !== tag)
        : selected.length < 8 ? [...selected, tag] : selected
    )
  }

  const remove = (tag: string) => onChange(selected.filter(t => t !== tag))

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      {/* Search input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={selected.length >= 8 ? 'Maximum 8 tags atteint' : 'Rechercher un tag…'}
          disabled={selected.length >= 8}
          className="
            w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-3
            text-sm text-gray-800 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
            transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed
          "
        />
        {open && (
          <button type="button" onClick={() => { setOpen(false); setQuery('') }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-lg leading-none">
            ×
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filtered.length === 0
            ? <p className="text-sm text-gray-400 px-4 py-3">Aucun tag trouvé.</p>
            : filtered.map(tag => {
                const active = selected.includes(tag)
                return (
                  <button key={tag} type="button" onClick={() => toggle(tag)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors
                      ${active ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <span>{tag}</span>
                    {active && <span className="text-gray-900 font-bold text-xs">✓</span>}
                  </button>
                )
              })
          }
        </div>
      )}

      {/* Selected pills */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selected.map(tag => (
            <span key={tag}
              className="flex items-center gap-1 px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded-full">
              {tag}
              <button type="button" onClick={() => remove(tag)}
                className="opacity-60 hover:opacity-100 transition-opacity ml-0.5 text-sm leading-none"
                aria-label={`Retirer ${tag}`}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-1.5">
        {selected.length} / 8 tags
        {selected.length >= 8 && <span className="text-amber-600"> — maximum atteint</span>}
      </p>
    </div>
  )
}


function Field({
  label, value, onChange, type = 'text', placeholder,
}: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-gray-700 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full rounded-xl border border-gray-200 bg-white px-4 py-3
          text-sm text-gray-800 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
          transition-all shadow-sm
        "
      />
    </div>
  )
}


export default function Profile() {
  const [form, setForm] = useState<ProfileForm>(INITIAL_FORM)
  const [saved, setSaved] = useState(false)

  const update = (field: keyof ProfileForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // 💡 Branche ici ton appel API : PATCH /api/me avec { form }
    console.log('Sauvegarder profil :', form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#f0ebe3] px-6 py-16">
        <div className="max-w-2xl mx-auto">

          <form onSubmit={handleSubmit} className="space-y-10">

            {/* ── Section 1 : Account Settings ── */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-8">Account Settings</h2>

              <div className="flex items-start gap-8">
                {/* Avatar */}
                <AvatarUpload />

                {/* Fields */}
                <div className="flex-1 grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      label="First Name"
                      value={form.firstName}
                      onChange={update('firstName')}
                      placeholder="Jean"
                    />
                    <Field
                      label="Last Name"
                      value={form.lastName}
                      onChange={update('lastName')}
                      placeholder="Dupont"
                    />
                  </div>
                  <Field
                    label="E-mail address"
                    value={form.email}
                    onChange={update('email')}
                    type="email"
                    placeholder="jean@exemple.com"
                  />
                  <Field
                    label="Telephone Number"
                    value={form.phone}
                    onChange={update('phone')}
                    type="tel"
                    placeholder="+33 6 00 00 00 00"
                  />
                </div>
              </div>
            </section>

            {/* Divider */}
            <div className="h-px bg-gray-300" />

            {/* ── Section 2 : Profile Settings ── */}
            <section className="space-y-6">
              <h2 className="text-3xl font-black text-gray-900">Profile Settings</h2>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={update('description')}
                  placeholder="Parle un peu de toi, de tes intérêts, de ce que tu cherches sur la plateforme…"
                  rows={4}
                  className="
                    w-full rounded-xl border border-gray-200 bg-white px-4 py-3
                    text-sm text-gray-800 placeholder-gray-400 resize-none
                    focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                    transition-all shadow-sm
                  "
                />
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 block">Tags & compétences</label>
                <TagSearchDropdown
                  selected={form.tags}
                  onChange={tags => setForm(f => ({ ...f, tags }))}
                />
              </div>
            </section>

            {/* ── Save button ── */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className={`
                  px-8 py-3 rounded-2xl font-bold text-sm
                  transition-all duration-300 shadow-sm
                  ${saved
                    ? 'bg-green-600 text-white scale-[0.98]'
                    : 'bg-gray-900 text-white hover:bg-gray-700 active:scale-[0.97]'
                  }
                `}
              >
                {saved ? '✓ Sauvegardé !' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
      </main>

      <Footer />
    </>
  )
}