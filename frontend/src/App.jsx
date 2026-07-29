import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import ReportFormPage from './pages/ReportFormPage'
import CreateWebhookPage from './pages/CreateWebhookPage'
import ViewIdTablePage from './pages/ViewIdTablePage'
import './App.css'

function App() {
  const [agency, setAgency] = useState('')

  return (
    <Routes>
      <Route path="/" element={<LandingPage setAgency={setAgency} />} />
      <Route element={<Layout agency={agency} setAgency={setAgency} />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/form" element={<ReportFormPage />} />
        <Route path="/webhook" element={<CreateWebhookPage />} />
        <Route path="/id-table" element={<ViewIdTablePage />} />
      </Route>
    </Routes>
  )
}

export default App