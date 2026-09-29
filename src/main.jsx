import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/fonts.css' // self-hosted Fraunces / Inter / Bricolage (replaces Google Fonts)
import App from './App.jsx'
import { AuthProvider } from './lib/AuthContext.jsx'
import { initMeasure } from './utils/measure.js'

initMeasure()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
