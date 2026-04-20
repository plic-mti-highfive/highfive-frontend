import { Routes, Route } from 'react-router-dom'
import { HomePage } from '@features/home'
import { LoginPage, RegisterPage } from '@features/auth'
import { CreateProjectPage, ProjectDetailPage } from '@features/projects'
import { UserProfilePage } from '@features/user'
import { SearchPage } from '@features/search'
import Debug from './pages/Debug'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/create-project" element={<CreateProjectPage />} />
      <Route path="/projects/:id" element={<ProjectDetailPage />} />
      <Route path="/user/:username" element={<UserProfilePage />} />
      <Route path="/debug" element={<Debug />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}