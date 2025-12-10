import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Player from './pages/Player'
import ThemeController from './components/ThemeController'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeController />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/player" element={<Player />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
