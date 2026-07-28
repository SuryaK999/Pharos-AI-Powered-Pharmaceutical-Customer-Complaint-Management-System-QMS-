import { Routes, Route } from 'react-router-dom'
import AppShell from './components/AppShell'
import Dashboard from './pages/Dashboard'
import Complaints from './pages/Complaints'
import NewComplaint from './pages/NewComplaint'
import ComplaintDetail from './pages/ComplaintDetail'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/complaints/new" element={<NewComplaint />} />
        <Route path="/complaints/:id" element={<ComplaintDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  )
}
