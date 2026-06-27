import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ExpensesPage } from './pages/ExpensesPage'
import { CapitalPage } from './pages/CapitalPage'

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/expenses" replace />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/capital" element={<CapitalPage />} />
          <Route path="*" element={<Navigate to="/expenses" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}
