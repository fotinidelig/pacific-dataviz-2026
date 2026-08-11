import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { applyTheme } from './theme'
import App from './App.jsx'
import './index.css'

// Palette CSS vars before paint (index.css utilities depend on them).
applyTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
