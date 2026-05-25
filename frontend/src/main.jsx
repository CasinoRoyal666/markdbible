import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SettingsProvider } from "./context/SettingsContext.jsx";
import { GraphSettingsProvider } from "./context/GraphSettingsContext.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <GraphSettingsProvider>
        <App />
      </GraphSettingsProvider>
    </SettingsProvider>
  </StrictMode>,
)
