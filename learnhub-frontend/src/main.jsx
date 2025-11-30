import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './contexts/ToastContext.jsx'
import { ConfirmProvider } from './contexts/ConfirmContext.jsx'
import { BlockchainProvider } from './contexts/BlockchainContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <ConfirmProvider>
        <BlockchainProvider>
          <App />
        </BlockchainProvider>
      </ConfirmProvider>
    </ToastProvider>
  </StrictMode>,
)
