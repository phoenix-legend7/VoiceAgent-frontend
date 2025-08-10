import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthInit, AuthProvider } from './core/authProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AuthInit>
        <App />
      </AuthInit>
    </AuthProvider>
  </StrictMode>,
)
