import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Debug from './pages/Debug'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/debug" element={<Debug />} />
    </Routes>
  )
}
