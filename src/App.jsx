import { BrowserRouter, Routes, Route } from 'react-router-dom'
import EnquiryForm from './pages/EnquiryForm'
import ThankYou from './pages/ThankYou'
import AdminDashboard from './pages/AdminDashboard'
import DailyReport from './pages/DailyReport'
import Navbar from './components/Navbar'

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<EnquiryForm />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/report" element={<DailyReport />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
