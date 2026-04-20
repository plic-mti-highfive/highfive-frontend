import { Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from '@features/home'
import { LoginPage, RegisterPage } from '@features/auth'
import { CreateProjectPage, ProjectDetailPage } from '@features/projects'
import { UserProfilePage } from '@features/user'
import { SearchPage } from '@features/search'
import { ScrollToTop } from '@shared/components/ScrollToTop'
import Debug from './pages/Debug'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/search" element={<Navigate to="/search/projects" replace />} />
        <Route path="/search/projects" element={<SearchPage />} />
        <Route path="/search/users" element={<SearchPage />} />
        <Route path="/create-project" element={<CreateProjectPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/user/:username" element={<UserProfilePage />} />
        <Route path="/debug" element={<Debug />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}