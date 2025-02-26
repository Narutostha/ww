import { createRoot } from 'react-dom/client'
import { ThemeProvider } from "next-themes"
import App from './App'
import './index.css'

const container = document.getElementById('root')
if (!container) throw new Error('Failed to find the root element')

const root = createRoot(container)

root.render(
  <ThemeProvider attribute="class" defaultTheme="light">
    <App />
  </ThemeProvider>
)