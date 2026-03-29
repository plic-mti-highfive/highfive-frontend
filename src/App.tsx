import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Canvas from './pages/Canvas'
import Debug from './pages/Debug'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/canvas" element={<Canvas />} />
      <Route path="/debug" element={<Debug />} />
    </Routes>
  )
}
