import { useState } from 'react'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('authenticated') === 'true'
  )
  const [username, setUsername] = useState(
    () => localStorage.getItem('username') ?? 'Utilisateur'
  )
  const isLoading = false

  const login = (user: string, rememberMe?: boolean) => {
    localStorage.setItem('authenticated', 'true')
    localStorage.setItem('username', user || 'Utilisateur')
    if (rememberMe) localStorage.setItem('remember', 'true')
    setIsAuthenticated(true)
    setUsername(user || 'Utilisateur')
  }

  const logout = () => {
    localStorage.removeItem('authenticated')
    localStorage.removeItem('username')
    localStorage.removeItem('remember')
    setIsAuthenticated(false)
    setUsername('Utilisateur')
  }

  const initials = username.slice(0, 2).toUpperCase()

  return {
    isAuthenticated,
    username,
    initials,
    isLoading,
    login,
    logout,
  }
}
