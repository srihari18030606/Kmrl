import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App'

import { AuthProvider } from './context/AuthContext'
import { SecurityLogProvider } from './context/SecurityLogContext'

import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SecurityLogProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SecurityLogProvider>
    </AuthProvider>
  </React.StrictMode>
)