import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
  const savedUser = localStorage.getItem('kmrl_user')
  return savedUser ? JSON.parse(savedUser) : null
})

  const login = (userData) => {
  localStorage.setItem('kmrl_user', JSON.stringify(userData))
  setUser(userData)
}

  const logout = () => {
  localStorage.removeItem('kmrl_user')
  setUser(null)
}
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        role: user?.role
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}