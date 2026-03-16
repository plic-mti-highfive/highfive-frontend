import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Canvas() {
  const navigate = useNavigate()

  return (
    <div className="fixed inset-0">
      <div className="absolute top-12 left-3 z-10">
        <Button variant="outline" size="sm" onClick={() => navigate('/')}>
          ← Retour
        </Button>
      </div>
      <Tldraw />
    </div>
  )
}