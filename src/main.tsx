import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { SubscriptionsProvider } from './contexts/suscriptionsContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <SubscriptionsProvider>
    <App />
  </SubscriptionsProvider>
  // </React.StrictMode>,
)
