import { Routes, Route } from 'react-router-dom'
import { HomePage } from '@features/home'
import { LoginPage, RegisterPage } from '@features/auth'
import { CreateProjectPage } from '@features/projects'
import { UserProfilePage } from '@features/user'
import { LabPage } from '@features/lab'
import Debug from './pages/Debug'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/create-project" element={<CreateProjectPage />} />
      <Route path="/user/:username" element={<UserProfilePage />} />
      <Route path="/project/:projectId/lab" element={<LabPage />} />
      <Route path="/debug" element={<Debug />} />
    </Routes>
  )
}