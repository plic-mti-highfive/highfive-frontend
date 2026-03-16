import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">Hello</h1>
        <p className="text-muted-foreground">(avec Tailwind CSS)</p>
        <Button size="lg" onClick={() => navigate('/canvas')}>
          Ouvrir le canvas
        </Button>
      </div>
    </div>
  )
}