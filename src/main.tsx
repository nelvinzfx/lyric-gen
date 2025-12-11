import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Player from './pages/Player'
import Maintenance from './pages/Maintenance'
import ThemeController from './components/ThemeController'
import './index.css'

function App() {
  const [isMaintenance, setIsMaintenance] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    fetch('/api/v1/recommendations')
      .then(res => {
        if (res.status === 503) {
          setIsMaintenance(true)
        }
        setChecked(true)
      })
      .catch(() => setChecked(true))
  }, [])

  if (!checked) return null
  if (isMaintenance) return <Maintenance />

  return (
    <BrowserRouter>
      <ThemeController />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/player" element={<Player />} />
      </Routes>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
