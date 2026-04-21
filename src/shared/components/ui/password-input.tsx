import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@shared/components/ui/input'
import { Label } from '@shared/components/ui/label'

interface PasswordInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  ariaLabel?: string
}

export function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder = '••••••••',
  ariaLabel
}: PasswordInputProps) {
  const [show, setShow] = useState(false)

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-body-md text-foreground font-semibold">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-13 text-body-md pr-11"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={ariaLabel || (show ? 'Masquer' : 'Afficher')}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  )
}
