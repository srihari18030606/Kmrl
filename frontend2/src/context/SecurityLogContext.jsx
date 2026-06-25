import { createContext, useContext, useState } from 'react'

const SecurityLogContext = createContext()

export function SecurityLogProvider({ children }) {
  const [logs, setLogs] = useState([
    {
      time: '09:20',
      user: 'ADMIN001',
      event: 'Login',
      module: 'Authentication',
      status: 'Success'
    }
  ])

  const addLog = (log) => {
    setLogs((prev) => [
      {
        time: new Date().toLocaleTimeString(),
        ...log
      },
      ...prev
    ])
  }

  return (
    <SecurityLogContext.Provider value={{ logs, addLog }}>
      {children}
    </SecurityLogContext.Provider>
  )
}

export const useSecurityLogs = () => useContext(SecurityLogContext)