// Utility pour simuler les délais réseau
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Générer un UUID simple pour les mocks
export const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
