import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CreateProject from './pages/CreateProject'
import Debug from './pages/Debug'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/create-project" element={<CreateProject />} />
      <Route path="/debug" element={<Debug />} />
    </Routes>
  )
}
